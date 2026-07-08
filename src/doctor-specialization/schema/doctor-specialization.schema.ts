import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class DoctorProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  academicTitle: string;

  @Prop({ type: [String], required: true })
  specialization: string[];
  @Prop({ required: true })
  academicDegree: string;

  @Prop({ required: true, min: 0 })
  yearsOfExperience: number;
}

export const DoctorProfileSchema = SchemaFactory.createForClass(DoctorProfile);
