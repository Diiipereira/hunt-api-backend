import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateHuntDto {
    @ApiProperty({
        description: 'Starting balance for the bonus hunt',
        example: 5000.00,
    })
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    startBalance: number;
}
