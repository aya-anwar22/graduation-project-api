import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionRequestsService } from './supervision-requests.service';

describe('SupervisionRequestsService', () => {
  let service: SupervisionRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupervisionRequestsService],
    }).compile();

    service = module.get<SupervisionRequestsService>(
      SupervisionRequestsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
