import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UniversityDocument = University & Document;

@Schema({ timestamps: true })
export class University {
  @Prop({ required: true })
  universityName: string;

  @Prop()
  location: string;

  @Prop()
  contactEmail: string;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop()
  deleted_at: Date;
}

export const UniversitySchema = SchemaFactory.createForClass(University);
