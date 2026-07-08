import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GroupChat } from './group-chat.schema';
import { User } from 'src/user/schemas/user.schema';

export type GroupChatMessageDocument = GroupChatMessage & Document;

@Schema({ timestamps: true })
export class GroupChatMessage {
  @Prop({ type: Types.ObjectId, ref: GroupChat.name, required: true })
  chatId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop()
  attachments?: string[];
}

export const GroupChatMessageSchema =
  SchemaFactory.createForClass(GroupChatMessage);
