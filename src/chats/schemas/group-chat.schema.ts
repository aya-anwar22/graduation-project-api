import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type GroupChatDocument = GroupChat & Document;

@Schema({ timestamps: true })
export class GroupChat {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [Types.ObjectId], ref: User.name, default: [] })
  memberIds: Types.ObjectId[];

  @Prop()
  description?: string;
}

export const GroupChatSchema = SchemaFactory.createForClass(GroupChat);
