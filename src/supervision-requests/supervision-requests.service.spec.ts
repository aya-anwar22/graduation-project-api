import { Test, TestingModule } from '@nestjs/testing';
import { SupervisionRequestsService } from './supervision-requests.service';
import { getModelToken } from '@nestjs/mongoose';
import { EmailService } from 'src/common/email/email.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { TeamsService } from 'src/teams/teams.service';

describe('SupervisionRequestsService', () => {
  let service: SupervisionRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupervisionRequestsService,
        { provide: getModelToken('SupervisionRequest'), useValue: {} },
        { provide: getModelToken('SupervisionRequestMember'), useValue: {} },
        { provide: getModelToken('User'), useValue: {} },
        { provide: getModelToken('Project'), useValue: {} },
        { provide: getModelToken('ProjectFile'), useValue: {} },
        { provide: getModelToken('ProjectTechnology'), useValue: {} },
        { provide: getModelToken('Department'), useValue: {} },
        { provide: getModelToken('Team'), useValue: {} },
        { provide: getModelToken('TeamMember'), useValue: {} },
        { provide: getModelToken('DepartmentDoctor'), useValue: {} },
        
        // الخدمات
        { provide: 'EmailService', useValue: { sendMail: jest.fn() } }, 
        { provide: EmailService, useValue: { sendMail: jest.fn() } },
        
        { provide: 'NotificationsService', useValue: { sendNotification: jest.fn() } },
        { provide: NotificationsService, useValue: { sendNotification: jest.fn() } },
        
        { provide: 'TeamsService', useValue: { findOne: jest.fn() } },
        { provide: TeamsService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    service = module.get<SupervisionRequestsService>(SupervisionRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});