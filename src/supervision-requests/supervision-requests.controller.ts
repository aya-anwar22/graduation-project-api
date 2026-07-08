import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupervisionRequestsService } from './supervision-requests.service';
import { CreateSupervisionRequestDto } from './dto/create-supervision-request.dto';
import { UpdateRequestStatusDto } from './dto/update-status.dto';

import { UserRole } from '../user/schemas/user.schema';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('api/v1/supervision-requests')
@UseGuards(AuthGuard, RolesGuard)
export class SupervisionRequestsController {
  constructor(
    private readonly supervisionRequestsService: SupervisionRequestsService,
  ) {}

  @Post()
  @Roles(UserRole.STUDENT)
  async createRequest(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateSupervisionRequestDto,
  ) {
    return this.supervisionRequestsService.createSupervisionRequest(
      userId,
      createDto,
    );
  }

  @Patch('doctor/update-status/:id')
  async updateStatus(
    @Param('id') requestId: string,
    @Body('status') status: 'approved' | 'rejected',
    @Req() req: any,
  ) {
    return await this.supervisionRequestsService.updateRequestStatus(
      requestId,
      req.user.id,
      status,
    );
  }

  @Get('doctor/details/:id')
  async getSingleRequestDetails(@Param('id') id: string) {
    // غيرنا الاسم هنا
    return await this.supervisionRequestsService.getrequestDetails(id);
  }
  @Get('doctor/request-stats')
  @UseGuards(AuthGuard)
  @Roles(UserRole.DOCTOR)
  async getRequestStats(@CurrentUser() user: any) {
    // استخراج الـ ID من التوكن (تأكدي من المسمى id أو userId حسب الـ Strategy عندك)
    const doctorId = user.id || user.userId || user._id;

    return this.supervisionRequestsService.getDoctorRequestStats(doctorId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getById(@Param('id') requestId: string, @Req() req) {
    const userId = req.user.id;
    return this.supervisionRequestsService.getRequestForTeamMember(
      requestId,
      userId,
    );
  }

  @Get(':id')
  @Roles(UserRole.DOCTOR)
  async getRequestDetails(@Req() req, @Param('id') id: string) {
    return this.supervisionRequestsService.getRequestDetails(
      id,
      req.user.userId,
    );
  }

  @Get('doctor/pending-requests') // غيرنا الاسم عشان يشمل كل الحالات مش بس الـ pending
  async getRequests(
    @Req() req: any,
    @Query('status') status?: string, // استقبال الحالة من الـ URL
    @Query('departmentId') departmentId?: string,
    @Query('year') year?: string,
    @Query('universityId') universityId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const doctorId = req.user.id;
    return await this.supervisionRequestsService.getDoctorRequests(
      doctorId,
      { departmentId, year, universityId, status }, // تمرير الـ status هنا
      page,
      limit,
    );
  }

  @Get('student/my-requests')
  @Roles(UserRole.STUDENT)
  async getStudentRequests(@Req() req) {
    return this.supervisionRequestsService.getStudentRequests(req.user.userId);
  }
}
