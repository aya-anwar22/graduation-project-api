import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupChatsService } from './group-chats.service';
import { GroupChat, GroupChatSchema } from './group-chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GroupChat.name, schema: GroupChatSchema },
    ]),
  ],
  providers: [GroupChatsService],
  exports: [GroupChatsService],
})
export class GroupChatsModule {}
