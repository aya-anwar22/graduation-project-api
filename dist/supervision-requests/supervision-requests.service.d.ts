import { Model, Types } from 'mongoose';
import { SupervisionRequest, SupervisionRequestDocument } from './schemas/supervision-request.schema';
import { SupervisionRequestMemberDocument } from './schemas/supervision-request-member.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { ProjectDocument } from '../projects/schemas/project.schema';
import { DepartmentDocument } from '../departments/schemas/department.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { ProjectFileDocument } from "../projects/schemas/project-file.schema";
import { ProjectTechnologyDocument } from "../projects/schemas/project-technology.schema";
import { EmailService } from "../common/email/email.service";
import { TeamsService } from "../teams/teams.service";
import { DepartmentDoctorDocument } from "../department-doctors/schemas/department-doctor.schema";
import { CreateSupervisionRequestDto } from './dto/create-supervision-request.dto';
import { TeamDocument } from "../teams/schemas/team.schema";
import { TeamMemberDocument } from "../teams/schemas/team-member.schema";
export declare class SupervisionRequestsService {
    private supervisionRequestModel;
    private requestMemberModel;
    private userModel;
    private projectModel;
    private projectFileModel;
    private projectTechnologyModel;
    private departmentModel;
    private teamModel;
    private teamMemberModel;
    private departmentDoctorModel;
    private emailService;
    private notificationsService;
    private teamsService;
    constructor(supervisionRequestModel: Model<SupervisionRequestDocument>, requestMemberModel: Model<SupervisionRequestMemberDocument>, userModel: Model<UserDocument>, projectModel: Model<ProjectDocument>, projectFileModel: Model<ProjectFileDocument>, projectTechnologyModel: Model<ProjectTechnologyDocument>, departmentModel: Model<DepartmentDocument>, teamModel: Model<TeamDocument>, teamMemberModel: Model<TeamMemberDocument>, departmentDoctorModel: Model<DepartmentDoctorDocument>, emailService: EmailService, notificationsService: NotificationsService, teamsService: TeamsService);
    createSupervisionRequest(userId: string, createDto: CreateSupervisionRequestDto): Promise<{
        message: string;
        request: import("mongoose").Document<unknown, {}, SupervisionRequestDocument, {}, {}> & SupervisionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getRequestForTeamMember(id: string, userId: string): Promise<any>;
    updateRequestStatus(requestId: string, doctorId: string, status: 'approved' | 'rejected'): Promise<{
        success: boolean;
        message: string;
    }>;
    getRequestDetails(id: string, doctorId: Types.ObjectId): Promise<{
        team_members: {
            userDetails: {
                _id: Types.ObjectId;
                fullName: string;
                email: string;
                profileImage: string;
                phoneNumber: string;
                bio: string | undefined;
                universityCode: string | undefined;
                isDeleted: boolean;
            } | null;
            request_id: Types.ObjectId;
            full_name: string;
            role: string;
            university_number: string;
            contact_email: string;
            isLeader: boolean;
            _id: Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            id?: any;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        student_id: Types.ObjectId;
        doctorId: Types.ObjectId;
        departmentId: Types.ObjectId;
        project_name: string;
        project_description: string;
        main_objectives: string;
        year: string;
        project_type: string;
        technologies: string[];
        prerequisites?: string;
        additional_notes?: string;
        status: "pending" | "approved" | "rejected";
        project_id?: Types.ObjectId;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    getDoctorRequests(doctorId: string, filters: {
        departmentId?: string;
        year?: string;
        universityId?: string;
        status?: string;
    }, page?: number, limit?: number): Promise<{
        success: boolean;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        data: {
            studentId: any;
            studentName: any;
            projectImage: any;
            requestId: any;
            projectName: any;
            projectDescription: any;
            mainObjectives: any;
            year: any;
            projectType: any;
            technologies: any;
            prerequisites: any;
            additionalNotes: any;
            status: any;
            departmentId: any;
            departmentName: any;
            universityId: any;
            universityName: any;
        }[];
    }>;
    getrequestDetails(requestId: string): Promise<{
        success: boolean;
        data: {
            requestId: any;
            projectName: any;
            projectDescription: any;
            mainObjectives: any;
            year: any;
            projectType: any;
            technologies: any;
            prerequisites: any;
            additionalNotes: any;
            status: any;
            departmentId: any;
            departmentName: any;
            universityId: any;
            universityName: any;
            team: {
                fullName: any;
                role: any;
                universityNumber: any;
                contactEmail: any;
                isLeader: any;
                profileImage: string;
            }[];
        };
    }>;
    getStudentRequests(studentId: Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, SupervisionRequestDocument, {}, {}> & SupervisionRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDoctorRequestStats(doctorId: string): Promise<{
        success: boolean;
        data: {
            totalRequests: number;
            approvedRequests: number;
            pendingRequests: number;
            currentYearRequests: number;
            year: string;
        };
    }>;
}
