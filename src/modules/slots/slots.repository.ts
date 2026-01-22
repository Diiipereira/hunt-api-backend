import { Injectable } from '@nestjs/common';
import { SlotVolatility } from 'generated/prisma/enums';
import { PrismaService } from 'src/core/database/prisma.service';

export type SafeSlot = {
  id: string;
  providerId: string;
  name: string;
  active: boolean;
  rtp: string | null;
  volatility: SlotVolatility;
  maxMultiplier: number;
  image: string | null;
};

@Injectable()
export class SlotsRepository {
  constructor(private readonly prisma: PrismaService) { }

  async createSlot(data: {
    providerId: string;
    name: string;
    active: boolean;
    rtp: string;
    volatility: SlotVolatility;
    maxMultiplier: number;
    image?: string;
  }): Promise<SafeSlot> {
    const created = await this.prisma.slot.create({
      data,
      select: {
        id: true,
        providerId: true,
        name: true,
        active: true,
        rtp: true,
        volatility: true,
        maxMultiplier: true,
        image: true,
      },
    });

    return {
      ...created,
      rtp: created.rtp ? created.rtp.toString() : null,
    };
  }

  async findByName(name: string) {
    return this.prisma.slot.findFirst({
      where: { name },
      select: {
        id: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.slot.findUnique({
      where: { id },
    });
  }

  async findAllSlots(
    where: {
      active?: boolean;
      providerId?: string;
    },
    options?: { skip?: number; take?: number },
  ): Promise<SafeSlot[]> {
    const slots = await this.prisma.slot.findMany({
      where: where,
      select: {
        id: true,
        providerId: true,
        name: true,
        active: true,
        rtp: true,
        volatility: true,
        maxMultiplier: true,
        image: true,
        providers: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...options,
    });
    return slots.map((slot) => ({
      ...slot,
      rtp: slot.rtp ? slot.rtp.toString() : null,
    }));
  }

  async count(where: { active?: boolean; providerId?: string }) {
    return this.prisma.slot.count({ where });
  }

  async updateSlot(
    id: string,
    data: {
      name?: string;
      rtp?: string;
      slotVolatility?: SlotVolatility;
      maxMultiplier?: number;
      image?: string;
    },
  ): Promise<SafeSlot> {
    const updated = await this.prisma.slot.update({
      where: { id },
      data: data,
      select: {
        id: true,
        providerId: true,
        name: true,
        active: true,
        rtp: true,
        volatility: true,
        maxMultiplier: true,
        image: true,
      },
    });

    return {
      ...updated,
      rtp: updated.rtp ? updated.rtp.toString() : null,
    };
  }

  async updateStatusSlot(
    id: string,
    data: { active: boolean },
  ): Promise<SafeSlot> {
    const updated = await this.prisma.slot.update({
      where: { id },
      data: data,
      select: {
        id: true,
        providerId: true,
        name: true,
        active: true,
        rtp: true,
        volatility: true,
        maxMultiplier: true,
        image: true,
      },
    });

    return {
      ...updated,
      rtp: updated.rtp ? updated.rtp.toString() : null,
    };
  }

  async updateManyStatusByProvider(providerId: string, status: boolean) {
    return this.prisma.slot.updateMany({
      where: { providerId },
      data: { active: status },
    });
  }
  async toggleFavorite(userId: string, slotId: string) {
    const existing = await this.prisma.userFavoriteSlot.findUnique({
      where: {
        userId_slotId: {
          userId,
          slotId,
        },
      },
    });

    if (existing) {
      await this.prisma.userFavoriteSlot.delete({
        where: {
          userId_slotId: {
            userId,
            slotId,
          },
        },
      });
      return { message: 'Removed from favorites', isFavorite: false };
    } else {
      await this.prisma.userFavoriteSlot.create({
        data: {
          userId,
          slotId,
        },
      });
      return { message: 'Added to favorites', isFavorite: true };
    }
  }

  async findFavorites(userId: string) {
    const favorites = await this.prisma.userFavoriteSlot.findMany({
      where: { userId },
      include: {
        slots: {
          include: {
            providers: {
              select: { name: true },
            },
          },
        },
      },
    });

    return favorites.map((fav) => ({
      ...fav.slots,
      providerName: fav.slots.providers.name,
      rtp: fav.slots.rtp ? fav.slots.rtp.toString() : null,
      favoritedAt: fav.createdAt,
    }));
  }
}
