import { Model } from 'mongoose';
import { UserDocument } from '../user/schemas/user.schema';
export declare class DataFixService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    updateAllPasswords(): Promise<void>;
}
