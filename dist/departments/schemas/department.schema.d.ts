import { Document, Types } from 'mongoose';
export type DepartmentDocument = Department & Document;
export declare class Department {
    departmentName: string;
    universityId: Types.ObjectId;
    is_deleted: boolean;
    deleted_at?: Date;
}
export declare const DepartmentSchema: import("mongoose").Schema<Department, import("mongoose").Model<Department, any, any, any, Document<unknown, any, Department, any, {}> & Department & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Department, Document<unknown, {}, import("mongoose").FlatRecord<Department>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Department> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
