import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { GetTeamDto } from './schemas/dto/get-team.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/user/schemas/user.schema';

@Controller('api/v1/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('details/:id')
  async getTeamDetails(@Param('id') teamId: string) {
    return this.teamsService.getTeamDetails(teamId);
  }

  @Get('my-team')
  @UseGuards(AuthGuard)
  async getMyTeam(@CurrentUser() user: any) {
    const userId = user.userId || user.id || user._id;
    return this.teamsService.getMyTeamDetails(userId);
  }

  @Get('doctor-teams')
  @UseGuards(AuthGuard)
  @Roles(UserRole.DOCTOR)
  async getMyTeams(
    @CurrentUser('id') doctorId: string,
    @Query('year') year?: string, // 👈 ضيفي ده
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') projectStatus?: string,
    @Query('departmentId') departmentId?: string,
    @Query('universityId') universityId?: string,
  ) {
    return await this.teamsService.getDoctorTeams(
      doctorId,
      { projectStatus, departmentId, year, universityId },
      page,
      limit,
    );
  }
}
