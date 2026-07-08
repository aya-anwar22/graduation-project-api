import { PartialType } from '@nestjs/mapped-types';
import { CreateDepartmentDoctorDto } from './create-department-doctor.dto';

export class UpdateDepartmentDoctorDto extends PartialType(
  CreateDepartmentDoctorDto,
) {}
