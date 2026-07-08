import { Model, Types } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { TeamMemberDocument } from './schemas/team-member.schema';
import { UserDocument } from 'src/user/schemas/user.schema';
export declare class TeamsService {
    private teamModel;
    private teamMemberModel;
    private userModel;
    constructor(teamModel: Model<TeamDocument>, teamMemberModel: Model<TeamMemberDocument>, userModel: Model<UserDocument>);
    private generateUniqueCode;
    createTeam(name: string, projectId: Types.ObjectId, doctorId: Types.ObjectId, leadId: Types.ObjectId, members: Array<{
        userId: Types.ObjectId;
        role: string;
        universityNumber: string;
        contactEmail: string;
    }>): Promise<import("mongoose").Document<unknown, {}, TeamDocument, {}, {}> & Team & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    isUserInAnyTeam(userId: Types.ObjectId): Promise<boolean>;
    getMyTeamDetails(userId: string): Promise<{
        success: boolean;
        data: {
            teamId: Types.ObjectId;
            teamName: string;
            teamCode: string;
            projectId: Types.ObjectId;
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
    getDoctorTeams(doctorId: string, filters: {
        departmentId?: string;
        universityId?: string;
        projectStatus?: string;
        year?: string;
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
    getTeamDetails(id: string): Promise<{
        success: boolean;
        data: any;
    }>;
}
