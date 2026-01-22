import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SlotsRepository } from './slots.repository';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { ProvidersRepository } from '../providers/providers.repository';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';

@Injectable()
export class SlotsService {
  constructor(
    private readonly slotsRepository: SlotsRepository,
    private readonly providersRepository: ProvidersRepository,
  ) {}

  async createSlot(createSlotDto: CreateSlotDto) {
    const slotExists = await this.slotsRepository.findByName(
      createSlotDto.name,
    );

    if (slotExists) {
      throw new ConflictException('A slot with this name already exists');
    }

    const provider = await this.providersRepository.findById(
      createSlotDto.providerId,
    );

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    if (!provider.active) {
      throw new BadRequestException('Cannot add slot to an inactive provider');
    }

    return this.slotsRepository.createSlot({
      ...createSlotDto,
      active: true,
    });
  }

  async findAllSlots(
    active: string,
    pagination?: PaginationDto,
  ): Promise<PaginatedResponse<any> | any[]> {
    const where: { active?: boolean } = {};

    if (active === 'false') {
      where.active = false;
    } else if (active === 'true') {
      where.active = true;
    }

    if (pagination && pagination.page && pagination.limit) {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.slotsRepository.findAllSlots(where, { skip, take: limit }),
        this.slotsRepository.count(where),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    }

    return this.slotsRepository.findAllSlots(where);
  }

  async updateSlot(id: string, updateSlotDto: UpdateSlotDto) {
    const slotToUpdate = await this.slotsRepository.findById(id);

    if (!slotToUpdate) {
      throw new NotFoundException('Slot not found');
    }

    if (updateSlotDto.name) {
      const slotWithSameName = await this.slotsRepository.findByName(
        updateSlotDto.name,
      );

      if (slotWithSameName && slotWithSameName.id !== id) {
        throw new ConflictException('A slot with this name already exists');
      }
    }

    return this.slotsRepository.updateSlot(id, updateSlotDto);
  }

  async softDeleteSlot(id: string) {
    const statusToUpdate = await this.slotsRepository.findById(id);

    if (!statusToUpdate) {
      throw new NotFoundException('Slot not found');
    }

    return this.slotsRepository.updateStatusSlot(id, { active: false });
  }

  async activateSlot(id: string) {
    const statusToUpdate = await this.slotsRepository.findById(id);

    if (!statusToUpdate) {
      throw new NotFoundException('Slot not found');
    }

    return this.slotsRepository.updateStatusSlot(id, { active: true });
  }

  async activateAllByProvider(providerId: string) {
    const provider = await this.providersRepository.findById(providerId);

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    if (!provider.active) {
      throw new BadRequestException('Activate the provider first');
    }

    await this.slotsRepository.updateManyStatusByProvider(providerId, true);

    return { message: 'All slots for this provider have been activated' };
  }

  async toggleFavorite(userId: string, slotId: string) {
    const slot = await this.slotsRepository.findById(slotId);
    if (!slot) {
      throw new NotFoundException('Slot not found');
    }
    return this.slotsRepository.toggleFavorite(userId, slotId);
  }

  async findAllFavorites(userId: string) {
    return this.slotsRepository.findFavorites(userId);
  }
}
