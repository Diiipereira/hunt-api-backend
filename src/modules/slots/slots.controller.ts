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
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';

@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) {}

  @Get()
  async findAllSlots(@Query('active') active: string) {
    return this.slotsService.findAllSlots(active);
  }

  @Post('create')
  async createSlot(@Body() createSlotDto: CreateSlotDto) {
    return this.slotsService.createSlot(createSlotDto);
  }

  @Patch(':id')
  async updateSlot(
    @Param('id') id: string,
    @Body() updateSlotDto: UpdateSlotDto,
  ) {
    return this.slotsService.updateSlot(id, updateSlotDto);
  }

  @Patch(':id/activate')
  async activateSlot(@Param('id') id: string) {
    return this.slotsService.activateSlot(id);
  }

  @Patch('provider/:providerId/activate-all')
  async activateAllByProvider(@Param('providerId') providerId: string) {
    return this.slotsService.activateAllByProvider(providerId);
  }

  @Delete(':id')
  async softDeleteSlot(@Param('id') id: string) {
    return this.slotsService.softDeleteSlot(id);
  }
}
