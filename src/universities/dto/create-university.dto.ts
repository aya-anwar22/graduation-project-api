import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUniversityDto {
  @IsNotEmpty()
  @IsString()
  universityName: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEmail()
  email_contact?: string;
}
