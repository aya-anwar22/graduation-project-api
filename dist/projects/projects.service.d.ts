import { Model, Types } from 'mongoose';
import { ProjectDocument } from './schemas/project.schema';
import { TeamDocument } from '../teams/schemas/team.schema';
import { TeamMemberDocument } from '../teams/schemas/team-member.schema';
import { ProjectFileDocument } from './schemas/project-file.schema';
import { ProjectTechnologyDocument } from './schemas/project-technology.schema';
import { SupervisionRequestDocument } from '../supervision-requests/schemas/supervision-request.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
export declare class ProjectsService {
    private readonly projectModel;
    private readonly teamModel;
    private readonly teamMemberModel;
    private readonly projectFileModel;
    private readonly projectTechnologyModel;
    private readonly supervisionRequestModel;
    private readonly userModel;
    private readonly cloudinaryService;
    constructor(projectModel: Model<ProjectDocument>, teamModel: Model<TeamDocument>, teamMemberModel: Model<TeamMemberDocument>, projectFileModel: Model<ProjectFileDocument>, projectTechnologyModel: Model<ProjectTechnologyDocument>, supervisionRequestModel: Model<SupervisionRequestDocument>, userModel: Model<UserDocument>, cloudinaryService: CloudinaryService);
    private checkUserProjectAccess;
    updateProjectStatus(projectId: string, doctorId: string, updateStatusDto: UpdateProjectStatusDto): Promise<{
        success: boolean;
        message: string;
        data: {
            projectId: Types.ObjectId;
            status: "in_progress" | "completed" | "start";
        };
    }>;
    getMyProject(studentId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            projectId: any;
            projectTitle: any;
            projectDescription: any;
            projectYear: any;
            projectStatus: any;
            projectLink: any;
            projectImage: any;
            projectType: any;
            projectMainObjectives: any;
            doctorFullName: any;
            doctorEmail: any;
            doctorPhone: any;
            doctorImage: any;
            doctorBio: any;
            departmentName: any;
            universityName: any;
            teamName: string | null;
            teamCode: string | null;
            teamMembers: any[];
            technologies: any[];
            files: {
                fileId: any;
                fileName: any;
                filePath: any;
            }[];
        };
    }>;
    uploadProjectFileByToken(file: Express.Multer.File, userId: string, description?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            fileId: Types.ObjectId;
            url: string;
        };
    }>;
    private handleFileFieldsUploadAsync;
    deleteProjectFile(fileId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProjectByToken(userId: string, updateData: any, file?: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
    }>;
    private handleProjectImageUploadAsync;
    deleteProjectImageByToken(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getAllCompletedProjects(queryDto: any): Promise<{
        success: boolean;
        stats: {
            totalProjects: number;
            completedProjects?: undefined;
            currentYearProjects?: undefined;
        };
        meta: {
            total: number;
            totalPages?: undefined;
            currentPage?: undefined;
        };
        data: never[];
        message?: undefined;
        timestamp?: undefined;
    } | {
        success: boolean;
        message: string;
        stats: {
            totalProjects: number;
            completedProjects: number;
            currentYearProjects: number;
        };
        meta: {
            totalPages: number;
            currentPage: number;
            total?: undefined;
        };
        data: {
            projectId: any;
            projectTitle: any;
            projectDescription: any;
            projectYear: any;
            projectStatus: any;
            projectLink: any;
            projectImage: any;
            projectType: any;
            projectMainObjectives: any;
            doctorFullName: any;
            doctorEmail: any;
            doctorPhone: any;
            doctorImage: any;
            doctorBio: any;
            departmentName: any;
            universityName: any;
            teamName: any;
            teamCode: any;
            teamMembers: any[];
            technologies: any;
            files: {
                fileId: any;
                fileName: any;
                filePath: any;
            }[];
        }[];
        timestamp: string;
    }>;
    getProjectById(projectId: string): Promise<{
        success: boolean;
        data: {
            projectId: any;
            projectTitle: any;
            projectDescription: any;
            projectYear: any;
            projectStatus: any;
            projectLink: any;
            projectImage: any;
            projectType: any;
            projectMainObjectives: any;
            doctorFullName: any;
            doctorEmail: any;
            doctorPhone: any;
            doctorImage: any;
            doctorBio: any;
            departmentName: any;
            universityName: any;
            teamName: string | null;
            teamCode: string | null;
            teamMembers: any[];
            technologies: any[];
            files: {
                fileId: any;
                fileName: any;
                filePath: any;
            }[];
        };
        timestamp: string;
    }>;
    getProjectsStats(): Promise<{
        totalProjects: number;
        completedProjects: number;
        currentYearProjects: number;
    }>;
    getDoctorDashboardStats(doctorId: string): Promise<{
        success: boolean;
        stats: {
            totalProjects: number;
            pendingActions: number;
            completedProjects: number;
            totalTeams: number;
            featuredProjects: number;
            currentYearProjects: number;
            year: string;
        };
    }>;
    getDoctorProjectsWithStats(doctorId: string, queryDto: any): Promise<{
        success: boolean;
        message: string;
        meta: {
            totalItems: any;
            totalPages: number;
            currentPage: number;
        };
        data: {
            projectId: any;
            projectTitle: any;
            projectDescription: any;
            projectYear: any;
            projectStatus: any;
            projectImage: any;
            projectType: any;
            departmentId: any;
            departmentName: any;
            universityId: any;
            universityName: any;
            technologies: any;
        }[];
    }>;
    getProjectDetailsForDoctor(projectId: string, doctorId: string): Promise<{
        success: boolean;
        data: {
            projectId: any;
            projectTitle: any;
            projectDescription: any;
            projectYear: any;
            projectStatus: any;
            projectLink: any;
            projectImage: any;
            projectType: any;
            projectMainObjectives: any;
            doctorFullName: any;
            doctorEmail: any;
            doctorPhone: any;
            doctorImage: any;
            doctorBio: any;
            departmentId: any;
            departmentName: any;
            universityId: any;
            universityName: any;
            teamName: any;
            teamCode: string | null;
            teamMembers: any[];
            technologies: string[];
            files: {
                fileId: Types.ObjectId;
                fileName: string;
                filePath: string;
            }[];
        }[];
        timestamp: string;
    }>;
}
