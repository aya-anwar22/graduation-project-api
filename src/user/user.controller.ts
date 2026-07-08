import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
  Query,
  Param, // ✅ إضافة
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { ImageFileInterceptor } from '../common/interceptors/image-file.interceptor';
import { MakeDoctorDto } from './dto/make-doctor.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';

@Controller('api/v1/users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.userService.getMyProfile(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ImageFileInterceptor('profileImage'))
  @UsePipes(new ValidationPipe({ transform: true })) // ✅ اختياري: إذا مش شغال globally
  async updateMyProfile(
    @CurrentUser('id') userId: string,
    @Body() updateData: UpdateStudentProfileDto,
    @UploadedFile() profileImage?: Express.Multer.File,
  ) {
    console.log('📝 Received update data:', updateData); // ✅ للـ debugging
    return this.userService.updateMyProfile(userId, updateData, profileImage);
  }

  @Post('make-doctor')
  @HttpCode(HttpStatus.CREATED)
  makeDoctor(@Body() makeDoctorDto: MakeDoctorDto) {
    return this.userService.makeDoctor(
      makeDoctorDto.userId,
      makeDoctorDto.departmentId,
    );
  }

  @Get('doctors/:departmentId')
  @HttpCode(HttpStatus.OK)
  findDoctorsByDepartment(@Param('departmentId') departmentId: string) {
    return this.userService.findDoctorsByDepartment(departmentId);
  }

  @Post('admin/create-user')
  @HttpCode(HttpStatus.CREATED)
  // @Roles(UserRole.ADMIN) // لو عندك Role Guard يفضل تفعيله هنا
  async adminCreateUser(@Body() createUserDto: CreateUserAdminDto) {
    return this.userService.createUserByAdmin(createUserDto);
  }
}
