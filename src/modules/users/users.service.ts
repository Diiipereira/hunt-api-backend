import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { UpdateUserParams, UsersRepository } from './users.repository';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  private buildSafeUser(user: any, extra?: Record<string, any>) {
    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar ?? null,
      lastLogin: user.lastLogin ?? null,
      createdAt: user.createdAt,
      role: user.role,
      ...extra,
    };
  }

  async signup(signupDto: SignupDto) {
    const [emailExists, userNameExists] = await Promise.all([
      this.usersRepository.findByEmail(signupDto.email),
      this.usersRepository.findByUserName(signupDto.userName),
    ]);

    if (emailExists || userNameExists) {
      const conflicts: string[] = [];
      if (emailExists) conflicts.push('This e-mail is already in use');
      if (userNameExists) conflicts.push('This username is already in use');
      throw new ConflictException(conflicts);
    }

    const passwordHash = await bcrypt.hash(signupDto.password, 12);

    const user = await this.usersRepository.createUser({
      userName: signupDto.userName,
      email: signupDto.email,
      passwordHash,
    });

    return this.buildSafeUser(user);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async update(id: string, data: UpdateUserParams) {
    return this.usersRepository.update(id, data);
  }

  async findByResetToken(token: string) {
    return this.usersRepository.findByResetToken(token);
  }

  async findUsersWithValidResetToken() {
    return this.usersRepository.findUsersWithValidResetToken();
  }

  async findByEmailForAuth(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findByIdForAuth(id: string) {
    return this.usersRepository.findByIdForAuth(id);
  }

  async updateRefreshToken(userId: string, rtHash: string | null) {
    await this.usersRepository.updateRefreshToken(userId, rtHash);
  }

  async updateLastLogin(userId: string) {
    await this.usersRepository.updateLastLogin(userId);
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.buildSafeUser(user, {
      avatar: user.avatar ? `${process.env.APP_URL}${user.avatar}` : null,
    });
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('You need to upload an image');
    }

    if (file.size > 3 * 1024 * 1024) {
      await unlink(file.path);
      throw new BadRequestException(
        'Image file too large. Maximum size is 3MB.',
      );
    }

    const user = await this.usersRepository.findById(userId);
    if (user && user.avatar) {
      const oldAvatarPath = join(process.cwd(), 'public', user.avatar);
      if (existsSync(oldAvatarPath)) {
        try {
          await unlink(oldAvatarPath);
        } catch (error) {
          this.logger.warn(`Failed to delete old avatar: ${oldAvatarPath}`);
        }
      }
    }

    const avatarPath = `/assets/avatars/${file.filename}`;
    const updated = await this.usersRepository.updateAvatar(userId, avatarPath);

    this.logger.log(`Avatar updated for user: ${userId}`);

    return this.buildSafeUser(updated, {
      avatar: `${process.env.APP_URL}${avatarPath}`,
    });
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword } = updatePasswordDto;

    const user = await this.usersRepository.findByWithPassword(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from the current one',
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.updatePassword(userId, newHash);
    await this.usersRepository.updateRefreshToken(userId, null);

    this.logger.log(`Password updated for user: ${userId}`);

    return { message: 'Password updated successfully' };
  }

  async incrementLoginAttempts(userId: string): Promise<number> {
    return this.usersRepository.incrementLoginAttempts(userId);
  }

  async resetLoginAttempts(userId: string) {
    return this.usersRepository.resetLoginAttempts(userId);
  }

  async lockAccount(userId: string, lockedUntil: Date) {
    return this.usersRepository.lockAccount(userId, lockedUntil);
  }
}
