import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Match } from '../../common/validators/match-passwords.validator';

export class ResetPasswordDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @IsNotEmpty()
  @MinLength(8)
  @Match('newPassword', {
    message: 'يجب أن تتطابق كلمة المرور المؤكدة مع كلمة المرور الجديدة',
  })
  confirmNewPassword: string;
}
