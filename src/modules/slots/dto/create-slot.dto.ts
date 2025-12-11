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

export class CreateSlotDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  providerId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsDecimal()
  rtp: string;

  @IsEnum(SlotVolatility)
  @IsNotEmpty()
  volatility: SlotVolatility;

  @IsInt()
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  maxMultiplier: number;
}
