import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionRequestsController } from './supervision-requests.controller';
import { SupervisionRequestsService } from './supervision-requests.service';
import { JwtService } from '@nestjs/jwt'; // تأكد من استيرادها

describe('SupervisionRequestsController', () => {
  let controller: SupervisionRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupervisionRequestsController],
      providers: [
        {
          provide: SupervisionRequestsService,
          useValue: {}, // Mock للخدمة
        },
        {
          provide: JwtService, // توفير الـ Mock للـ JwtService
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SupervisionRequestsController>(
      SupervisionRequestsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});