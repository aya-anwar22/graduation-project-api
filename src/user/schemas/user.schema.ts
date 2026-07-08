import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  STUDENT = 'student',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: true, enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop()
  phoneNumber: string;

  @Prop({ default: null })
  profileImage: string;

  @Prop({ type: Types.ObjectId, ref: 'Department', required: false })
  departmentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'University', required: false })
  universityId?: Types.ObjectId;

  @Prop({ type: String, unique: true, sparse: true })
  universityCode?: string;

  @Prop()
  bio?: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
