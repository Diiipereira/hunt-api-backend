import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'email@exemplo.com',
    description: 'E-mail para recuperação',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
