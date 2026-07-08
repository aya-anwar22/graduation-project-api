import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Department,
  DepartmentSchema,
} from 'src/departments/schemas/department.schema';
import { Project, ProjectSchema } from 'src/projects/schemas/project.schema';
import {
  SupervisionRequest,
  SupervisionRequestSchema,
} from 'src/supervision-requests/schemas/supervision-request.schema';
import {
  University,
  UniversitySchema,
} from 'src/universities/schemas/university.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import {
  DepartmentDoctor,
  DepartmentDoctorSchema,
} from 'src/department-doctors/schemas/department-doctor.schema';
import { Team, TeamSchema } from 'src/teams/schemas/team.schema';
import {
  TeamMember,
  TeamMemberSchema,
} from 'src/teams/schemas/team-member.schema';
import {
  DoctorProfile,
  DoctorProfileSchema,
} from 'src/doctor-specialization/schema/doctor-specialization.schema';
import { UserAuth, UserAuthSchema } from 'src/auth/schemas/user-auth.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: University.name, schema: UniversitySchema },
      { name: Department.name, schema: DepartmentSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: SupervisionRequest.name, schema: SupervisionRequestSchema },
      { name: DepartmentDoctor.name, schema: DepartmentDoctorSchema },
      { name: Team.name, schema: TeamSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: DoctorProfile.name, schema: DoctorProfileSchema }, // <--- مهم جدًا
      { name: UserAuth.name, schema: UserAuthSchema }, // <--- السطر الناقص اللي سبب المشكلة
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}
