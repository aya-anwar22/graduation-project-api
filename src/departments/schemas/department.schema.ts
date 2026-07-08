import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true })
export class Department {
  @Prop({ required: true })
  departmentName: string;

  @Prop({ type: Types.ObjectId, ref: 'University', required: true })
  universityId: Types.ObjectId;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop()
  deleted_at?: Date;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
