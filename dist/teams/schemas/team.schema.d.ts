import { Document, Types } from 'mongoose';
export type TeamDocument = Team & Document;
export declare class Team {
    name: string;
    code: string;
    project_id: Types.ObjectId;
    doctorId: Types.ObjectId;
    lead_id: Types.ObjectId;
}
export declare const TeamSchema: import("mongoose").Schema<Team, import("mongoose").Model<Team, any, any, any, Document<unknown, any, Team, any, {}> & Team & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Team, Document<unknown, {}, import("mongoose").FlatRecord<Team>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Team> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
