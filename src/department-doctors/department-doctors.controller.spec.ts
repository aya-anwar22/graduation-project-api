import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentDoctorsController } from './department-doctors.controller';
import { DepartmentDoctorsService } from './department-doctors.service';

describe('DepartmentDoctorsController', () => {
  let controller: DepartmentDoctorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentDoctorsController],
      providers: [DepartmentDoctorsService],
    }).compile();

    controller = module.get<DepartmentDoctorsController>(
      DepartmentDoctorsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
