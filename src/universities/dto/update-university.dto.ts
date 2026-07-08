import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUniversityDto {
  @IsOptional()
  @IsString()
  universityName?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEmail()
  email_contact?: string;
}
