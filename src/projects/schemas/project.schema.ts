import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  year: string;

  @Prop({ default: 'in_progress' })
  status: 'in_progress' | 'completed' | 'start';
  a;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  created_by: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SupervisionRequest' })
  supervision_request_id?: Types.ObjectId;

  @Prop()
  projectLink: string;

  @Prop()
  projectImage: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
