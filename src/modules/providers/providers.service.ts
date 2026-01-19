import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProvidersRepository } from './providers.repository';
import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly providersRepository: ProvidersRepository) { }

  async createProvider(createProviderDto: CreateProviderDto) {
    const providerExists = await this.providersRepository.findByName(
      createProviderDto.name,
    );

    if (providerExists) {
      throw new ConflictException('A provider with this name already exists');
    }

    const dataToSave = {
      name: createProviderDto.name,
      active: true,
    };

    return this.providersRepository.createProvider(dataToSave);
  }

  async findAllProviders(active: string) {
    const where: { active?: boolean } = {};

    if (active === 'false') {
      where.active = false;
    } else if (active === 'true') {
      where.active = true;
    }

    return this.providersRepository.findAllProviders(where);
  }

  async updateProvider(id: string, updateProviderDto: UpdateProviderDto) {
    const { name } = updateProviderDto;

    const providerToUpdate = await this.providersRepository.findById(id);

    if (!providerToUpdate) {
      throw new NotFoundException('Provider not found');
    }

    if (name) {
      const providerExists = await this.providersRepository.findByName(name);

      if (providerExists && providerExists.id !== id) {
        throw new ConflictException(
          'A provider whith this name already exists',
        );
      }
    }

    return this.providersRepository.updateProvider(id, updateProviderDto);
  }

  async softDeleteProvider(id: string) {
    const statusToUpdate = await this.providersRepository.findById(id);

    if (!statusToUpdate) {
      throw new NotFoundException('Provider not found');
    }

    await this.providersRepository.softDeleteProviderWithSlots(id);

    return { message: 'Provider and related slots deactivated successfully' };
  }

  async activateProvider(id: string) {
    const statusToUpdate = await this.providersRepository.findById(id);

    if (!statusToUpdate) {
      throw new NotFoundException('Provider not found');
    }

    return this.providersRepository.updateStatusProvider(id, { active: true });
  }
}
