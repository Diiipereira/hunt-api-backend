import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { UpdateUserParams, UsersRepository } from './users.repository';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private buildSafeUser(user: any, extra?: Record<string, any>) {
    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      avatar: user.avatar ?? null,
      lastLogin: user.lastLogin ?? null,
      createdAt: user.createdAt,
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

    const avatarPath = `/assets/avatars/${file.filename}`;
    const updated = await this.usersRepository.updateAvatar(userId, avatarPath);

    return this.buildSafeUser(updated, {
      avatar: `${process.env.APP_URL}${avatarPath}`,
    });
  }

  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { currentPassword, newPassword } = updatePasswordDto;

    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Both current and new passwords are required',
      );
    }

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

    return { message: 'Password updated successfully' };
  }
}
