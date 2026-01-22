import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

export type SafeProvider = {
  id: string;
  name: string;
  active: boolean;
  image: string | null;
  createdAt: Date;
  _count?: {
    slots: number;
  };
};

@Injectable()
export class ProvidersRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createProvider(data: {
    name: string;
    active: boolean;
    image?: string;
  }): Promise<SafeProvider> {
    return this.prisma.provider.create({
      data,
      select: {
        id: true,
        name: true,
        active: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async findByName(name: string) {
    return this.prisma.provider.findFirst({
      where: { name },
      select: { id: true },
    });
  }

  async findAllProviders(where: { active?: boolean }): Promise<SafeProvider[]> {
    return this.prisma.provider.findMany({
      where: where,
      select: {
        id: true,
        name: true,
        active: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            slots: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.provider.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        active: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async updateProvider(
    id: string,
    data: { name?: string; image?: string },
  ): Promise<SafeProvider> {
    return this.prisma.provider.update({
      where: { id },
      data: data,
      select: {
        id: true,
        name: true,
        active: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async updateStatusProvider(
    id: string,
    data: { active: boolean },
  ): Promise<SafeProvider> {
    return this.prisma.provider.update({
      where: { id },
      data: data,
      select: {
        id: true,
        name: true,
        active: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async softDeleteProviderWithSlots(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.provider.update({
        where: { id },
        data: { active: false },
      }),

      this.prisma.slot.updateMany({
        where: { providerId: id },
        data: { active: false },
      }),
    ]);
  }
}
