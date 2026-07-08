// src/user/dto/update-user-admin.dto.ts
import { IsEnum, IsOptional, IsMongoId } from 'class-validator';
import { UserRole } from 'src/user/schemas/user.schema';

export class UpdateUserAdminDto {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsMongoId()
  @IsOptional()
  universityId?: string;

  @IsMongoId()
  @IsOptional()
  departmentId?: string;
}
