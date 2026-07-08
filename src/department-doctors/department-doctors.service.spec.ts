import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentDoctorsService } from './department-doctors.service';
import { getModelToken } from '@nestjs/mongoose';
import { DepartmentDoctor } from './schemas/department-doctor.schema';
import { User } from '../user/schemas/user.schema';
import { Department } from '../departments/schemas/department.schema';

describe('DepartmentDoctorsService', () => {
  let service: DepartmentDoctorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentDoctorsService,
        { provide: getModelToken(DepartmentDoctor.name), useValue: {} },
        { provide: getModelToken(User.name), useValue: {} },
        { provide: getModelToken(Department.name), useValue: {} },
      ],
    }).compile();

    service = module.get<DepartmentDoctorsService>(DepartmentDoctorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});