import { Module } from '@nestjs/common';
import { SlotsService } from './slots.service';
import { SlotsController } from './slots.controller';
import { SlotsRepository } from './slots.repository';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [ProvidersModule],
  controllers: [SlotsController],
  providers: [SlotsService, SlotsRepository],
})
export class SlotsModule {}
