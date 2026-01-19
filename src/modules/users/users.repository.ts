import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { UserRole } from 'generated/prisma/client';

export interface UpdateUserParams {
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
  passwordHash?: string;
  avatar?: string;
  lastLogin?: Date;
  refreshTokenHash?: string | null;
}

export type SafeUser = {
  id: string;
  userName: string;
  email: string;
  createdAt: Date;
  avatar?: string | null;
  lastLogin?: Date | null;
  role?: UserRole;
};

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        userName: true,
        email: true,
        passwordHash: true,
        avatar: true,
        createdAt: true,
        lastLogin: true,
        role: true,
      },
    });
  }

  async findByUserName(userName: string) {
    return this.prisma.user.findUnique({
      where: { userName },
      select: { id: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        userName: true,
        email: true,
        avatar: true,
        lastLogin: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async createUser(data: {
    userName: string;
    email: string;
    passwordHash: string;
  }): Promise<SafeUser> {
    return this.prisma.user.create({
      data,
      select: {
        id: true,
        userName: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        userName: true,
        email: true,
        avatar: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByWithPassword(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        passwordHash: true,
      },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: {
        id: true,
        updatedAt: true,
      },
    });
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
      select: { lastLogin: true },
    });
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: refreshTokenHash },
    });
  }

  async findByIdForAuth(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        refreshTokenHash: true,
        role: true,
      },
    });
  }

  async update(id: string, data: UpdateUserParams) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        updatedAt: true,
      },
    });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: { resetToken: token },
      select: {
        id: true,
        email: true,
        resetTokenExpires: true,
      },
    });
  }
}
