import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTeamMemberDto } from './team-member.dto';

export class CreateSupervisionRequestDto {
  @IsNotEmpty()
  @IsString()
  project_name: string;

  @IsNotEmpty()
  @IsString()
  project_description: string;

  @IsNotEmpty()
  @IsString()
  main_objectives: string;

  @IsNotEmpty()
  year: string;

  @IsNotEmpty()
  @IsString()
  project_type: string;

  @IsArray()
  @IsString({ each: true })
  technologies: string[];

  @IsOptional()
  @IsString()
  prerequisites?: string;

  @IsOptional()
  @IsString()
  additional_notes?: string;

  @IsNotEmpty()
  @IsMongoId()
  doctorId: string;

  @IsNotEmpty()
  @IsMongoId()
  departmentId: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamMemberDto)
  team_members: CreateTeamMemberDto[];
}
