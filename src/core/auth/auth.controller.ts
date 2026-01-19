import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from 'src/core/auth/dto/signin.dto';
import { SignupDto } from 'src/modules/users/dto/signup.dto';
import { Public } from './decorators/public.decorator';
import { User } from './decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user account' })
  @ApiResponse({ status: 201, description: 'Account successfully created.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data (short password, invalid email, etc).',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Email or Username already in use.',
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
    schema: {
      example: {
        accessToken: 'eyjhbGci0iJTUz...',
        refreshToken: 'eyjhbGci0iJTUz...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials (wrong email or password).',
  })
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Password recovery' })
  @ApiResponse({
    status: 200,
    description: 'Recovery email sent successfully!',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully! You can now login.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  async logout(@User('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh user token' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refreshed successfully.',
    schema: {
      example: {
        accessToken: 'eyjhbGci0iJTUz...',
        refreshToken: 'eyjhbGci0iJTUz...',
      },
    },
  })
  async refreshTokens(
    @User('id') userId: string,
    @User('refreshToken') refreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
