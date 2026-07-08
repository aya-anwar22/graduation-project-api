import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUniversityDto {
  @IsString()
  @IsOptional()
  universityName?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;
}
