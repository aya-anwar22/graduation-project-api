import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorSpecializationController } from './doctor-specialization.controller';
import { DoctorSpecializationService } from './doctor-specialization.service';
import {
  DoctorProfile,
  DoctorProfileSchema,
} from './schema/doctor-specialization.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Team, TeamSchema } from 'src/teams/schemas/team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DoctorProfile.name, schema: DoctorProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Team.name, schema: TeamSchema }, // 2. تسجيل موديل التيم هنا
    ]),
    CloudinaryModule,
  ],
  controllers: [DoctorSpecializationController],
  providers: [DoctorSpecializationService],
  exports: [DoctorSpecializationService],
})
export class DoctorSpecializationModule {}
