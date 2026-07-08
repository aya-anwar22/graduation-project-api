import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/user/schemas/user.schema';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';

@Controller('api/v1/admin/dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminDashboardController {
  constructor(private readonly adminService: AdminDashboardService) {}

  @Get('universities')
  async getAllUniversities() {
    return await this.adminService.findAllUniversities();
  }

  @Get('departments/:universityId')
  async getDepartmentsByUni(@Param('universityId') universityId: string) {
    return await this.adminService.findDepartmentsByUniversity(universityId);
  }

  @Post('creatuser')
  async creatuser(@Body() createUserDto: any) {
    // نستخدم adminService لأنه هو الوحيد المعرف في الـ constructor
    return await this.adminService.createUser(createUserDto);
  }

  @Get('universities/:id')
  @Roles(UserRole.ADMIN)
  async getUniversityDetails(@Param('id') id: string) {
    return this.adminService.getUniversityDetails(id);
  }
  @Get('user-details/:id')
  @Roles(UserRole.ADMIN) // يفضل قصرها على الأدمن أو صاحب الحساب
  async getUserDetails(@Param('id') id: string) {
    return await this.adminService.getUserDetailsById(id);
  }

  @Get(':id/details')
  @Roles(UserRole.ADMIN, UserRole.DOCTOR)
  async getDetails(@Param('id') id: string) {
    return await this.adminService.getProjectFullDetails(id);
  }
  @Get('stats')
  async getStats() {
    return this.adminService.getAdminStats();
  }

  @Get('projects-by-university')
  @Roles(UserRole.ADMIN)
  async getProjectsByUniversity() {
    return this.adminService.getProjectsDistributionByUniversity();
  }

  @Get('all-universities')
  async getUniversities(
    @Query('searchTerm') searchTerm: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('isDeleted') isDeleted: string,
  ) {
    const isDeletedFilter =
      isDeleted === 'true' ? true : isDeleted === 'false' ? false : null;

    return await this.adminService.getAllUniversitiesWithDetails({
      searchTerm,
      isDeletedFilter,
      page: page || 1,
      limit: limit || 10,
    });
  }

  @Get('department-statistics')
  async getStatsDepartment() {
    return await this.adminService.getDepartmentStats();
  }

  @Get('universities-list')
  async getUniList(@Query('departmentId') departmentId?: string) {
    return this.adminService.getUniversitiesList(departmentId);
  }
  @Get('doctors-by-university/:universityId')
  async getDoctorsByUni(@Param('universityId') universityId: string) {
    return await this.adminService.getDoctorsByUniversity(universityId);
  }

  @Get('all-department')
  async getDepts(@Query() query: any) {
    return await this.adminService.getAllDepartments({
      ...query,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    });
  }

  @Get('doctors-stats')
  @Roles(UserRole.ADMIN)
  async getDocStats() {
    return await this.adminService.getDoctorStats();
  }

  @Get('all-doctors-detailed')
  @Roles(UserRole.ADMIN)
  async getDoctors(
    @Query('searchTerm') searchTerm: string,
    @Query('departmentId') departmentId: string,
    @Query('isHead') isHead: boolean,
    @Query('academicTitle') academicTitle: string,
    @Query('status') status: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return await this.adminService.getAllDoctorsDetailed({
      searchTerm,
      departmentId,
      isHead,
      academicTitle,
      status,
      page: page || 1,
      limit: limit || 10,
    });
  }

  @Get('doctor-profile/:id')
  @Roles(UserRole.ADMIN)
  async getProfile(@Param('id') id: string) {
    return await this.adminService.getDoctorFullProfile(id);
  }

  @Get('projects-summary')
  @Roles(UserRole.ADMIN)
  async getSummary() {
    return await this.adminService.getProjectsStats();
  }

  @Get('all-projects')
  @Roles(UserRole.ADMIN)
  async getProjects(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('searchTerm') searchTerm: string,
    @Query('universityId') universityId: string,
    @Query('departmentId') departmentId: string,
    @Query('doctorId') doctorId: string,
    @Query('year') year: string,
    @Query('status') status: string, // إضافة استقبال الحالة هنا
  ) {
    return await this.adminService.getAllProjectsDetailed({
      page: page || 1,
      limit: limit || 10,
      searchTerm,
      universityId,
      departmentId,
      doctorId,
      year,
      status,
    });
  }

  @Get('teams-statistics')
  @Roles(UserRole.ADMIN)
  async getStatsTeam() {
    return await this.adminService.getTeamsStats();
  }

  @Get('all-teams-detailed')
  @Roles(UserRole.ADMIN)
  async getAllTeams(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('searchTerm') searchTerm: string,
    @Query('universityId') universityId: string,
    @Query('departmentId') departmentId: string,
    @Query('doctorId') doctorId: string,
    @Query('year') year: string,
  ) {
    return await this.adminService.getAllTeamsDetailed({
      page: page || 1,
      limit: limit || 10,
      searchTerm,
      universityId,
      departmentId,
      doctorId,
      year,
    });
  }

  @Get('users-stats')
  @Roles(UserRole.ADMIN) // فقط الأدمن من يرى الإحصائيات
  async getUsersStats() {
    return await this.adminService.getUsersStatistics();
  }

  @Get('team-details/:id')
  @Roles(UserRole.ADMIN)
  async getTeamDetails(@Param('id') id: string) {
    return await this.adminService.getTeamDetailsById(id);
  }

  @Get('manage-users')
  @Roles(UserRole.ADMIN)
  async getUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('searchTerm') searchTerm: string,
    @Query('role') role: string,
    @Query('universityId') universityId: string,
    @Query('departmentId') departmentId: string,
    @Query('isVerified') isVerified: string,
    @Query('status') status: string,
  ) {
    return await this.adminService.getAllUsersDetailed({
      page: page || 1,
      limit: limit || 10,
      searchTerm,
      role,
      universityId,
      departmentId,
      isVerified,
      status,
    });
  }

  @Post('universities')
  @Roles(UserRole.ADMIN) // الأدمن فقط
  async addUniversity(@Body() createUniversityDto: CreateUniversityDto) {
    return this.adminService.createUniversity(createUniversityDto);
  }

  @Post('create-department')
  async addDepartment(
    @Body()
    createDto: {
      departmentName: string;
      universityId: string;
      headDoctorId?: string; // 👈 بقى optional
    },
  ) {
    return await this.adminService.createDepartment(createDto);
  }
  @Patch('universities/:id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateUniversityDto) {
    return this.adminService.updateUniversity(id, dto);
  }

  @Delete('universities/:id')
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.adminService.toggleUniversityStatus(id);
  }

  @Patch('update-role/:id')
  // @Roles(UserRole.ADMIN) // الأدمن فقط
  async updateUserData(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserAdminDto,
  ) {
    return await this.adminService.updateByAdmin(id, updateDto);
  }
  @Delete('toggle-status/:id')
  @Roles(UserRole.ADMIN)
  async toggleStatus(@Param('id') id: string) {
    return await this.adminService.toggleUserStatus(id);
  }

  // تعديل القسم
  @Patch('departments/:id')
  @Roles(UserRole.ADMIN)
  async updateDept(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.adminService.updateDepartment(id, dto);
  }

  // حذف واستعادة القسم
  @Delete('departments/:id')
  @Roles(UserRole.ADMIN)
  async toggleDeptStatus(@Param('id') id: string) {
    return this.adminService.toggleDepartmentStatus(id);
  }
}
