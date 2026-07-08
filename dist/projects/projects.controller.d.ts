import { ProjectsService } from './projects.service';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    uploadFileToMyProject(file: Express.Multer.File, description: string, user: any): Promise<{
        success: boolean;
        message: string;
        data: {
            fileId: import("mongoose").Types.ObjectId;
            url: string;
        };
    }>;
    getDoctorStats(req: any): Promise<{
        message: string;
        data: {
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
        };
    }>;
    updateProjectDetails(file: Express.Multer.File, updateData: {
        description?: string;
        project_type?: string;
        projectLink?: string;
        technologies?: string;
        main_objectives?: string;
    }, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getProjectDetailsByDoctor(projectId: string, req: any): Promise<{
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
                fileId: import("mongoose").Types.ObjectId;
                fileName: string;
                filePath: string;
            }[];
        }[];
        timestamp: string;
    }>;
    getMyProject(user: any, view?: string): Promise<{
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
    getAllProjects(query: any): Promise<{
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
    getProjectDetails(id: string): Promise<{
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
    getStats(): Promise<{
        message: string;
        data: {
            totalProjects: number;
            completedProjects: number;
            currentYearProjects: number;
        };
    }>;
    getDoctorProjects(req: any, queryDto: any): Promise<{
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
    deleteProjectFile(fileId: string, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteProjectImage(user: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateProjectStatus(projectId: string, doctorId: string, updateProjectStatusDto: UpdateProjectStatusDto): Promise<{
        success: boolean;
        message: string;
        data: {
            projectId: import("mongoose").Types.ObjectId;
            status: "in_progress" | "completed" | "start";
        };
    }>;
}
