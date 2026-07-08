import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { Department } from '../departments/schemas/department.schema';
import { DepartmentDoctor } from '../department-doctors/schemas/department-doctor.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,

        {
          provide: getModelToken(User.name),
          useValue: {},
        },

        {
          provide: getModelToken(DepartmentDoctor.name),
          useValue: {},
        },

        {
          provide: getModelToken(Department.name),
          useValue: {},
        },

        {
          provide: CloudinaryService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});