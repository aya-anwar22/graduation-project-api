import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Department } from 'src/departments/schemas/department.schema';
import {
  DepartmentDoctor,
  DepartmentDoctorDocument,
} from './schemas/department-doctor.schema';

@Injectable()
export class DepartmentDoctorsService {
  constructor(
    @InjectModel(DepartmentDoctor.name)
    private doctorModel: Model<DepartmentDoctorDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Department.name) private departmentModel: Model<Department>,
  ) {}

  async create(departmentId: string, doctorId: string, isHead = false) {
    const department = await this.departmentModel.findById(departmentId);
    if (!department) throw new BadRequestException('Department not found');
    const doctor = await this.userModel.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor')
      throw new BadRequestException('Doctor not found');
    const newRelation = new this.doctorModel({
      departmentId: new Types.ObjectId(departmentId),
      doctorId: new Types.ObjectId(doctorId),
      isHead,
    });
    return newRelation.save();
  }
  async findDoctorsByDepartment(departmentId: string) {
    return this.doctorModel
      .find({ departmentId })
      .populate('doctorId', 'fullName email role')
      .exec();
  }
}
