import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { DepartmentDoctorsService } from './department-doctors.service';

@Controller('department-doctors')
export class DepartmentDoctorsController {
  constructor(private readonly service: DepartmentDoctorsService) {}

  @Post()
  async addDoctorToDepartment(
    @Body() body: { departmentId: string; doctorId: string; isHead?: boolean },
  ) {
    return this.service.create(body.departmentId, body.doctorId, body.isHead);
  }

  @Get('department/:departmentId')
  async getDoctorsByDepartment(@Param('departmentId') departmentId: string) {
    return this.service.findDoctorsByDepartment(departmentId);
  }
}
