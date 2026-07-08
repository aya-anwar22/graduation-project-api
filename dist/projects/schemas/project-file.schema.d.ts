import { Document, Types } from 'mongoose';
export type ProjectFileDocument = ProjectFile & Document;
export declare class ProjectFile {
    project_id: Types.ObjectId;
    filename: string;
    filepath: string;
    fileSize: number;
    cloudinary_public_id: string;
    uploaded_by: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const ProjectFileSchema: import("mongoose").Schema<ProjectFile, import("mongoose").Model<ProjectFile, any, any, any, Document<unknown, any, ProjectFile, any, {}> & ProjectFile & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectFile, Document<unknown, {}, import("mongoose").FlatRecord<ProjectFile>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ProjectFile> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
