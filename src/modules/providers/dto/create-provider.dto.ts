import { IsBoolean, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    description: 'Name of the provider',
    example: 'Pragmatic Play',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Whether the provider is active or not',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active: boolean;

  @ApiPropertyOptional({
    description: 'URL of the provider logo/image',
    example: 'https://example.com/provider-logo.png',
  })
  @IsOptional()
  @IsString()
  image?: string;
}

