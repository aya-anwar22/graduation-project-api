import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { DepartmentDoctorsModule } from 'src/department-doctors/department-doctors.module';
import { DepartmentsModule } from 'src/departments/departments.module';
import { DepartmentDoctorSchema } from 'src/department-doctors/schemas/department-doctor.schema';
import {
  Department,
  DepartmentSchema,
} from 'src/departments/schemas/department.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'DepartmentDoctor', schema: DepartmentDoctorSchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),
    forwardRef(() => DepartmentDoctorsModule),
    DepartmentsModule,
    CloudinaryModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
