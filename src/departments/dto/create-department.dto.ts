import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  departmentName: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid university ID' })
  universityId: string;
}
