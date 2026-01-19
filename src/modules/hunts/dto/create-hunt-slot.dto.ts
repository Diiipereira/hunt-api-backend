import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateHuntSlotDto {
    @ApiProperty({
        description: 'The ID of the slot game',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    slotId: string;

    @ApiProperty({
        description: 'The bet amount for this bonus',
        example: 5.00,
    })
    @IsNumber()
    @IsPositive()
    @IsNotEmpty()
    betAmount: number;
}
