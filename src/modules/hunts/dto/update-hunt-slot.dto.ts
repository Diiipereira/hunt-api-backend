import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateHuntSlotDto {
    @ApiProperty({
        description: 'The win amount (if bonus is opened)',
        example: 150.50,
        required: false,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    winAmount?: number;

    @ApiProperty({
        description: 'Mark the bonus as opened',
        example: true,
        required: false,
    })
    @IsBoolean()
    @IsOptional()
    isOpened?: boolean;
}
