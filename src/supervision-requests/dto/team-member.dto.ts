import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamMemberDto {
  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsNotEmpty()
  @IsString()
  role: string;

  @IsOptional()
  @IsBoolean()
  isLeader: boolean;

  @IsNotEmpty()
  @IsString()
  university_number: string;

  @IsNotEmpty()
  @IsString()
  contact_email: string;
}
