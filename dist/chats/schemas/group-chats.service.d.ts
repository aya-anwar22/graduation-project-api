import { Model, Types } from 'mongoose';
import { GroupChat, GroupChatDocument } from './group-chat.schema';
export declare class GroupChatsService {
    private groupChatModel;
    constructor(groupChatModel: Model<GroupChatDocument>);
    createGroupChat(name: string, memberIds: Types.ObjectId[], description?: string): Promise<import("mongoose").Document<unknown, {}, GroupChatDocument, {}, {}> & GroupChat & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    addMemberToChat(chatId: Types.ObjectId, memberId: Types.ObjectId): Promise<void>;
    removeMemberFromChat(chatId: Types.ObjectId, memberId: Types.ObjectId): Promise<void>;
}
