import { Global, Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';

@Global()
@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule],
  exports: [DatabaseModule, AuthModule],
})
export class CoreModule {}
