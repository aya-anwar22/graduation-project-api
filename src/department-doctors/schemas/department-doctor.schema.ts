import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Department } from 'src/departments/schemas/department.schema';
import { User } from 'src/user/schemas/user.schema';

export type DepartmentDoctorDocument = DepartmentDoctor & Document;

@Schema({ timestamps: true })
export class DepartmentDoctor {
  @Prop({ type: Types.ObjectId, ref: Department.name, required: true })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ default: false })
  isHead: boolean;
}

export const DepartmentDoctorSchema =
  SchemaFactory.createForClass(DepartmentDoctor);
