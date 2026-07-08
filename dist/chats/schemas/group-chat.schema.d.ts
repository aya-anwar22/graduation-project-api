import { Document, Types } from 'mongoose';
export type GroupChatDocument = GroupChat & Document;
export declare class GroupChat {
    name: string;
    memberIds: Types.ObjectId[];
    description?: string;
}
export declare const GroupChatSchema: import("mongoose").Schema<GroupChat, import("mongoose").Model<GroupChat, any, any, any, Document<unknown, any, GroupChat, any, {}> & GroupChat & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GroupChat, Document<unknown, {}, import("mongoose").FlatRecord<GroupChat>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<GroupChat> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
