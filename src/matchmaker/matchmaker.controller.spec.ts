import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakerController } from './matchmaker.controller';

describe('MatchmakerController', () => {
  let controller: MatchmakerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchmakerController],
    }).compile();

    controller = module.get<MatchmakerController>(MatchmakerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
