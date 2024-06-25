import { Test, TestingModule } from '@nestjs/testing';
import { MatchmakerService } from './matchmaker.service';

describe('MatchmakerService', () => {
  let service: MatchmakerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchmakerService],
    }).compile();

    service = module.get<MatchmakerService>(MatchmakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
