"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const team_schema_1 = require("./schemas/team.schema");
const team_member_schema_1 = require("./schemas/team-member.schema");
const user_schema_1 = require("../user/schemas/user.schema");
let TeamsService = class TeamsService {
    teamModel;
    teamMemberModel;
    userModel;
    constructor(teamModel, teamMemberModel, userModel) {
        this.teamModel = teamModel;
        this.teamMemberModel = teamMemberModel;
        this.userModel = userModel;
    }
    async generateUniqueCode() {
        let code = '';
        let exists = true;
        while (exists) {
            code = Math.random().toString(36).substring(2, 10).toUpperCase();
            const existing = await this.teamModel.findOne({ code });
            exists = !!existing;
        }
        return code;
    }
    async createTeam(name, projectId, doctorId, leadId, members) {
        const code = await this.generateUniqueCode();
        const team = await this.teamModel.create({
            name,
            code,
            project_id: projectId,
            doctorId,
            lead_id: leadId,
        });
        const teamMembers = members.map((member) => ({
            team_id: team._id,
            user_id: member.userId,
            role: member.role,
            university_number: member.universityNumber,
            contact_email: member.contactEmail,
        }));
        await this.teamMemberModel.insertMany(teamMembers);
        return team;
    }
    async isUserInAnyTeam(userId) {
        const member = await this.teamMemberModel.findOne({ user_id: userId });
        return !!member;
    }
    async getMyTeamDetails(userId) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const memberRecord = await this.teamMemberModel
            .findOne({ user_id: uid })
            .lean();
        if (!memberRecord) {
            throw new common_1.NotFoundException('أنت لست عضواً في أي فريق حالياً');
        }
        const team = await this.teamModel
            .findById(memberRecord.team_id)
            .populate('doctorId', 'fullName email phoneNumber profileImage bio')
            .lean();
        if (!team) {
            throw new common_1.NotFoundException('لم يتم العثور على بيانات الفريق');
        }
        const allMembers = await this.teamMemberModel
            .find({ team_id: team._id })
            .populate('user_id', 'fullName email phoneNumber profileImage bio')
            .lean();
        const teamMembersFormatted = allMembers.map((m) => ({
            memberId: m.user_id._id,
            memberFullName: m.user_id.fullName,
            memberEmail: m.user_id.email,
            memberBio: m.user_id.bio,
            memberPhone: m.user_id.phoneNumber,
            memberProfileImage: m.user_id.profileImage,
            memberRole: m.role,
            memberIsLeader: team.lead_id.toString() === m.user_id._id.toString(),
        }));
        const doctor = team.doctorId;
        return {
            success: true,
            data: {
                teamId: team._id,
                teamName: team.name,
                teamCode: team.code,
                projectId: team.project_id,
                doctorFullName: doctor?.fullName || null,
                doctorEmail: doctor?.email || null,
                doctorPhone: doctor?.phoneNumber || null,
                doctorImage: doctor?.profileImage || null,
                doctorBio: doctor?.bio || null,
                teamMembers: teamMembersFormatted,
            },
        };
    }
    async getDoctorTeams(doctorId, filters, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const doctorObjectId = new mongoose_2.Types.ObjectId(doctorId);
        const pipeline = [
            { $match: { doctorId: doctorObjectId } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'supervisionrequests',
                    localField: 'project.supervision_request_id',
                    foreignField: '_id',
                    as: 'supRequest',
                },
            },
            { $unwind: { path: '$supRequest', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'supRequest.departmentId',
                    foreignField: '_id',
                    as: 'deptInfo',
                },
            },
            { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'universities',
                    localField: 'deptInfo.universityId',
                    foreignField: '_id',
                    as: 'uniInfo',
                },
            },
            { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },
        ];
        if (filters.projectStatus) {
            pipeline.push({ $match: { 'project.status': filters.projectStatus } });
        }
        if (filters.year) {
            pipeline.push({ $match: { 'project.year': filters.year } });
        }
        if (filters.departmentId) {
            pipeline.push({
                $match: { 'deptInfo._id': new mongoose_2.Types.ObjectId(filters.departmentId) },
            });
        }
        if (filters.universityId) {
            pipeline.push({
                $match: { 'uniInfo._id': new mongoose_2.Types.ObjectId(filters.universityId) },
            });
        }
        const countRes = await this.teamModel.aggregate([
            ...pipeline,
            { $count: 'total' },
        ]);
        const total = countRes[0]?.total || 0;
        pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: Number(limit) }, {
            $project: {
                _id: 1,
                teamName: '$name',
                teamCode: '$code',
                projectStatus: { $ifNull: ['$project.status', 'N/A'] },
                projectYear: { $ifNull: ['$project.year', 'N/A'] },
                universityId: { $ifNull: ['$uniInfo._id', 'N/A'] },
                universityName: { $ifNull: ['$uniInfo.universityName', 'N/A'] },
                departmentId: { $ifNull: ['$deptInfo._id', 'N/A'] },
                departmentName: { $ifNull: ['$deptInfo.departmentName', 'N/A'] },
            },
        });
        const data = await this.teamModel.aggregate(pipeline);
        return {
            success: true,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
            data,
        };
    }
    async getTeamDetails(id) {
        const teamObjectId = new mongoose_2.Types.ObjectId(id);
        const data = await this.teamModel.aggregate([
            { $match: { _id: teamObjectId } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'projectInfo',
                },
            },
            { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'supervisionrequests',
                    localField: 'projectInfo.supervision_request_id',
                    foreignField: '_id',
                    as: 'supRequest',
                },
            },
            { $unwind: { path: '$supRequest', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'supRequest.departmentId',
                    foreignField: '_id',
                    as: 'deptInfo',
                },
            },
            { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'universities',
                    localField: 'deptInfo.universityId',
                    foreignField: '_id',
                    as: 'uniInfo',
                },
            },
            { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: '_id',
                    foreignField: 'team_id',
                    as: 'members',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.user_id',
                    foreignField: '_id',
                    as: 'memberDetails',
                },
            },
            {
                $project: {
                    _id: 1,
                    teamName: '$name',
                    teamCode: '$code',
                    projectTitle: '$projectInfo.title',
                    projectDescription: '$projectInfo.description',
                    projectStatus: '$projectInfo.status',
                    projectYear: '$projectInfo.year',
                    universityId: '$uniInfo._id',
                    universityName: '$uniInfo.universityName',
                    departmentId: '$deptInfo._id',
                    departmentName: '$deptInfo.departmentName',
                    members: {
                        $map: {
                            input: '$members',
                            as: 'member',
                            in: {
                                userId: '$$member.user_id',
                                role: '$$member.role',
                                universityNumber: '$$member.university_number',
                                contactEmail: '$$member.contact_email',
                                fullName: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$memberDetails',
                                                as: 'md',
                                                cond: { $eq: ['$$md._id', '$$member.user_id'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    members: {
                        $map: {
                            input: '$members',
                            as: 'm',
                            in: {
                                userId: '$$m.userId',
                                role: '$$m.role',
                                fullName: '$$m.fullName.fullName',
                                profileImage: '$$m.fullName.profileImage',
                            },
                        },
                    },
                },
            },
        ]);
        if (!data || data.length === 0) {
            throw new common_1.NotFoundException('Team not found');
        }
        return {
            success: true,
            data: data[0],
        };
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(1, (0, mongoose_1.InjectModel)(team_member_schema_1.TeamMember.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TeamsService);
//# sourceMappingURL=teams.service.js.map