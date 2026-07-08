import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroupChat, GroupChatDocument } from './group-chat.schema';

@Injectable()
export class GroupChatsService {
  constructor(
    @InjectModel(GroupChat.name)
    private groupChatModel: Model<GroupChatDocument>,
  ) {}

  async createGroupChat(
    name: string,
    memberIds: Types.ObjectId[],
    description?: string,
  ) {
    const groupChat = await this.groupChatModel.create({
      name,
      memberIds,
      description,
    });

    return groupChat;
  }

  async addMemberToChat(chatId: Types.ObjectId, memberId: Types.ObjectId) {
    await this.groupChatModel.findByIdAndUpdate(chatId, {
      $addToSet: { memberIds: memberId },
    });
  }

  async removeMemberFromChat(chatId: Types.ObjectId, memberId: Types.ObjectId) {
    await this.groupChatModel.findByIdAndUpdate(chatId, {
      $pull: { memberIds: memberId },
    });
  }
}
