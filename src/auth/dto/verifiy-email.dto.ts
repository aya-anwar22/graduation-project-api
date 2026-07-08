import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class VerifiyDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'يجب أن يتكون الرمز من 6 أحرف على الأقل' })
  @MaxLength(6, { message: 'يجب ألا يتجاوز الرمز 6 أحرف' })
  code: string;
}
