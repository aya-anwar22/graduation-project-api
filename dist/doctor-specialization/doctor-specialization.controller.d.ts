import { DoctorSpecializationService } from './doctor-specialization.service';
import { UserRole } from 'src/user/schemas/user.schema';
import { UpdateDoctorProfileDto } from './dto/update-doctor-specialization.dto';
export declare class DoctorSpecializationController {
    private readonly doctorService;
    constructor(doctorService: DoctorSpecializationService);
    getStats(doctorId: string): Promise<{
        success: boolean;
        data: {
            totalTeams: number;
            totalMembers: any;
            activeTeams: any;
            completedProjects: any;
        };
    }>;
    getDashboardSummary(doctorId: string): Promise<{
        success: boolean;
        data: {
            totalStudents: any;
            activeStudents: any;
            totalTeams: number;
            activeProjects: any;
        };
    }>;
    getMyStudents(doctorId: string, departmentId?: string, universityId?: string, page?: number, limit?: number): Promise<{
        success: boolean;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
        data: any[];
    }>;
    getStudentDetails(studentId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getProfile(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            academicInfo: (import("mongoose").FlattenMaps<{
                userId: import("mongoose").Types.ObjectId;
                academicTitle: string;
                specialization: string[];
                academicDegree: string;
                yearsOfExperience: number;
            }> & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            }) | null;
            fullName: string;
            email: string;
            password: string;
            isVerified: boolean;
            role: UserRole;
            phoneNumber: string;
            profileImage: string;
            departmentId?: import("mongoose").Types.ObjectId | undefined;
            universityId?: import("mongoose").Types.ObjectId | undefined;
            universityCode?: string | undefined;
            bio?: string | undefined;
            lastLogin?: Date | undefined;
            isDeleted: boolean;
            _id: import("mongoose").Types.ObjectId;
            __v: number;
        };
    }>;
    updateProfile(userId: string, updateData: UpdateDoctorProfileDto, profileImage?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            academicInfo: (import("mongoose").FlattenMaps<{
                userId: import("mongoose").Types.ObjectId;
                academicTitle: string;
                specialization: string[];
                academicDegree: string;
                yearsOfExperience: number;
            }> & {
                _id: import("mongoose").Types.ObjectId;
            } & {
                __v: number;
            }) | null;
            fullName: string;
            email: string;
            password: string;
            isVerified: boolean;
            role: UserRole;
            phoneNumber: string;
            profileImage: string;
            departmentId?: import("mongoose").Types.ObjectId | undefined;
            universityId?: import("mongoose").Types.ObjectId | undefined;
            universityCode?: string | undefined;
            bio?: string | undefined;
            lastLogin?: Date | undefined;
            isDeleted: boolean;
            _id: import("mongoose").Types.ObjectId;
            __v: number;
        };
    }>;
}
