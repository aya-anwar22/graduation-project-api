import { Document, Types } from 'mongoose';
export type GroupChatMessageDocument = GroupChatMessage & Document;
export declare class GroupChatMessage {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    message: string;
    attachments?: string[];
}
export declare const GroupChatMessageSchema: import("mongoose").Schema<GroupChatMessage, import("mongoose").Model<GroupChatMessage, any, any, any, Document<unknown, any, GroupChatMessage, any, {}> & GroupChatMessage & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GroupChatMessage, Document<unknown, {}, import("mongoose").FlatRecord<GroupChatMessage>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<GroupChatMessage> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
