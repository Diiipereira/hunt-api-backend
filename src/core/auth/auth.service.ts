import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { SigninDto } from 'src/core/auth/dto/signin.dto';
import { SignupDto } from 'src/modules/users/dto/signup.dto';
import { UsersService } from 'src/modules/users/users.service';
import { MailService } from 'src/mail/mail.service';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async signup(signupDto: SignupDto): Promise<Tokens> {
    const user = await this.usersService.signup(signupDto);
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);
    return tokens;
  }

  async signin(signinDto: SigninDto): Promise<Tokens> {
    const user = await this.usersService.findByEmailForAuth(signinDto.email);

    if (!user) throw new UnauthorizedException('Invalid Credentials');

    const isPasswordValid = await bcrypt.compare(
      signinDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid Credentials');

    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 600000);

      await this.usersService.update(user.id, {
        resetToken: resetToken,
        resetTokenExpires: expiresAt,
      });

      await this.mailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.userName,
      );
    }

    return {
      message:
        'If you email address is registered, you will receive a recovery link shortly',
    };
  }

  async logout(userId: string) {
    if (userId) {
      await this.usersService.updateRefreshToken(userId, null);
    }
    return { message: 'Logout Successful' };
  }

  async refreshTokens(userId: string, rt: string): Promise<Tokens> {
    const user = await this.usersService.findByIdForAuth(userId);

    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Access Denied - User not found or no RT');

    const rtMatches = await bcrypt.compare(rt, user.refreshTokenHash);
    if (!rtMatches) throw new ForbiddenException('Access Denied - Invalid RT');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new NotFoundException('Invalid Token');
    }

    if (user.resetTokenExpires && new Date() > user.resetTokenExpires) {
      throw new BadRequestException(
        'The token has expired. Please request a new one',
      );
    }

    const hash = await bcrypt.hash(newPassword, 12);

    await this.usersService.update(user.id, {
      passwordHash: hash,
      resetToken: null,
      resetTokenExpires: null,
    });

    return { message: 'Password changed successssfully! You can now log in.' };
  }

  private async updateRtHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 12);
    await this.usersService.updateRefreshToken(userId, hash);
  }

  private async getTokens(userId: string, email: string): Promise<Tokens> {
    interface JwtPayload {
      sub: string;
      email: string;
    }

    const payload: JwtPayload = { sub: userId, email };

    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
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
        secret,
        expiresIn: rtExpiration as any,
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
