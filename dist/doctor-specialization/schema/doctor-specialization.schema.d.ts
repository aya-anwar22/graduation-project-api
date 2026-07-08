import { Types } from 'mongoose';
export declare class DoctorProfile {
    userId: Types.ObjectId;
    academicTitle: string;
    specialization: string[];
    academicDegree: string;
    yearsOfExperience: number;
}
export declare const DoctorProfileSchema: import("mongoose").Schema<DoctorProfile, import("mongoose").Model<DoctorProfile, any, any, any, import("mongoose").Document<unknown, any, DoctorProfile, any, {}> & DoctorProfile & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DoctorProfile, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<DoctorProfile>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<DoctorProfile> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
