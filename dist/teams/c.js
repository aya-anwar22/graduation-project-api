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
    async getMyTeam(user) {
        console.log('🔹 User object received:', JSON.stringify(user, null, 2));
        const userId = user?.userId || user?.sub || user?.id || user?._id;
        if (!userId) {
            console.error('❌ User object structure:', user);
            throw new common_1.BadRequestException('Invalid token: userId missing. Please login again.');
        }
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        console.log('🔹 Looking for userId:', userId);
        console.log('🔹 Converted ObjectId:', userObjectId.toString());
        const userInDb = await this.userModel.findById(userObjectId).lean();
        if (!userInDb) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found in database`);
        }
        console.log('✅ User found in DB:', {
            id: userInDb._id,
            name: userInDb.fullName,
            email: userInDb.email,
        });
        let team = null;
        console.log('🔍 Searching in teamMemberModel with user_id:', userObjectId.toString());
        const member = await this.teamMemberModel
            .findOne({ user_id: userObjectId })
            .lean()
            .exec();
        console.log('✅ Found member:', member ? JSON.stringify(member, null, 2) : 'NULL');
        if (member) {
            team = await this.teamModel
                .findById(member.team_id)
                .populate('project_id', 'title description year status')
                .populate('doctorId', 'fullName email phoneNumber profileImage bio')
                .populate('lead_id', 'fullName email phoneNumber profileImage bio')
                .lean()
                .exec();
            console.log('✅ Team from member:', team);
        }
        if (!team) {
            console.log('🔍 Searching in teamModel as leader with lead_id:', userObjectId.toString());
            team = await this.teamModel
                .findOne({ lead_id: userObjectId })
                .populate('project_id', 'title description year status')
                .populate('doctorId', 'fullName email phoneNumber profileImage bio')
                .populate('lead_id', 'fullName email phoneNumber profileImage bio')
                .lean()
                .exec();
            console.log('✅ Team from leader:', team ? 'FOUND' : 'NULL');
        }
        if (!team && user.role === 'doctor') {
            console.log('🔍 Searching in teamModel as doctor with doctorId:', userObjectId.toString());
            team = await this.teamModel
                .findOne({ doctorId: userObjectId })
                .populate('project_id', 'title description year status')
                .populate('doctorId', 'fullName email phoneNumber profileImage bio')
                .populate('lead_id', 'fullName email phoneNumber profileImage bio')
                .lean()
                .exec();
            console.log('✅ Team from doctor:', team ? 'FOUND' : 'NULL');
        }
        if (!team) {
            console.error('❌ No team found for user:', userObjectId.toString());
            console.error('❌ Tried searching as: member, leader, doctor');
            const allTeamsWithMembers = await this.teamModel.find().lean().limit(3);
            for (const t of allTeamsWithMembers) {
                const teamMembers = await this.teamMemberModel
                    .find({ team_id: t._id })
                    .populate('user_id', 'fullName email')
                    .lean();
                console.log(`📊 Team ${t.name} members:`, teamMembers.map((m) => ({
                    userId: m.user_id._id.toString(),
                    name: m.user_id.fullName,
                    email: m.user_id.email,
                })));
            }
            throw new common_1.NotFoundException(`You are not assigned to any team. Your user ID is: ${userId}. ` +
                `Please contact your supervisor to add you to a team.`);
        }
        const members = await this.teamMemberModel
            .find({ team_id: team._id })
            .populate({
            path: 'user_id',
            select: 'fullName email phoneNumber profileImage bio universityId departmentId',
            populate: [
                {
                    path: 'universityId',
                    select: 'universityName location',
                },
                {
                    path: 'departmentId',
                    select: 'departmentName',
                },
            ],
        })
            .lean()
            .exec();
        console.log('✅ All team members:', members);
        return {
            success: true,
            data: {
                team: {
                    _id: team._id,
                    name: team.name,
                    code: team.code,
                },
                project: team.project_id,
                doctor: team.doctorId,
                leader: team.lead_id,
                members: members.map((member) => ({
                    _id: member.user_id._id,
                    fullName: member.user_id.fullName,
                    email: member.user_id.email,
                    phoneNumber: member.user_id.phoneNumber,
                    profileImage: member.user_id.profileImage,
                    bio: member.user_id.bio,
                    role: member.role,
                    roleDescription: member.role_description,
                    universityNumber: member.university_number,
                    contactEmail: member.contact_email,
                    university: member.user_id.universityId
                        ? {
                            _id: member.user_id.universityId._id,
                            name: member.user_id.universityId.universityName,
                            location: member.user_id.universityId.location,
                        }
                        : null,
                    department: member.user_id.departmentId
                        ? {
                            _id: member.user_id.departmentId._id,
                            name: member.user_id.departmentId.departmentName,
                        }
                        : null,
                })),
            },
        };
    }
    async isUserInAnyTeam(userId) {
        const member = await this.teamMemberModel.findOne({ user_id: userId });
        return !!member;
    }
    async getTeamMembers(teamId) {
        return this.teamMemberModel
            .find({ team_id: teamId })
            .populate('user_id', 'fullName email profileImage bio');
    }
    async removeMemberFromTeam(teamId, userId, doctorId) {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new common_1.NotFoundException('الفريق غير موجود');
        }
        if (team.doctorId.toString() !== doctorId.toString()) {
            throw new common_1.BadRequestException('غير مسموح لك بحذف أعضاء من هذا الفريق');
        }
        if (team.lead_id.toString() === userId.toString()) {
            throw new common_1.BadRequestException('لا يمكن حذف قائد الفريق');
        }
        const result = await this.teamMemberModel.deleteOne({
            team_id: teamId,
            user_id: userId,
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('العضو غير موجود في الفريق');
        }
        return { message: 'تم حذف العضو بنجاح' };
    }
    async addMemberToTeam(teamId, userId, role, doctorId) {
        const team = await this.teamModel.findById(teamId);
        if (!team) {
            throw new common_1.NotFoundException('الفريق غير موجود');
        }
        if (team.doctorId.toString() !== doctorId.toString()) {
            throw new common_1.BadRequestException('غير مسموح لك بإضافة أعضاء لهذا الفريق');
        }
        const isInTeam = await this.isUserInAnyTeam(userId);
        if (isInTeam) {
            throw new common_1.BadRequestException('هذا الطالب موجود في فريق آخر بالفعل');
        }
        const user = await this.userModel.findById(userId);
        if (!user || user.isDeleted) {
            throw new common_1.BadRequestException('الطالب غير موجود أو محذوف');
        }
        const member = await this.teamMemberModel.create({
            team_id: teamId,
            user_id: userId,
            role,
            university_number: user.universityCode,
            contact_email: user.email,
        });
        return member;
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
//# sourceMappingURL=c.js.map