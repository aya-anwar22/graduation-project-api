import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class UpdateDoctorProfileDto {
  // بيانات من جدول User
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  // بيانات من جدول DoctorProfile
  @IsOptional()
  @IsString()
  academicTitle?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    // لو القيمة جاية نص وشكلها JSON (زي اللي حصل معاكي)
    if (typeof value === 'string' && value.startsWith('[')) {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    // لو جاية كـ String عادي من غير أقواس
    if (typeof value === 'string') return [value];
    return value;
  })
  specialization?: string[];

  @IsOptional()
  @IsString()
  academicDegree?: string;

  @IsOptional()
  yearsOfExperience?: string;
}
