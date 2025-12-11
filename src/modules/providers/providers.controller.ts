import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  async findAllProviders(@Query('active') active: string) {
    return this.providersService.findAllProviders(active);
  }

  @Post('create')
  async createProvider(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.createProvider(createProviderDto);
  }

  @Patch(':id')
  async updateProvider(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providersService.updateProvider(id, updateProviderDto);
  }

  @Patch(':id/activate')
  async activateProvider(@Param('id') id: string) {
    return this.providersService.activateProvider(id);
  }

  @Delete(':id')
  async softDeleteProvider(@Param('id') id: string) {
    return this.providersService.softDeleteProvider(id);
  }
}
