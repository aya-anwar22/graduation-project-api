import { Model, Types } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { UserProfileResponseDto, UpdateProfileResponseDto } from './dto/user-profile-response.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DepartmentDoctor } from "../department-doctors/schemas/department-doctor.schema";
import { Department } from "../departments/schemas/department.schema";
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
export declare class UserService {
    private readonly userModel;
    private readonly cloudinaryService;
    private readonly departmentDoctorModel;
    private readonly departmentModel;
    constructor(userModel: Model<UserDocument>, cloudinaryService: CloudinaryService, departmentDoctorModel: Model<DepartmentDoctor>, departmentModel: Model<Department>);
    private validateObjectId;
    private findUserById;
    private findUserByIdNullable;
    private mapToUserProfileResponse;
    private handleImageUpload;
    private updateUser;
    getMyProfile(userId: string): Promise<UserProfileResponseDto>;
    updateMyProfile(userId: string, updateData: UpdateStudentProfileDto, profileImage?: Express.Multer.File): Promise<UpdateProfileResponseDto>;
    private handleImageUploadAsync;
    findDoctorsByDepartment(departmentId: string): Promise<{
        success: boolean;
        results: number;
        data: {
            isHead: boolean;
            _id: Types.ObjectId;
        }[];
    }>;
    makeDoctor(userId: string, departmentId: string): Promise<{
        message: string;
        doctorId: string;
        departmentId: string;
    }>;
    createUserByAdmin(createUserDto: CreateUserAdminDto): Promise<UserDocument>;
}
