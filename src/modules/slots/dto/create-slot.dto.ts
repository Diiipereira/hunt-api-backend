import {
  IsDecimal,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { SlotVolatility } from '../enums/slot-volatility.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty({
    description: 'The ID of the provider',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'The name of the slot game',
    example: 'Sweet Bonanza',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The RTP (Return to Player) percentage',
    example: '96.51',
  })
  @IsString()
  @IsNotEmpty()
  @IsDecimal()
  rtp: string;

  @ApiProperty({
    description: 'The volatility of the slot',
    enum: SlotVolatility,
    example: SlotVolatility.HIGH,
  })
  @IsEnum(SlotVolatility)
  @IsNotEmpty()
  volatility: SlotVolatility;

  @ApiProperty({
    description: 'The maximum multiplier of the slot',
    example: 21100,
  })
  @IsInt()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxMultiplier: number;
}
