import { Document, Types } from 'mongoose';
export type ProjectDocument = Project & Document;
export declare class Project {
    title: string;
    description: string;
    year: string;
    status: 'in_progress' | 'completed' | 'start';
    a: any;
    doctorId: Types.ObjectId;
    created_by: Types.ObjectId;
    supervision_request_id?: Types.ObjectId;
    projectLink: string;
    projectImage: string;
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, Document<unknown, any, Project, any, {}> & Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Project> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
