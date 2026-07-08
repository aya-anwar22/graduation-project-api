import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../user/schemas/user.schema';
@Injectable()
export class DataFixService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async updateAllPasswords() {
    const newPassword = 'khtwa1234';
    const saltRounds = 12;

    // 1. عمل هاش للباسورد الجديد مرة واحدة
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 2. تحديث جميع المستخدمين في قاعدة البيانات
    const result = await this.userModel.updateMany(
      {}, // التحديث لكل الداتا
      { $set: { password: hashedPassword } },
    );

    console.log(`تم تحديث ${result.modifiedCount} مستخدم بنجاح.`);
  }
}
