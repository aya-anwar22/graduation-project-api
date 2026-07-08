import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DepartmentDoctorsService } from './department-doctors.service';
import { DepartmentDoctorsController } from './department-doctors.controller';
import {
  DepartmentDoctor,
  DepartmentDoctorSchema,
} from './schemas/department-doctor.schema';
import { UserModule } from 'src/user/user.module';
import { DepartmentsModule } from 'src/departments/departments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DepartmentDoctor.name, schema: DepartmentDoctorSchema },
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => DepartmentsModule),
  ],
  controllers: [DepartmentDoctorsController],
  providers: [DepartmentDoctorsService],
  exports: [DepartmentDoctorsService, MongooseModule],
})
export class DepartmentDoctorsModule {}
