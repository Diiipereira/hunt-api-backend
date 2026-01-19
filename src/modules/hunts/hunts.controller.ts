import {
    Body,
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    ParseUUIDPipe,
} from '@nestjs/common';
import { HuntsService } from './hunts.service';
import { CreateHuntDto } from './dto/create-hunt.dto';
import { CreateHuntSlotDto } from './dto/create-hunt-slot.dto';
import { UpdateHuntSlotDto } from './dto/update-hunt-slot.dto';
import { UpdateHuntStatusDto } from './dto/update-hunt-status.dto';
import { User } from 'src/core/auth/decorators/user.decorator';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

@ApiTags('Hunts')
@ApiBearerAuth()
@Controller('hunts')
export class HuntsController {
    constructor(private readonly huntsService: HuntsService) { }

    @Post()
    @ApiOperation({ summary: 'Start a new Bonus Hunt (BRL)' })
    @ApiResponse({ status: 201, description: 'Hunt created successfully.' })
    async createHunt(
        @User('id') userId: string,
        @Body() createHuntDto: CreateHuntDto,
    ) {
        return this.huntsService.createHunt(userId, createHuntDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all user hunts' })
    @ApiResponse({
        status: 200,
        description: 'List of hunts retrieved successfully.',
    })
    async findAll(@User('id') userId: string) {
        return this.huntsService.findAll(userId);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update hunt status (Review/Active/Finished)' })
    @ApiResponse({ status: 200, description: 'Status updated successfully.' })
    async updateStatus(
        @User('id') userId: string,
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateHuntStatusDto: UpdateHuntStatusDto,
    ) {
        return this.huntsService.updateStatus(
            id,
            userId,
            updateHuntStatusDto.status,
        );
    }

    @Post(':id/bonuses')
    @ApiOperation({ summary: 'Add a bonus (slot) to the hunt' })
    @ApiResponse({ status: 201, description: 'Bonus added successfully.' })
    async addBonus(
        @User('id') userId: string,
        @Param('id', ParseUUIDPipe) huntId: string,
        @Body() createHuntSlotDto: CreateHuntSlotDto,
    ) {
        return this.huntsService.addBonus(huntId, userId, createHuntSlotDto);
    }

    @Patch('bonuses/:id')
    @ApiOperation({ summary: 'Update bonus result (win amount)' })
    @ApiResponse({ status: 200, description: 'Bonus updated successfully.' })
    async updateBonus(
        @User('id') userId: string,
        @Param('id', ParseUUIDPipe) bonusId: string,
        @Body() updateHuntSlotDto: UpdateHuntSlotDto,
    ) {
        return this.huntsService.updateBonus(bonusId, userId, updateHuntSlotDto);
    }

    @Delete('bonuses/:id')
    @ApiOperation({ summary: 'Remove a bonus from the hunt' })
    @ApiResponse({ status: 200, description: 'Bonus removed successfully.' })
    async deleteBonus(
        @User('id') userId: string,
        @Param('id', ParseUUIDPipe) bonusId: string,
    ) {
        return this.huntsService.deleteBonus(bonusId, userId);
    }
}
