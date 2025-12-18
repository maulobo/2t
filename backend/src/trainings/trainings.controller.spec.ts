import { Test, TestingModule } from '@nestjs/testing';
import { WodsController } from './wods.controller';

describe('WodsController', () => {
  let controller: WodsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WodsController],
    }).compile();

    controller = module.get<WodsController>(WodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
