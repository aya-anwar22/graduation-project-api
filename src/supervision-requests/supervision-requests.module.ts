import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SupervisionRequestsController } from './supervision-requests.controller';
import { SupervisionRequestsService } from './supervision-requests.service';
import {
  SupervisionRequest,
  SupervisionRequestSchema,
} from './schemas/supervision-request.schema';
import {
  SupervisionRequestMember,
  SupervisionRequestMemberSchema,
} from './schemas/supervision-request-member.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';
import {
  Department,
  DepartmentSchema,
} from '../departments/schemas/department.schema'; // ✅
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../common/email/email.module';
import { TeamsModule } from '../teams/teams.module';
import {
  DepartmentDoctor,
  DepartmentDoctorSchema,
} from 'src/department-doctors/schemas/department-doctor.schema';
import { GroupChatsModule } from 'src/chats/schemas/group-chats.module';
import {
  ProjectFile,
  ProjectFileSchema,
} from 'src/projects/schemas/project-file.schema';
import {
  ProjectTechnology,
  ProjectTechnologySchema,
} from 'src/projects/schemas/project-technology.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SupervisionRequest.name, schema: SupervisionRequestSchema },
      {
        name: SupervisionRequestMember.name,
        schema: SupervisionRequestMemberSchema,
      },
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: DepartmentDoctor.name, schema: DepartmentDoctorSchema },
      { name: Department.name, schema: DepartmentSchema },

      { name: ProjectFile.name, schema: ProjectFileSchema },
      { name: ProjectTechnology.name, schema: ProjectTechnologySchema },
    ]),
    NotificationsModule,
    EmailModule,
    TeamsModule,
    GroupChatsModule,
    TeamsModule,
  ],
  controllers: [SupervisionRequestsController],
  providers: [SupervisionRequestsService],
  exports: [SupervisionRequestsService],
})
export class SupervisionRequestsModule {}
