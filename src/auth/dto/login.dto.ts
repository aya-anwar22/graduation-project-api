import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل' })
  password: string;
}
