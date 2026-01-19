import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SlotsService } from './slots.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/client';
import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import { User } from 'src/core/auth/decorators/user.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Slots')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('slots')
export class SlotsController {
  constructor(private readonly slotsService: SlotsService) { }

  @Get()
  @ApiOperation({ summary: 'List all slots' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  @ApiResponse({
    status: 200,
    description: 'List of slots retrieved successfully.',
  })
  async findAllSlots(@Query('active') active: string) {
    return this.slotsService.findAllSlots(active);
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new slot (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The slot has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async createSlot(@Body() createSlotDto: CreateSlotDto) {
    return this.slotsService.createSlot(createSlotDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a slot (Admin only)' })
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiResponse({
    status: 200,
    description: 'The slot has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Slot not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async updateSlot(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSlotDto: UpdateSlotDto,
  ) {
    return this.slotsService.updateSlot(id, updateSlotDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle slot active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiResponse({
    status: 200,
    description: 'Slot status updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Slot not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async activateSlot(@Param('id', ParseUUIDPipe) id: string) {
    return this.slotsService.activateSlot(id);
  }

  @Patch('provider/:providerId/activate-all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate all slots by provider (Admin only)' })
  @ApiParam({ name: 'providerId', description: 'Provider UUID' })
  @ApiResponse({
    status: 200,
    description: 'All slots for the provider have been enabled.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async activateAllByProvider(@Param('providerId') providerId: string) {
    return this.slotsService.activateAllByProvider(providerId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a slot (Admin only)' })
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiResponse({
    status: 200,
    description: 'Slot has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Slot not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async softDeleteSlot(@Param('id', ParseUUIDPipe) id: string) {
    return this.slotsService.softDeleteSlot(id);
  }
  @Get('favorites')
  @ApiOperation({ summary: 'List user favorite slots' })
  @ApiResponse({
    status: 200,
    description: 'List of favorite slots retrieved successfully.',
  })
  async findAllFavorites(@User('id') userId: string) {
    return this.slotsService.findAllFavorites(userId);
  }

  @Post(':id/favorite')
  @ApiOperation({ summary: 'Toggle slot favorite status' })
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiResponse({
    status: 200,
    description: 'Slot favorite status toggled successfully.',
  })
  @ApiResponse({ status: 404, description: 'Slot not found.' })
  async toggleFavorite(
    @User('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.slotsService.toggleFavorite(userId, id);
  }
}
