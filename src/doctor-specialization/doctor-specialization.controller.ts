import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Param,
} from '@nestjs/common';
import { DoctorSpecializationService } from './doctor-specialization.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/user/schemas/user.schema';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express'; // أو الـ Interceptor الخاص بكِ
import { UpdateDoctorProfileDto } from './dto/update-doctor-specialization.dto';

@Controller('api/v1/doctor-specialization')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.DOCTOR) // حماية المسار للدكاترة فقط
export class DoctorSpecializationController {
  constructor(private readonly doctorService: DoctorSpecializationService) {}
  @Get('stats')
  async getStats(@CurrentUser('id') doctorId: string) {
    return this.doctorService.getDoctorStats(doctorId);
  }

  @Get('student-summary')
  async getDashboardSummary(@CurrentUser('id') doctorId: string) {
    return this.doctorService.getDetailedDoctorStats(doctorId);
  }
  @Get('my-students')
  async getMyStudents(
    @CurrentUser('id') doctorId: string,
    @Query('departmentId') departmentId?: string,
    @Query('universityId') universityId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.doctorService.getDoctorStudents(
      doctorId,
      { departmentId, universityId },
      page,
      limit,
    );
  }

  // API تفاصيل الطالب العميقة
  @Get('student-details/:id')
  async getStudentDetails(@Param('id') studentId: string) {
    return this.doctorService.getStudentDetailsForDoctor(studentId);
  }

  // 1. جلب بيانات بروفايل الدكتور الحالي
  @Get('my-profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.doctorService.getDoctorProfile(userId);
  }

  // 2. تحديث بيانات البروفايل والصورة
  @Patch('update-profile')
  @UseInterceptors(FileInterceptor('profileImage')) // تأكدي من تطابق الاسم مع Postman
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateData: UpdateDoctorProfileDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    return this.doctorService.updateDoctorProfile(
      userId,
      updateData,
      profileImage,
    );
  }
}
