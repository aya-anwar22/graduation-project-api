import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UploadProjectFileDto {
  @IsString()
  projectId: string;
}
