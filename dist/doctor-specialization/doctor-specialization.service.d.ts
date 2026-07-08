import { Model, Types } from 'mongoose';
import { DoctorProfile } from './schema/doctor-specialization.schema';
import { User, UserRole } from "../user/schemas/user.schema";
import { UpdateDoctorProfileDto } from './dto/update-doctor-specialization.dto';
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { Team } from "../teams/schemas/team.schema";
export declare class DoctorSpecializationService {
    private teamModel;
    private doctorProfileModel;
    private userModel;
    private readonly cloudinaryService;
    constructor(teamModel: Model<Team>, doctorProfileModel: Model<DoctorProfile>, userModel: Model<User>, cloudinaryService: CloudinaryService);
    private validateObjectId;
    getDetailedDoctorStats(doctorId: string): Promise<{
        success: boolean;
        data: {
            totalStudents: any;
            activeStudents: any;
            totalTeams: number;
            activeProjects: any;
        };
    }>;
    getDoctorStats(doctorId: string): Promise<{
        success: boolean;
        data: {
            totalTeams: number;
            totalMembers: any;
            activeTeams: any;
            completedProjects: any;
        };
    }>;
    getDoctorStudents(doctorId: string, filters: {
        departmentId?: string;
        universityId?: string;
    }, page?: number, limit?: number): Promise<{
        success: boolean;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
        data: any[];
    }>;
    getStudentDetailsForDoctor(studentId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getDoctorProfile(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            academicInfo: (import("mongoose").FlattenMaps<{
                userId: Types.ObjectId;
                academicTitle: string;
                specialization: string[];
                academicDegree: string;
                yearsOfExperience: number;
            }> & {
                _id: Types.ObjectId;
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
            departmentId?: Types.ObjectId | undefined;
            universityId?: Types.ObjectId | undefined;
            universityCode?: string | undefined;
            bio?: string | undefined;
            lastLogin?: Date | undefined;
            isDeleted: boolean;
            _id: Types.ObjectId;
            __v: number;
        };
    }>;
    updateDoctorProfile(userId: string, updateData: UpdateDoctorProfileDto, profileImage?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: {
            academicInfo: (import("mongoose").FlattenMaps<{
                userId: Types.ObjectId;
                academicTitle: string;
                specialization: string[];
                academicDegree: string;
                yearsOfExperience: number;
            }> & {
                _id: Types.ObjectId;
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
            departmentId?: Types.ObjectId | undefined;
            universityId?: Types.ObjectId | undefined;
            universityCode?: string | undefined;
            bio?: string | undefined;
            lastLogin?: Date | undefined;
            isDeleted: boolean;
            _id: Types.ObjectId;
            __v: number;
        };
    }>;
    private handleImageUploadAsync;
}
