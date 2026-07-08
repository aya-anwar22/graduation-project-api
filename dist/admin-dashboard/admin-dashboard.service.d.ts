import { Model, Types } from 'mongoose';
import { User, UserRole } from "../user/schemas/user.schema";
import { University } from "../universities/schemas/university.schema";
import { Department } from "../departments/schemas/department.schema";
import { Project } from "../projects/schemas/project.schema";
import { SupervisionRequest } from "../supervision-requests/schemas/supervision-request.schema";
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { DepartmentDoctor } from "../department-doctors/schemas/department-doctor.schema";
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Team } from "../teams/schemas/team.schema";
import { TeamMember } from "../teams/schemas/team-member.schema";
import { DoctorProfile } from "../doctor-specialization/schema/doctor-specialization.schema";
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserAuth } from "../auth/schemas/user-auth.schema";
export declare class AdminDashboardService {
    private userModel;
    private universityModel;
    private departmentModel;
    private projectModel;
    private supervisionRequestModel;
    private departmentDoctorModel;
    private teamModel;
    private teamMemberModel;
    private doctorProfileModel;
    private UserAuthModel;
    constructor(userModel: Model<User>, universityModel: Model<University>, departmentModel: Model<Department>, projectModel: Model<Project>, supervisionRequestModel: Model<SupervisionRequest>, departmentDoctorModel: Model<DepartmentDoctor>, teamModel: Model<Team>, teamMemberModel: Model<TeamMember>, doctorProfileModel: Model<DoctorProfile>, UserAuthModel: Model<UserAuth>);
    getAdminStats(): Promise<{
        success: boolean;
        data: {
            universities: number;
            departments: number;
            doctors: number;
            students: number;
            totalProjects: number;
            activeProjects: number;
            completedProjects: number;
            pendingRequests: number;
        };
    }>;
    createUser(dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: Types.ObjectId;
            role: UserRole;
        };
    }>;
    findAllUniversities(): Promise<(import("mongoose").Document<unknown, {}, University, {}, {}> & University & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    findDepartmentsByUniversity(universityId: string): Promise<(import("mongoose").Document<unknown, {}, Department, {}, {}> & Department & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getProjectsDistributionByUniversity(): Promise<{
        success: boolean;
        data: any[];
    }>;
    createUniversity(dto: CreateUniversityDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, University, {}, {}> & University & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    getAllUniversitiesWithDetails(query: {
        searchTerm?: string;
        isDeletedFilter?: boolean | null;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getUniversityDetails(universityId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    updateUniversity(id: string, dto: UpdateUniversityDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, University, {}, {}> & University & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    toggleUniversityStatus(id: string): Promise<{
        success: boolean;
        message: string;
        currentStatus: string;
    }>;
    getDepartmentStats(): Promise<{
        success: boolean;
        data: {
            totalDepartments: any;
            activeDepartments: any;
            totalDoctors: any;
            departmentHeads: any;
        };
    }>;
    createDepartment(data: {
        departmentName: string;
        universityId: string;
        headDoctorId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, Department, {}, {}> & Department & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    getDoctorsByUniversity(universityId: string): Promise<{
        success: boolean;
        count: number;
        data: (import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getAllDepartments(query: {
        searchTerm?: string;
        isDeletedFilter?: boolean | null;
        universityId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
        };
    }>;
    updateDepartment(id: string, dto: UpdateDepartmentDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, Department, {}, {}> & Department & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    toggleDepartmentStatus(id: string): Promise<{
        success: boolean;
        message: string;
        currentStatus: string;
    }>;
    getUniversitiesList(departmentId?: string): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, University, {}, {}> & University & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getDoctorStats(): Promise<{
        success: boolean;
        data: {
            totalDoctors: number;
            activeDoctors: number;
            inactiveDoctors: number;
            departmentHeads: number;
        };
    }>;
    getAllDoctorsDetailed(query: {
        searchTerm?: string;
        departmentId?: string;
        isHead?: any;
        academicTitle?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getDoctorFullProfile(doctorId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getProjectsStats(): Promise<{
        success: boolean;
        data: any;
    }>;
    getAllProjectsDetailed(query: {
        page?: number;
        limit?: number;
        searchTerm?: string;
        universityId?: string;
        departmentId?: string;
        doctorId?: string;
        year?: string;
        status?: string;
    }): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    getProjectFullDetails(projectId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getTeamsStats(): Promise<{
        success: boolean;
        data: {
            totalTeams: any;
            activeTeams: any;
            totalMembers: number;
            thisYearTeams: any;
        };
    }>;
    getAllTeamsDetailed(query: {
        page?: number;
        limit?: number;
        searchTerm?: string;
        universityId?: string;
        departmentId?: string;
        doctorId?: string;
        year?: string;
    }): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    getTeamDetailsById(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getUsersStatistics(): Promise<{
        success: boolean;
        data: {
            totalUsers: any;
            totalDoctors: any;
            totalStudents: any;
            verifiedUsers: any;
        };
    }>;
    getAllUsersDetailed(query: {
        page?: number;
        limit?: number;
        searchTerm?: string;
        role?: string;
        universityId?: string;
        departmentId?: string;
        isVerified?: string;
        status?: string;
    }): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    updateByAdmin(userId: string, updateDto: UpdateUserAdminDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    toggleUserStatus(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: Types.ObjectId;
            isDeleted: boolean;
        };
    }>;
    getUserDetailsById(userId: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
