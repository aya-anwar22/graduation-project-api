import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtUtil } from 'src/common/utils/jwt.util';
import { MailService } from './mail/mail.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: {} },
        { provide: getModelToken('UserAuth'), useValue: {} },
        { provide: getModelToken('University'), useValue: {} },
        { provide: getModelToken('Department'), useValue: {} },
        // استخدام الكلاس مباشرة بدلاً من الـ String
        { provide: JwtUtil, useValue: { generateToken: jest.fn(), verifyToken: jest.fn() } },
        { provide: MailService, useValue: { sendMail: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});