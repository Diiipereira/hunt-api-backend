import { Module, Global } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    NestJwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
