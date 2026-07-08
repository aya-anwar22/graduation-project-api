import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DepartmentsService } from './departments.service';
import { Department } from './schemas/department.schema';
import { University } from '../universities/schemas/university.schema';

describe('DepartmentsService', () => {
  let service: DepartmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,

        {
          provide: getModelToken(Department.name),
          useValue: {},
        },

        {
          provide: getModelToken(University.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});