import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { SlotsModule } from './modules/slots/slots.module';

@Module({
  imports: [CoreModule, UsersModule, ProvidersModule, SlotsModule],
})
export class AppModule {}
