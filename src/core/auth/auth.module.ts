import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from './jwt/jwt.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [PassportModule, JwtModule, UsersModule, MailModule],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
