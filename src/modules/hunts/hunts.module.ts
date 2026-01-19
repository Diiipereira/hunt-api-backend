import { Module } from '@nestjs/common';
import { HuntsController } from './hunts.controller';
import { HuntsService } from './hunts.service';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [CoreModule],
  controllers: [HuntsController],
  providers: [HuntsService],
})
export class HuntsModule { }
