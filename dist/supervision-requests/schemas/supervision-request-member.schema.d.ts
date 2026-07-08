import { Document, Types } from 'mongoose';
export type SupervisionRequestMemberDocument = SupervisionRequestMember & Document;
export declare class SupervisionRequestMember {
    request_id: Types.ObjectId;
    full_name: string;
    role: string;
    university_number: string;
    contact_email: string;
    isLeader: boolean;
}
export declare const SupervisionRequestMemberSchema: import("mongoose").Schema<SupervisionRequestMember, import("mongoose").Model<SupervisionRequestMember, any, any, any, Document<unknown, any, SupervisionRequestMember, any, {}> & SupervisionRequestMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SupervisionRequestMember, Document<unknown, {}, import("mongoose").FlatRecord<SupervisionRequestMember>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<SupervisionRequestMember> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
