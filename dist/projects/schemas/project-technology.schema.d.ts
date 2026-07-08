import { Document, Types } from 'mongoose';
export type ProjectTechnologyDocument = ProjectTechnology & Document;
export declare class ProjectTechnology {
    project_id: Types.ObjectId;
    tech_name: string;
}
export declare const ProjectTechnologySchema: import("mongoose").Schema<ProjectTechnology, import("mongoose").Model<ProjectTechnology, any, any, any, Document<unknown, any, ProjectTechnology, any, {}> & ProjectTechnology & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectTechnology, Document<unknown, {}, import("mongoose").FlatRecord<ProjectTechnology>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ProjectTechnology> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
