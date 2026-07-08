import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUniversityDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم الجامعة مطلوب' })
  universityName: string;

  @IsString()
  @IsNotEmpty({ message: 'وصف موقع الجامعة مطلوب (مثلاً: طريق بلبيس كيلو 21)' })
  location: string; // 👈 تم التغيير من website لـ location

  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صحيح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني للتواصل مطلوب' })
  contactEmail: string;
}
