import { Document } from 'mongoose';
export type UniversityDocument = University & Document;
export declare class University {
    universityName: string;
    location: string;
    contactEmail: string;
    is_deleted: boolean;
    deleted_at: Date;
}
export declare const UniversitySchema: import("mongoose").Schema<University, import("mongoose").Model<University, any, any, any, Document<unknown, any, University, any, {}> & University & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, University, Document<unknown, {}, import("mongoose").FlatRecord<University>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<University> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
