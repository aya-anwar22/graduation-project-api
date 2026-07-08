import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentDoctorsService } from './department-doctors.service';

describe('DepartmentDoctorsService', () => {
  let service: DepartmentDoctorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentDoctorsService],
    }).compile();

    service = module.get<DepartmentDoctorsService>(DepartmentDoctorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
