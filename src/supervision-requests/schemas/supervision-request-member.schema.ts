import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SupervisionRequestMemberDocument = SupervisionRequestMember &
  Document;

@Schema({ timestamps: true })
export class SupervisionRequestMember {
  @Prop({ type: Types.ObjectId, ref: 'SupervisionRequest', required: true })
  request_id: Types.ObjectId;

  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  university_number: string;

  @Prop({ required: true })
  contact_email: string;

  @Prop({ default: false })
  isLeader: boolean;
}

export const SupervisionRequestMemberSchema = SchemaFactory.createForClass(
  SupervisionRequestMember,
);
