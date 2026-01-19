import { Test, TestingModule } from '@nestjs/testing';
import { HuntsController } from './hunts.controller';

describe('HuntsController', () => {
  let controller: HuntsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HuntsController],
    }).compile();

    controller = module.get<HuntsController>(HuntsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
