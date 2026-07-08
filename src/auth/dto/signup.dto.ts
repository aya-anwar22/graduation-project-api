import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsMongoId,
  IsOptional,
  Matches,
} from 'class-validator';
import { Match } from '../../common/validators/match-passwords.validator';

export class SignupDto {
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' })
  password: string;

  @IsOptional()
  @IsMongoId({ message: 'القسم غير موجود' })
  departmentId?: string;

  @IsOptional()
  @IsMongoId({ message: 'الجامعه غير موجوده' })
  universityId?: string;

  @IsOptional()
  universityCode?: string;

  @IsOptional()
  @Matches(/^[0-9]{10,15}$/, {
    message: 'رقم الهاتف يجب أن يكون بين 10 و 15 رقم',
  })
  phoneNumber?: string;
}
