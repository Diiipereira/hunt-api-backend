import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'usuário123',
    description: 'Nome único do usuário',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: 'email@exemplo.com',
    description: 'E-mail do usuário',
  })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha de acesso',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, {
    message: 'This password must contain at least 6 characters',
  })
  password: string;
}
