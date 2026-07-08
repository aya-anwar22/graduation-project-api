import { Document, Types } from 'mongoose';
export type UserAuthDocument = UserAuth & Document;
export declare class UserAuth {
    userId: Types.ObjectId;
    emailVerificationCode?: string;
    verificationCodeExpiry?: Date;
    resetPasswordCode?: string;
    resetPasswordExpiry?: Date;
    refreshToken?: string;
    refreshTokenExpiry?: Date;
}
export declare const UserAuthSchema: import("mongoose").Schema<UserAuth, import("mongoose").Model<UserAuth, any, any, any, Document<unknown, any, UserAuth, any, {}> & UserAuth & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserAuth, Document<unknown, {}, import("mongoose").FlatRecord<UserAuth>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<UserAuth> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
