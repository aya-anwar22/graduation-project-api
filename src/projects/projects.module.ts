// src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import { Project, ProjectSchema } from './schemas/project.schema';
import { Team, TeamSchema } from '../teams/schemas/team.schema';
import {
  TeamMember,
  TeamMemberSchema,
} from '../teams/schemas/team-member.schema';
import { ProjectFile, ProjectFileSchema } from './schemas/project-file.schema';
import {
  ProjectTechnology,
  ProjectTechnologySchema,
} from './schemas/project-technology.schema';
import {
  SupervisionRequest,
  SupervisionRequestSchema,
} from '../supervision-requests/schemas/supervision-request.schema';
import {
  SupervisionRequestMember,
  SupervisionRequestMemberSchema,
} from '../supervision-requests/schemas/supervision-request-member.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { ProjectsController } from './projects.controller';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { DepartmentDoctorSchema } from 'src/department-doctors/schemas/department-doctor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Team.name, schema: TeamSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: ProjectFile.name, schema: ProjectFileSchema },
      { name: ProjectTechnology.name, schema: ProjectTechnologySchema },
      { name: SupervisionRequest.name, schema: SupervisionRequestSchema },
      {
        name: SupervisionRequestMember.name,
        schema: SupervisionRequestMemberSchema,
      }, // ✅ مهم
      { name: User.name, schema: UserSchema },
      { name: 'DepartmentDoctor', schema: DepartmentDoctorSchema }, // ✅ أضف هذا
    ]),
    CloudinaryModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
