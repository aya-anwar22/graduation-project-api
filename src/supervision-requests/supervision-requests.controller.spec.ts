import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionRequestsController } from './supervision-requests.controller';

describe('SupervisionRequestsController', () => {
  let controller: SupervisionRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisionRequestsController],
    }).compile();

    controller = module.get<SupervisionRequestsController>(
      SupervisionRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
