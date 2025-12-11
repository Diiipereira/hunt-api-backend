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
};

@Injectable()
export class SlotsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSlot(data: {
    providerId: string;
    name: string;
    active: boolean;
    rtp: string;
    volatility: SlotVolatility;
    maxMultiplier: number;
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

  async findAllSlots(where: {
    active?: boolean;
    providerId?: string;
  }): Promise<SafeSlot[]> {
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
        providers: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return slots.map((slot) => ({
      ...slot,
      rtp: slot.rtp ? slot.rtp.toString() : null,
    }));
  }

  async updateSlot(
    id: string,
    data: {
      name?: string;
      rtp?: string;
      slotVolatility?: SlotVolatility;
      maxMultiplier?: number;
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
}
