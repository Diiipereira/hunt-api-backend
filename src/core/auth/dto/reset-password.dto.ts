import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: '123456-abcdef-78901-ghijk',
    description: 'Token recebido no email',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  token: string;

  @ApiProperty({ example: 'NovaSenha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
