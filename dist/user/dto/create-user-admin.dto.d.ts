import { UserRole } from '../schemas/user.schema';
export declare class CreateUserAdminDto {
    fullName: string;
    email: string;
    password: string;
    role: UserRole;
    phoneNumber: string;
    universityId?: string;
    departmentId?: string;
    universityCode?: string;
}
