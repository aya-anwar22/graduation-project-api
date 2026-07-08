import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupervisionRequestDocument = SupervisionRequest & Document;

@Schema({ timestamps: true })
export class SupervisionRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @Prop({ required: true })
  project_name: string;

  @Prop({ required: true })
  project_description: string;

  @Prop({ required: true })
  main_objectives: string;

  @Prop({ required: true })
  year: string;

  @Prop({ required: true })
  project_type: string;

  @Prop({ type: [String], default: [] })
  technologies: string[];

  @Prop()
  prerequisites?: string;

  @Prop()
  additional_notes?: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project_id?: Types.ObjectId;
}

export const SupervisionRequestSchema =
  SchemaFactory.createForClass(SupervisionRequest);
