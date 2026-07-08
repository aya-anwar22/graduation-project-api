import { Model, Types } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { TeamMember, TeamMemberDocument } from './schemas/team-member.schema';
import { UserDocument } from "../user/schemas/user.schema";
export declare class TeamsService {
    private teamModel;
    private teamMemberModel;
    private userModel;
    constructor(teamModel: Model<TeamDocument>, teamMemberModel: Model<TeamMemberDocument>, userModel: Model<UserDocument>);
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
    getMyTeam(user: any): Promise<{
        success: boolean;
        data: {
            team: {
                _id: any;
                name: any;
                code: any;
            };
            project: any;
            doctor: any;
            leader: any;
            members: {
                _id: any;
                fullName: any;
                email: any;
                phoneNumber: any;
                profileImage: any;
                bio: any;
                role: any;
                roleDescription: any;
                universityNumber: any;
                contactEmail: any;
                university: {
                    _id: any;
                    name: any;
                    location: any;
                } | null;
                department: {
                    _id: any;
                    name: any;
                } | null;
            }[];
        };
    }>;
    isUserInAnyTeam(userId: Types.ObjectId): Promise<boolean>;
    getTeamMembers(teamId: Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, TeamMemberDocument, {}, {}> & TeamMember & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    removeMemberFromTeam(teamId: Types.ObjectId, userId: Types.ObjectId, doctorId: Types.ObjectId): Promise<{
        message: string;
    }>;
    addMemberToTeam(teamId: Types.ObjectId, userId: Types.ObjectId, role: string, doctorId: Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, TeamMemberDocument, {}, {}> & TeamMember & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    private generateUniqueCode;
}
