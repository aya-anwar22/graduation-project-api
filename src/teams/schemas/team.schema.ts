import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Project } from 'src/projects/schemas/project.schema';
import { User } from 'src/user/schemas/user.schema';

export type TeamDocument = Team & Document;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ type: Types.ObjectId, ref: Project.name, required: true })
  project_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  lead_id: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
