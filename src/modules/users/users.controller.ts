import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User } from 'src/core/auth/decorators/user.decorator';
import { multerConfig } from 'src/core/uploads/multer.config';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@User('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async updateAvatar(
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.updateAvatar(userId, file);
  }

  @Patch('me/password')
  async updatePassword(
    @User('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(userId, updatePasswordDto);
  }
}
