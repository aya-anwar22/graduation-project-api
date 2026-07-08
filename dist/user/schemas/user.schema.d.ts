import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    ADMIN = "admin",
    DOCTOR = "doctor",
    STUDENT = "student"
}
export declare class User {
    fullName: string;
    email: string;
    password: string;
    isVerified: boolean;
    role: UserRole;
    phoneNumber: string;
    profileImage: string;
    departmentId?: Types.ObjectId;
    universityId?: Types.ObjectId;
    universityCode?: string;
    bio?: string;
    lastLogin?: Date;
    isDeleted: boolean;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any, {}> & User & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
