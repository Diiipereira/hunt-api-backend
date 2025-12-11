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

  async findAllSlots(active: string) {
    const where: { active?: boolean } = {};

    if (active === 'false') {
      where.active = false;
    } else if (active === 'true') {
      where.active = true;
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
}
