import { Test, TestingModule } from '@nestjs/testing';
import { HuntsService } from './hunts.service';

describe('HuntsService', () => {
  let service: HuntsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HuntsService],
    }).compile();

    service = module.get<HuntsService>(HuntsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
