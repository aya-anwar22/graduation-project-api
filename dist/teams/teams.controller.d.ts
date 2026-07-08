import { TeamsService } from './teams.service';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    getTeamDetails(teamId: string): Promise<{
        success: boolean;
        data: any;
    }>;
    getMyTeam(user: any): Promise<{
        success: boolean;
        data: {
            teamId: import("mongoose").Types.ObjectId;
            teamName: string;
            teamCode: string;
            projectId: import("mongoose").Types.ObjectId;
            doctorFullName: any;
            doctorEmail: any;
            doctorPhone: any;
            doctorImage: any;
            doctorBio: any;
            teamMembers: {
                memberId: any;
                memberFullName: any;
                memberEmail: any;
                memberBio: any;
                memberPhone: any;
                memberProfileImage: any;
                memberRole: any;
                memberIsLeader: boolean;
            }[];
        };
    }>;
    getMyTeams(doctorId: string, year?: string, page?: number, limit?: number, projectStatus?: string, departmentId?: string, universityId?: string): Promise<{
        success: boolean;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
        data: any[];
    }>;
}
