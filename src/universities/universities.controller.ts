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
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';
// import { UserRole } from '../user/schemas/user.schema';

@Controller('api/v1/universities')
// @UseGuards(JwtAuthGuard, RolesGuard) // Uncomment when you have auth guards
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post()
  // @Roles(UserRole.ADMIN) // Only admin can create
  create(@Body() createUniversityDto: CreateUniversityDto) {
    return this.universitiesService.create(createUniversityDto);
  }

  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get('deleted')
  // @Roles(UserRole.ADMIN) // Only admin can view deleted
  findAllDeleted() {
    return this.universitiesService.findAllDeleted();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.universitiesService.findOne(id);
  }

  @Patch(':id')
  // @Roles(UserRole.ADMIN) // Only admin can update
  update(
    @Param('id') id: string,
    @Body() updateUniversityDto: UpdateUniversityDto,
  ) {
    return this.universitiesService.update(id, updateUniversityDto);
  }

  @Delete(':id')
  // @Roles(UserRole.ADMIN) // Only admin can delete
  remove(@Param('id') id: string) {
    return this.universitiesService.remove(id);
  }

  @Patch(':id/restore')
  // @Roles(UserRole.ADMIN) // Only admin can restore
  restore(@Param('id') id: string) {
    return this.universitiesService.restore(id);
  }

  @Delete(':id/permanent')
  // @Roles(UserRole.ADMIN) // Only admin can permanently delete
  permanentDelete(@Param('id') id: string) {
    return this.universitiesService.permanentDelete(id);
  }
}
