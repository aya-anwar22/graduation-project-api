import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsMongoId,
} from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class CreateUserAdminDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string; // ضيفي ! هنا

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;

  @IsPhoneNumber('EG')
  phoneNumber!: string;

  @IsMongoId()
  @IsOptional()
  universityId?: string;

  @IsMongoId()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  universityCode?: string;
}
