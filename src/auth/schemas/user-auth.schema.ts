import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserAuthDocument = UserAuth & Document;

@Schema({ timestamps: true })
export class UserAuth {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop()
  emailVerificationCode?: string;

  @Prop()
  verificationCodeExpiry?: Date;

  @Prop()
  resetPasswordCode?: string;

  @Prop()
  resetPasswordExpiry?: Date;

  @Prop({ select: false })
  refreshToken?: string;

  @Prop()
  refreshTokenExpiry?: Date;
}

export const UserAuthSchema = SchemaFactory.createForClass(UserAuth);
