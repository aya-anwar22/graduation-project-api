import { AdminDashboardService } from './admin-dashboard.service';
import { UserRole } from 'src/user/schemas/user.schema';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
export declare class AdminDashboardController {
    private readonly adminService;
    constructor(adminService: AdminDashboardService);
    getAllUniversities(): Promise<(import("mongoose").Document<unknown, {}, import("../universities/schemas/university.schema").University, {}, {}> & import("../universities/schemas/university.schema").University & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getDepartmentsByUni(universityId: string): Promise<(import("mongoose").Document<unknown, {}, import("../departments/schemas/department.schema").Department, {}, {}> & import("../departments/schemas/department.schema").Department & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    creatuser(createUserDto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: import("mongoose").Types.ObjectId;
            role: UserRole;
        };
    }>;
    getUniversityDetails(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getUserDetails(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getDetails(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getStats(): Promise<{
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
    getProjectsByUniversity(): Promise<{
        success: boolean;
        data: any[];
    }>;
    getUniversities(searchTerm: string, page: number, limit: number, isDeleted: string): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getStatsDepartment(): Promise<{
        success: boolean;
        data: {
            totalDepartments: any;
            activeDepartments: any;
            totalDoctors: any;
            departmentHeads: any;
        };
    }>;
    getUniList(departmentId?: string): Promise<{
        success: boolean;
        data: (import("mongoose").Document<unknown, {}, import("../universities/schemas/university.schema").University, {}, {}> & import("../universities/schemas/university.schema").University & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getDoctorsByUni(universityId: string): Promise<{
        success: boolean;
        count: number;
        data: (import("mongoose").Document<unknown, {}, import("src/user/schemas/user.schema").User, {}, {}> & import("src/user/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
    }>;
    getDepts(query: any): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getDocStats(): Promise<{
        success: boolean;
        data: {
            totalDoctors: number;
            activeDoctors: number;
            inactiveDoctors: number;
            departmentHeads: number;
        };
    }>;
    getDoctors(searchTerm: string, departmentId: string, isHead: boolean, academicTitle: string, status: string, page: number, limit: number): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
        };
    }>;
    getProfile(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getSummary(): Promise<{
        success: boolean;
        data: any;
    }>;
    getProjects(page: number, limit: number, searchTerm: string, universityId: string, departmentId: string, doctorId: string, year: string, status: string): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    getStatsTeam(): Promise<{
        success: boolean;
        data: {
            totalTeams: any;
            activeTeams: any;
            totalMembers: number;
            thisYearTeams: any;
        };
    }>;
    getAllTeams(page: number, limit: number, searchTerm: string, universityId: string, departmentId: string, doctorId: string, year: string): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    getUsersStats(): Promise<{
        success: boolean;
        data: {
            totalUsers: any;
            totalDoctors: any;
            totalStudents: any;
            verifiedUsers: any;
        };
    }>;
    getTeamDetails(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getUsers(page: number, limit: number, searchTerm: string, role: string, universityId: string, departmentId: string, isVerified: string, status: string): Promise<{
        success: boolean;
        data: any;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
            limit: number;
        };
    }>;
    addUniversity(createUniversityDto: CreateUniversityDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../universities/schemas/university.schema").University, {}, {}> & import("../universities/schemas/university.schema").University & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    addDepartment(createDto: {
        departmentName: string;
        universityId: string;
        headDoctorId?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../departments/schemas/department.schema").Department, {}, {}> & import("../departments/schemas/department.schema").Department & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    update(id: string, dto: UpdateUniversityDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../universities/schemas/university.schema").University, {}, {}> & import("../universities/schemas/university.schema").University & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        currentStatus: string;
    }>;
    updateUserData(id: string, updateDto: UpdateUserAdminDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("src/user/schemas/user.schema").User, {}, {}> & import("src/user/schemas/user.schema").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    toggleStatus(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            userId: import("mongoose").Types.ObjectId;
            isDeleted: boolean;
        };
    }>;
    updateDept(id: string, dto: UpdateDepartmentDto): Promise<{
        success: boolean;
        message: string;
        data: import("mongoose").Document<unknown, {}, import("../departments/schemas/department.schema").Department, {}, {}> & import("../departments/schemas/department.schema").Department & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        };
    }>;
    toggleDeptStatus(id: string): Promise<{
        success: boolean;
        message: string;
        currentStatus: string;
    }>;
}
