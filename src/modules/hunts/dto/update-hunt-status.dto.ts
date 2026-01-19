import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { HuntStatus } from 'generated/prisma/client';

export class UpdateHuntStatusDto {
    @ApiProperty({
        description: 'New status for the hunt',
        enum: HuntStatus,
        example: HuntStatus.FINISHED,
    })
    @IsEnum(HuntStatus)
    @IsNotEmpty()
    status: HuntStatus;
}
