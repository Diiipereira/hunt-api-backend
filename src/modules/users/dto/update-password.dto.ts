import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  currentPassword?: string;

  @IsString()
  @MinLength(6, {
    message: 'The new password must contain at least 6 characters',
  })
  newPassword?: string;
}
