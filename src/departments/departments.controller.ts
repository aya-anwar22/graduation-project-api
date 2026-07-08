import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { UserRole } from '../user/schemas/user.schema';

@Controller('api/v1/departments')
// @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when you have auth guards
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}
  @Patch(':id')
  // @Roles(UserRole.ADMIN) // Only admin can update
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Post()
  // @Roles(UserRole.ADMIN) // Only admin can create
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get('deleted')
  // @Roles(UserRole.ADMIN) // Only admin can view deleted
  findAllDeleted() {
    return this.departmentsService.findAllDeleted();
  }

  @Get('university/:universityId')
  findByUniversity(@Param('universityId') universityId: string) {
    return this.departmentsService.findByUniversity(universityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Delete(':id')
  // @Roles(UserRole.ADMIN) // Only admin can delete
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }

  @Patch(':id/restore')
  // @Roles(UserRole.ADMIN) // Only admin can restore
  restore(@Param('id') id: string) {
    return this.departmentsService.restore(id);
  }

  @Delete(':id/permanent')
  // @Roles(UserRole.ADMIN) // Only admin can permanently delete
  permanentDelete(@Param('id') id: string) {
    return this.departmentsService.permanentDelete(id);
  }
}
