import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  departmentName?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid university ID' })
  universityId?: string;

  @IsOptional()
  @IsMongoId({ message: 'Invalid head doctor ID' })
  headDoctorId?: string;
}
