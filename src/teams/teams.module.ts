import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Team, TeamSchema } from './schemas/team.schema';
import { TeamMember, TeamMemberSchema } from './schemas/team-member.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: TeamMember.name, schema: TeamMemberSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [TeamsService],
  controllers: [TeamsController],

  exports: [TeamsService, MongooseModule],
})
export class TeamsModule {}
