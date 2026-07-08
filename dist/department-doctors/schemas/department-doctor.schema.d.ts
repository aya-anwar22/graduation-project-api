import { Document, Types } from 'mongoose';
export type DepartmentDoctorDocument = DepartmentDoctor & Document;
export declare class DepartmentDoctor {
    departmentId: Types.ObjectId;
    doctorId: Types.ObjectId;
    isHead: boolean;
}
export declare const DepartmentDoctorSchema: import("mongoose").Schema<DepartmentDoctor, import("mongoose").Model<DepartmentDoctor, any, any, any, Document<unknown, any, DepartmentDoctor, any, {}> & DepartmentDoctor & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DepartmentDoctor, Document<unknown, {}, import("mongoose").FlatRecord<DepartmentDoctor>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<DepartmentDoctor> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
