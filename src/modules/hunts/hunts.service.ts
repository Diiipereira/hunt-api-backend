import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateHuntDto } from './dto/create-hunt.dto';
import { CreateHuntSlotDto } from './dto/create-hunt-slot.dto';
import { UpdateHuntSlotDto } from './dto/update-hunt-slot.dto';
import { HuntStatus } from 'generated/prisma/client';

@Injectable()
export class HuntsService {
  private readonly logger = new Logger(HuntsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createHunt(userId: string, createHuntDto: CreateHuntDto) {
    await this.prisma.currency.upsert({
      where: { code: 'BRL' },
      update: {},
      create: {
        code: 'BRL',
        name: 'Brazilian Real',
        symbol: 'R$',
      },
    });

    const hunt = await this.prisma.hunt.create({
      data: {
        userId,
        startBalance: createHuntDto.startBalance,
        currencyCode: 'BRL',
        status: HuntStatus.ACTIVE,
        totalSlots: 0,
        totalBet: 0,
        totalWin: 0,
      },
    });

    this.logger.log(`Hunt created: ${hunt.id} by user: ${userId}`);
    return hunt;
  }

  async findAll(userId: string) {
    return this.prisma.hunt.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        huntSlots: true,
      },
    });
  }

  async updateStatus(id: string, userId: string, status: HuntStatus) {
    const hunt = await this.prisma.hunt.findUnique({
      where: { id },
    });

    if (!hunt) {
      throw new NotFoundException('Hunt not found');
    }

    if (hunt.userId !== userId) {
      throw new ForbiddenException('You can only update your own hunts');
    }

    const data: any = { status };

    if (status === HuntStatus.FINISHED) {
      data.finishedAt = new Date();
    }

    const updated = await this.prisma.hunt.update({
      where: { id },
      data,
    });

    this.logger.log(`Hunt ${id} status updated to ${status}`);
    return updated;
  }

  async addBonus(huntId: string, userId: string, dto: CreateHuntSlotDto) {
    await this.verifyHuntOwnership(huntId, userId);

    const slot = await this.prisma.slot.findUnique({
      where: { id: dto.slotId },
      include: { providers: true },
    });

    if (!slot) {
      throw new NotFoundException('Slot not found');
    }

    if (!slot.active) {
      throw new BadRequestException('Cannot add inactive slot to hunt');
    }

    if (!slot.providers.active) {
      throw new BadRequestException('Cannot add slot from inactive provider');
    }

    const bonus = await this.prisma.huntSlot.create({
      data: {
        huntId,
        slotId: dto.slotId,
        betAmount: dto.betAmount,
        winAmount: 0,
      },
    });

    await this.updateHuntStats(huntId);

    this.logger.log(`Bonus added to hunt ${huntId}: ${bonus.id}`);
    return bonus;
  }

  async updateBonus(bonusId: string, userId: string, dto: UpdateHuntSlotDto) {
    const bonus = await this.prisma.huntSlot.findUnique({
      where: { id: bonusId },
      include: { hunts: true },
    });

    if (!bonus) throw new NotFoundException('Bonus not found');
    if (bonus.hunts.userId !== userId)
      throw new ForbiddenException('Access denied');

    const updatedBonus = await this.prisma.huntSlot.update({
      where: { id: bonusId },
      data: {
        ...dto,
      },
    });

    await this.updateHuntStats(bonus.huntId);

    this.logger.log(`Bonus updated: ${bonusId}`);
    return updatedBonus;
  }

  async deleteBonus(bonusId: string, userId: string) {
    const bonus = await this.prisma.huntSlot.findUnique({
      where: { id: bonusId },
      include: { hunts: true },
    });

    if (!bonus) throw new NotFoundException('Bonus not found');
    if (bonus.hunts.userId !== userId)
      throw new ForbiddenException('Access denied');

    const deletedBonus = await this.prisma.huntSlot.delete({
      where: { id: bonusId },
    });

    await this.updateHuntStats(bonus.huntId);

    this.logger.log(`Bonus deleted: ${bonusId}`);
    return deletedBonus;
  }

  private async updateHuntStats(huntId: string) {
    const aggregates = await this.prisma.huntSlot.aggregate({
      where: { huntId },
      _sum: {
        betAmount: true,
        winAmount: true,
      },
      _count: {
        id: true,
      },
    });

    await this.prisma.hunt.update({
      where: { id: huntId },
      data: {
        totalBet: aggregates._sum.betAmount || 0,
        totalWin: aggregates._sum.winAmount || 0,
        totalSlots: aggregates._count.id || 0,
      },
    });
  }

  private async verifyHuntOwnership(huntId: string, userId: string) {
    const hunt = await this.prisma.hunt.findUnique({ where: { id: huntId } });
    if (!hunt) throw new NotFoundException('Hunt not found');
    if (hunt.userId !== userId)
      throw new ForbiddenException('You do not own this hunt');
  }
}
