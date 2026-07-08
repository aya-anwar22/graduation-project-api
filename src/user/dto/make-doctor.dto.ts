import { IsMongoId, IsNotEmpty } from 'class-validator';

export class MakeDoctorDto {
  @IsMongoId({ message: 'Invalid userId format' })
  @IsNotEmpty({ message: 'userId is required' })
  userId: string;

  @IsMongoId({ message: 'Invalid departmentId format' })
  @IsNotEmpty({ message: 'departmentId is required' })
  departmentId: string;
}
