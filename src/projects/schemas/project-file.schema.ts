import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectFileDocument = ProjectFile & Document;

@Schema({ timestamps: true })
export class ProjectFile {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project_id: Types.ObjectId;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  filepath: string;

  @Prop({ type: Number })
  fileSize: number;

  @Prop()
  cloudinary_public_id: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  uploaded_by: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProjectFileSchema = SchemaFactory.createForClass(ProjectFile);
