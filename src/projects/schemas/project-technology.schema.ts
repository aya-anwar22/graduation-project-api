import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Project } from './project.schema';

export type ProjectTechnologyDocument = ProjectTechnology & Document;

@Schema({ timestamps: true })
export class ProjectTechnology {
  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project_id: Types.ObjectId;

  @Prop({ required: true })
  tech_name: string;
}

export const ProjectTechnologySchema =
  SchemaFactory.createForClass(ProjectTechnology);
