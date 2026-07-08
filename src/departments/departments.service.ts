import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Department, DepartmentDocument } from './schemas/department.schema';
import {
  University,
  UniversityDocument,
} from '../universities/schemas/university.schema';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(University.name)
    private universityModel: Model<UniversityDocument>,
  ) {}

  // Create Department
  async create(createDepartmentDto: CreateDepartmentDto) {
    try {
      const { departmentName, universityId } = createDepartmentDto;

      // 1. Check if university exists
      const university = await this.universityModel.findOne({
        _id: universityId,
        is_deleted: false,
      });

      if (!university) {
        throw new NotFoundException('University not found');
      }

      // 2. Check if department already exists in this university
      const existingDepartment = await this.departmentModel.findOne({
        departmentName,
        universityId,
        is_deleted: false,
      });

      if (existingDepartment) {
        throw new BadRequestException(
          'Department with this name already exists in this university',
        );
      }

      // 3. Create department
      const department = new this.departmentModel({
        departmentName,
        universityId: new Types.ObjectId(universityId),
      });

      const savedDepartment = await department.save();

      // Populate university data
      await savedDepartment.populate('universityId', 'universityName location');

      return {
        message: 'Department created successfully',
        data: savedDepartment,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create department');
    }
  }

  // Get All Departments
  async findAll() {
    try {
      const departments = await this.departmentModel
        .find({ is_deleted: false })
        .populate('universityId', 'universityName location')
        .select('-is_deleted -deleted_at')
        .sort({ createdAt: -1 });

      return {
        message: 'Departments retrieved successfully',
        data: departments,
        count: departments.length,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve departments');
    }
  }

  // Get Departments by University ID
  async findByUniversity(universityId: string) {
    try {
      // Check if university exists
      const university = await this.universityModel.findOne({
        _id: universityId,
        is_deleted: false,
      });

      if (!university) {
        throw new NotFoundException('University not found');
      }

      const departments = await this.departmentModel
        .find({ universityId, is_deleted: false })
        .populate('universityId', 'universityName location')
        .select('-is_deleted -deleted_at')
        .sort({ departmentName: 1 });

      return {
        message: 'Departments retrieved successfully',
        university: {
          _id: university._id,
          universityName: university.universityName,
        },
        data: departments,
        count: departments.length,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve departments');
    }
  }

  // Get Department by ID
  async findOne(id: string) {
    try {
      const department = await this.departmentModel
        .findOne({ _id: id, is_deleted: false })
        .populate('universityId', 'universityName location email_contact')
        .select('-is_deleted -deleted_at');

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      return {
        message: 'Department retrieved successfully',
        data: department,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve department');
    }
  }

  // Update Department
  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    console.log('DONEEE');
    try {
      const department = await this.departmentModel.findOne({
        _id: id,
        is_deleted: false,
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      const { departmentName, universityId, headDoctorId } =
        updateDepartmentDto;

      // لو في universityId جديد → نتأكد منه
      if (universityId) {
        const university = await this.universityModel.findOne({
          _id: universityId,
          is_deleted: false,
        });

        if (!university) {
          throw new NotFoundException('University not found');
        }
      }

      // منع تكرار اسم القسم داخل نفس الجامعة
      if (departmentName) {
        const existingDepartment = await this.departmentModel.findOne({
          departmentName,
          universityId: universityId || department.universityId,
          is_deleted: false,
          _id: { $ne: id },
        });

        if (existingDepartment) {
          throw new BadRequestException(
            'Department with this name already exists in this university',
          );
        }
      }

      // 🔥 build update object بشكل نظيف
      const updateData: any = {};

      if (departmentName) updateData.departmentName = departmentName;
      if (universityId) updateData.universityId = universityId;
      if (headDoctorId) updateData.headDoctorId = headDoctorId;

      const updatedDepartment = await this.departmentModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('universityId', 'universityName location')
        .populate('headDoctorId', 'name email') // مهم لو عندك Doctor collection
        .select('-is_deleted -deleted_at');

      return {
        message: 'Department updated successfully',
        data: updatedDepartment,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update department');
    }
  }
  // Soft Delete Department
  async remove(id: string) {
    try {
      const department = await this.departmentModel.findOne({
        _id: id,
        is_deleted: false,
      });

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      department.is_deleted = true;
      department.deleted_at = new Date();
      await department.save();

      return {
        message: 'Department deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete department');
    }
  }

  // Restore Deleted Department
  async restore(id: string) {
    try {
      const department = await this.departmentModel.findOne({
        _id: id,
        is_deleted: true,
      });

      if (!department) {
        throw new NotFoundException('Deleted department not found');
      }

      department.is_deleted = false;
      department.deleted_at = undefined;
      await department.save();

      await department.populate('universityId', 'universityName location');

      return {
        message: 'Department restored successfully',
        data: department,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to restore department');
    }
  }

  // Get All Deleted Departments (for admin)
  async findAllDeleted() {
    try {
      const departments = await this.departmentModel
        .find({ is_deleted: true })
        .populate('universityId', 'universityName location')
        .sort({ deleted_at: -1 });

      return {
        message: 'Deleted departments retrieved successfully',
        data: departments,
        count: departments.length,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve deleted departments',
      );
    }
  }

  // Permanent Delete (for admin only)
  async permanentDelete(id: string) {
    try {
      const department = await this.departmentModel.findByIdAndDelete(id);

      if (!department) {
        throw new NotFoundException('Department not found');
      }

      return {
        message: 'Department permanently deleted',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to permanently delete department',
      );
    }
  }
}
