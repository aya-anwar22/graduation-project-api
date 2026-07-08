import { Document, Types } from 'mongoose';
export type TeamMemberDocument = TeamMember & Document;
export declare class TeamMember {
    team_id: Types.ObjectId;
    user_id: Types.ObjectId;
    role: string;
    role_description?: string;
    university_number?: string;
    contact_email?: string;
}
export declare const TeamMemberSchema: import("mongoose").Schema<TeamMember, import("mongoose").Model<TeamMember, any, any, any, Document<unknown, any, TeamMember, any, {}> & TeamMember & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TeamMember, Document<unknown, {}, import("mongoose").FlatRecord<TeamMember>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<TeamMember> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
