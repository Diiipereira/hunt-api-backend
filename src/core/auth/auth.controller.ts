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
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova conta de usuário' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (senha curta, email inválido, etc).',
  })
  @ApiResponse({
    status: 409,
    description: 'Confilto: Email ou Username já estão em uso.',
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fazer login e receber tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login realizados com sucesso.',
    schema: {
      example: {
        accessToken: 'eyjhbGci0iJTUz...',
        refreshToken: 'eyjhbGci0iJTUz...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas (email ou senha errados.',
  })
  async signin(@Body() signinDto: SigninDto) {
    return this.authService.signin(signinDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recuperação de senha' })
  @ApiResponse({
    status: 200,
    description: 'E-mail de recuperação enviado com sucesso!',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset de senha' })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso! agora você pode fazer login.',
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
  @ApiOperation({ summary: 'Fazer Logout' })
  @ApiResponse({ status: 200, description: 'Logout realizado.' })
  async logout(@User('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiBearerAuth()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar token do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Tokens realizados com sucesso.',
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
