import { SupervisionRequestsService } from './supervision-requests.service';
import { CreateSupervisionRequestDto } from './dto/create-supervision-request.dto';
export declare class SupervisionRequestsController {
    private readonly supervisionRequestsService;
    constructor(supervisionRequestsService: SupervisionRequestsService);
    createRequest(userId: string, createDto: CreateSupervisionRequestDto): Promise<{
        message: string;
        request: import("mongoose").Document<unknown, {}, import("./schemas/supervision-request.schema").SupervisionRequestDocument, {}, {}> & import("./schemas/supervision-request.schema").SupervisionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    updateStatus(requestId: string, status: 'approved' | 'rejected', req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getSingleRequestDetails(id: string): Promise<{
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
    getRequestStats(user: any): Promise<{
        success: boolean;
        data: {
            totalRequests: number;
            approvedRequests: number;
            pendingRequests: number;
            currentYearRequests: number;
            year: string;
        };
    }>;
    getById(requestId: string, req: any): Promise<any>;
    getRequestDetails(req: any, id: string): Promise<{
        team_members: {
            userDetails: {
                _id: import("mongoose").Types.ObjectId;
                fullName: string;
                email: string;
                profileImage: string;
                phoneNumber: string;
                bio: string | undefined;
                universityCode: string | undefined;
                isDeleted: boolean;
            } | null;
            request_id: import("mongoose").Types.ObjectId;
            full_name: string;
            role: string;
            university_number: string;
            contact_email: string;
            isLeader: boolean;
            _id: import("mongoose").Types.ObjectId;
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
        student_id: import("mongoose").Types.ObjectId;
        doctorId: import("mongoose").Types.ObjectId;
        departmentId: import("mongoose").Types.ObjectId;
        project_name: string;
        project_description: string;
        main_objectives: string;
        year: string;
        project_type: string;
        technologies: string[];
        prerequisites?: string;
        additional_notes?: string;
        status: "pending" | "approved" | "rejected";
        project_id?: import("mongoose").Types.ObjectId;
        _id: import("mongoose").Types.ObjectId;
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
    getRequests(req: any, status?: string, departmentId?: string, year?: string, universityId?: string, page?: number, limit?: number): Promise<{
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
    getStudentRequests(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/supervision-request.schema").SupervisionRequestDocument, {}, {}> & import("./schemas/supervision-request.schema").SupervisionRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
