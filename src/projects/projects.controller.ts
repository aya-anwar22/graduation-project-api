import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
  Query,
  Delete,
  Req,
  Request,
  Patch,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { UserRole } from 'src/user/schemas/user.schema';

@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // 1. رفع ملفات المشروع (PDF, Word, Powerpoint)
  @Post('upload-file')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // الحد الأقصى 10 ميجا
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only PDF, DOC, DOCX, PPT, PPTX files are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadFileToMyProject(
    @UploadedFile() file: Express.Multer.File,
    @Body('description') description: string,
    @CurrentUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const userId = user.userId || user.id || user._id;
    return this.projectsService.uploadProjectFileByToken(
      file,
      userId,
      description,
    );
  }
  @UseGuards(AuthGuard, RolesGuard) // تأكدي من وجود الحماية بالتوكن
  @Roles('doctor') // السماح للدكاترة فقط
  @Get('doctor/stats')
  async getDoctorStats(@Req() req: any) {
    // نأخذ الـ ID من التوكن (الموجود في req.user)
    const doctorId = req.user.id;

    const stats = await this.projectsService.getDoctorDashboardStats(doctorId);

    return {
      message: 'Doctor dashboard statistics retrieved successfully',
      data: stats,
    };
  }

  @Patch('update-project')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('image')) // نترك الصورة اختيارية في التحديث
  async updateProjectDetails(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    updateData: {
      description?: string;
      project_type?: string;
      projectLink?: string;
      technologies?: string; // ستصل كـ String مفصول بفاصلة مثل "React,Node"
      main_objectives?: string;
    },
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.id || user._id;

    return this.projectsService.updateProjectByToken(
      userId,
      updateData,
      file, // قد يكون undefined لو المستخدم لم يرفع صورة جديدة
    );
  }

  @UseGuards(AuthGuard) // حماية المسار بالتشفير
  @Get('doctor/:id')
  async getProjectDetailsByDoctor(
    @Param('id') projectId: string,
    @Request() req, // الحصول على بيانات الدكتور من التوكن
  ) {
    // نفترض أن التوكن يحتوي على id المستخدم في req.user.userId
    const doctorId = req.user.id; // مأخوذ من الـ Token
    return await this.projectsService.getProjectDetailsForDoctor(
      projectId,
      doctorId,
    );
  }

  // 3. جلب بيانات مشروعي (Student View)
  @Get('my-project')
  @UseGuards(AuthGuard)
  async getMyProject(@CurrentUser() user: any, @Query('view') view?: string) {
    const userId = user.userId || user.id || user._id;
    return this.projectsService.getMyProject(userId);
  }

  @Get('all')
  async getAllProjects(@Query() query: any) {
    return this.projectsService.getAllCompletedProjects(query);
  }

  @Get('details/:id')
  async getProjectDetails(@Param('id') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Get('stats') // سيكون المسار: /projects/stats
  async getStats() {
    const stats = await this.projectsService.getProjectsStats();
    return {
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @UseGuards(AuthGuard, RolesGuard) // تأكدي من وجود الحماية بالتوكن
  @Roles('doctor') // السماح للدكاترة فقط
  @Get('all/doctor')
  async getDoctorProjects(@Req() req: any, @Query() queryDto: any) {
    const doctorId = req.user.id; // مأخوذ من الـ Token
    return await this.projectsService.getDoctorProjectsWithStats(
      doctorId,
      queryDto,
    );
  }

  // 4. حذف ملف من المشروع
  @Delete('files/:fileId/delete')
  @UseGuards(AuthGuard)
  async deleteProjectFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    const userId = user.userId || user.id || user._id;
    return this.projectsService.deleteProjectFile(fileId, userId);
  }

  @Delete('delete-image')
  @UseGuards(AuthGuard)
  async deleteProjectImage(@CurrentUser() user: any) {
    const userId = user.userId || user.id || user._id;
    return this.projectsService.deleteProjectImageByToken(userId);
  }

  @Patch('doctor/projects/:projectId/status')
  @Roles(UserRole.DOCTOR) // حماية الإندبوينت ليدخل الدكاترة فقط
  async updateProjectStatus(
    @Param('projectId') projectId: string,
    @CurrentUser('id') doctorId: string, // أو باستخدام req.user.id بناءً على إعدادات الـ Guard لديكِ
    @Body() updateProjectStatusDto: UpdateProjectStatusDto,
  ) {
    return await this.projectsService.updateProjectStatus(
      projectId,
      doctorId,
      updateProjectStatusDto,
    );
  }
}
