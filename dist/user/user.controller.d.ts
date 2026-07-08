import { UserService } from './user.service';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { MakeDoctorDto } from './dto/make-doctor.dto';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getMyProfile(userId: string): Promise<import("./dto/user-profile-response.dto").UserProfileResponseDto>;
    updateMyProfile(userId: string, updateData: UpdateStudentProfileDto, profileImage?: Express.Multer.File): Promise<import("./dto/user-profile-response.dto").UpdateProfileResponseDto>;
    makeDoctor(makeDoctorDto: MakeDoctorDto): Promise<{
        message: string;
        doctorId: string;
        departmentId: string;
    }>;
    findDoctorsByDepartment(departmentId: string): Promise<{
        success: boolean;
        results: number;
        data: {
            isHead: boolean;
            _id: import("mongoose").Types.ObjectId;
        }[];
    }>;
    adminCreateUser(createUserDto: CreateUserAdminDto): Promise<import("./schemas/user.schema").UserDocument>;
}
