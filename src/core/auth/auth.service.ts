import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SigninDto } from 'src/core/auth/dto/signin.dto';
import { SignupDto } from 'src/modules/users/dto/signup.dto';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { AuditService } from 'src/common/services/audit.service';
import { AuditAction } from 'generated/prisma/client';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 15 * 60 * 1000;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  async signup(
    signupDto: SignupDto,
    ip?: string,
    userAgent?: string,
  ): Promise<Tokens> {
    const user = await this.usersService.signup(signupDto);
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);
    await this.auditService.log(AuditAction.SIGNUP, user.id, ip, userAgent);
    this.logger.log(`New user registered: ${user.email}`);
    return tokens;
  }

  async signin(
    signinDto: SigninDto,
    ip?: string,
    userAgent?: string,
  ): Promise<Tokens> {
    const startTime = Date.now();
    const user = await this.usersService.findByEmailForAuth(signinDto.email);

    if (!user) {
      await this.constantTimeDelay(startTime);
      throw new UnauthorizedException('Invalid Credentials');
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
      const remainingTime = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000 / 60,
      );
      throw new UnauthorizedException(
        `Account locked. Try again in ${remainingTime} minutes`,
      );
    }

    const isPasswordValid = await bcrypt.compare(
      signinDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      await this.handleFailedLogin(user.id, signinDto.email, ip, userAgent);
      await this.constantTimeDelay(startTime);
      throw new UnauthorizedException('Invalid Credentials');
    }

    await this.usersService.resetLoginAttempts(user.id);
    await this.usersService.updateLastLogin(user.id);
    await this.auditService.log(AuditAction.LOGIN, user.id, ip, userAgent);

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);
    return tokens;
  }

  private async handleFailedLogin(
    userId: string,
    email: string,
    ip?: string,
    userAgent?: string,
  ) {
    const attempts = await this.usersService.incrementLoginAttempts(userId);

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + this.LOCK_TIME);
      await this.usersService.lockAccount(userId, lockedUntil);
      await this.auditService.log(
        AuditAction.ACCOUNT_LOCKED,
        userId,
        ip,
        userAgent,
        { reason: 'Max login attempts exceeded' },
      );
      this.logger.warn(`Account locked for user: ${email}`);
    } else {
      this.logger.warn(
        `Failed login attempt ${attempts}/${this.MAX_LOGIN_ATTEMPTS} for email: ${email}`,
      );
    }
  }

  async forgotPassword(email: string) {
    const startTime = Date.now();

    const user = await this.usersService.findByEmail(email);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 10);
      const expiresAt = new Date(Date.now() + 3600000);

      await this.usersService.update(user.id, {
        resetToken: hashedToken,
        resetTokenExpires: expiresAt,
      });

      await this.mailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.userName,
      );

      this.logger.log(`Password reset requested for: ${email}`);
    }

    await this.constantTimeDelay(startTime, 200);

    return {
      message:
        'If your email address is registered, you will receive a recovery link shortly',
    };
  }

  async logout(userId: string, ip?: string, userAgent?: string) {
    if (userId) {
      await this.usersService.updateRefreshToken(userId, null);
      await this.auditService.log(AuditAction.LOGOUT, userId, ip, userAgent);
      this.logger.log(`User logged out: ${userId}`);
    }
    return { message: 'Logout Successful' };
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.usersService.findByIdForAuth(userId);

    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Access Denied - User not found or no RT');

    const rtMatches = await bcrypt.compare(rt, user.refreshTokenHash);
    if (!rtMatches) throw new ForbiddenException('Access Denied - Invalid RT');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async resetPassword(
    token: string,
    newPassword: string,
    ip?: string,
    userAgent?: string,
  ) {
    const users = await this.usersService.findUsersWithValidResetToken();

    let matchedUser: {
      id: string;
      email: string;
      resetToken: string | null;
      resetTokenExpires: Date | null;
    } | null = null;

    for (const u of users) {
      if (u.resetToken && (await bcrypt.compare(token, u.resetToken))) {
        matchedUser = u;
        break;
      }
    }

    if (!matchedUser) {
      throw new NotFoundException('Invalid or expired token');
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await this.usersService.update(matchedUser.id, {
      passwordHash: hash,
      resetToken: null,
      resetTokenExpires: null,
      refreshTokenHash: null,
    });

    await this.auditService.log(
      AuditAction.PASSWORD_RESET,
      matchedUser.id,
      ip,
      userAgent,
    );

    this.logger.log(`Password reset successful for user: ${matchedUser.id}`);

    return { message: 'Password changed successfully! You can now log in.' };
  }

  private async updateRtHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 12);
    await this.usersService.updateRefreshToken(userId, hash);
  }

  private async getTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<Tokens> {
    interface JwtPayload {
      sub: string;
      email: string;
      role: string;
    }

    const payload: JwtPayload = { sub: userId, email, role };

    const secret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const atExpiration = this.configService.getOrThrow<string>(
      'JWT_ACCESS_EXPIRATION',
    );
    const rtExpiration = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRATION',
    );

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: atExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: rtExpiration as any,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  private async constantTimeDelay(startTime: number, minDelay: number = 200) {
    const elapsed = Date.now() - startTime;
    if (elapsed < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
    }
  }
}
