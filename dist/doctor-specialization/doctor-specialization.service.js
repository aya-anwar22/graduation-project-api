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
exports.DoctorSpecializationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const doctor_specialization_schema_1 = require("./schema/doctor-specialization.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const file_upload_constants_1 = require("../common/constants/file-upload.constants");
const team_schema_1 = require("../teams/schemas/team.schema");
let DoctorSpecializationService = class DoctorSpecializationService {
    teamModel;
    doctorProfileModel;
    userModel;
    cloudinaryService;
    constructor(teamModel, doctorProfileModel, userModel, cloudinaryService) {
        this.teamModel = teamModel;
        this.doctorProfileModel = doctorProfileModel;
        this.userModel = userModel;
        this.cloudinaryService = cloudinaryService;
    }
    validateObjectId(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('معرف المستخدم غير صالح');
        }
    }
    async getDetailedDoctorStats(doctorId) {
        const doctorObjectId = new mongoose_2.Types.ObjectId(doctorId);
        const studentStats = await this.teamModel.aggregate([
            { $match: { doctorId: doctorObjectId } },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: '_id',
                    foreignField: 'team_id',
                    as: 'members',
                },
            },
            { $unwind: '$members' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.user_id',
                    foreignField: '_id',
                    as: 'studentInfo',
                },
            },
            { $unwind: '$studentInfo' },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    activeStudents: {
                        $sum: { $cond: [{ $eq: ['$studentInfo.isVerified', true] }, 1, 0] },
                    },
                },
            },
        ]);
        const totalTeams = await this.teamModel.countDocuments({
            doctorId: doctorObjectId,
        });
        const activeProjects = await this.teamModel.aggregate([
            { $match: { doctorId: doctorObjectId } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: '$project' },
            { $match: { 'project.status': { $in: ['start', 'in_progress'] } } },
            { $count: 'count' },
        ]);
        return {
            success: true,
            data: {
                totalStudents: studentStats[0]?.totalStudents || 0,
                activeStudents: studentStats[0]?.activeStudents || 0,
                totalTeams: totalTeams,
                activeProjects: activeProjects[0]?.count || 0,
            },
        };
    }
    async getDoctorStats(doctorId) {
        const doctorObjectId = new mongoose_2.Types.ObjectId(doctorId);
        const totalTeams = await this.teamModel.countDocuments({
            doctorId: doctorObjectId,
        });
        const totalMembersArr = await this.teamModel.aggregate([
            { $match: { doctorId: doctorObjectId } },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: '_id',
                    foreignField: 'team_id',
                    as: 'members',
                },
            },
            { $project: { count: { $size: '$members' } } },
            { $group: { _id: null, total: { $sum: '$count' } } },
        ]);
        const totalMembers = totalMembersArr[0]?.total || 0;
        const activeTeams = await this.teamModel.aggregate([
            { $match: { doctorId: doctorObjectId } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: '$project' },
            { $match: { 'project.status': { $in: ['start', 'in_progress'] } } },
            { $count: 'count' },
        ]);
        const activeTeamsCount = activeTeams[0]?.count || 0;
        const completedProjects = await this.teamModel.aggregate([
            { $match: { doctorId: doctorObjectId } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            { $unwind: '$project' },
            { $match: { 'project.status': 'completed' } },
            { $count: 'count' },
        ]);
        const completedProjectsCount = completedProjects[0]?.count || 0;
        return {
            success: true,
            data: {
                totalTeams,
                totalMembers,
                activeTeams: activeTeamsCount,
                completedProjects: completedProjectsCount,
            },
        };
    }
    async getDoctorStudents(doctorId, filters, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const doctorObjectId = new mongoose_2.Types.ObjectId(doctorId);
        const basePipeline = [
            { $match: { doctorId: doctorObjectId } },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: '_id',
                    foreignField: 'team_id',
                    as: 'members',
                },
            },
            { $unwind: '$members' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.user_id',
                    foreignField: '_id',
                    as: 'studentInfo',
                },
            },
            { $unwind: '$studentInfo' },
        ];
        if (filters.departmentId)
            basePipeline.push({
                $match: {
                    'studentInfo.departmentId': new mongoose_2.Types.ObjectId(filters.departmentId),
                },
            });
        if (filters.universityId)
            basePipeline.push({
                $match: {
                    'studentInfo.universityId': new mongoose_2.Types.ObjectId(filters.universityId),
                },
            });
        const countResult = await this.teamModel.aggregate([
            ...basePipeline,
            { $count: 'total' },
        ]);
        const total = countResult[0]?.total || 0;
        const dataPipeline = [
            ...basePipeline,
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
                    from: 'departments',
                    localField: 'studentInfo.departmentId',
                    foreignField: '_id',
                    as: 'dept',
                },
            },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'universities',
                    localField: 'studentInfo.universityId',
                    foreignField: '_id',
                    as: 'uni',
                },
            },
            { $unwind: { path: '$uni', preserveNullAndEmptyArrays: true } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
                $project: {
                    _id: '$studentInfo._id',
                    fullName: '$studentInfo.fullName',
                    email: '$studentInfo.email',
                    universityName: '$uni.universityName',
                    departmentName: '$dept.departmentName',
                    projectId: '$project._id',
                    projectName: '$project.title',
                    isDeleted: '$studentInfo.isDeleted',
                    profileImage: '$studentInfo.profileImage',
                },
            },
        ];
        const data = await this.teamModel.aggregate(dataPipeline);
        return {
            success: true,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            },
            data,
        };
    }
    async getStudentDetailsForDoctor(studentId) {
        const student = await this.userModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(studentId) } },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'teamMembership',
                },
            },
            {
                $unwind: { path: '$teamMembership', preserveNullAndEmptyArrays: true },
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: 'teamMembership.team_id',
                    foreignField: '_id',
                    as: 'teamInfo',
                },
            },
            { $unwind: { path: '$teamInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'teamInfo.project_id',
                    foreignField: '_id',
                    as: 'projectInfo',
                },
            },
            { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'dept',
                },
            },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'universities',
                    localField: 'universityId',
                    foreignField: '_id',
                    as: 'uni',
                },
            },
            { $unwind: { path: '$uni', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    fullName: 1,
                    email: 1,
                    phoneNumber: 1,
                    profileImage: 1,
                    bio: 1,
                    universityName: { $ifNull: ['$uni.universityName', 'N/A'] },
                    departmentName: { $ifNull: ['$dept.departmentName', 'N/A'] },
                    universityCode: 1,
                    role: 1,
                    projectId: { $ifNull: ['$projectInfo._id', 'N/A'] },
                    projectName: { $ifNull: ['$projectInfo.title', 'N/A'] },
                    projectYear: { $ifNull: ['$projectInfo.year', 'N/A'] },
                },
            },
        ]);
        if (!student[0])
            throw new common_1.NotFoundException('Student not found');
        return { success: true, data: student[0] };
    }
    async getDoctorProfile(userId) {
        this.validateObjectId(userId);
        const user = await this.userModel
            .findById(userId)
            .select('fullName email phoneNumber profileImage bio universityCode role isDeleted')
            .populate('departmentId', 'departmentName')
            .populate('universityId', 'name')
            .lean();
        if (!user || user.isDeleted)
            throw new common_1.NotFoundException('الدكتور غير موجود');
        if (user.role !== user_schema_1.UserRole.DOCTOR)
            throw new common_1.ForbiddenException('هذا الحساب ليس دكتور');
        const profile = await this.doctorProfileModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId) })
            .select('-__v -userId -_id')
            .lean();
        return {
            success: true,
            message: 'تم جلب بيانات الدكتور بنجاح',
            data: {
                ...user,
                academicInfo: profile || null,
            },
        };
    }
    async updateDoctorProfile(userId, updateData, profileImage) {
        this.validateObjectId(userId);
        const { fullName, phoneNumber, bio, ...doctorFields } = updateData;
        const processedDoctorFields = { ...doctorFields };
        if (doctorFields.specialization) {
            if (typeof doctorFields.specialization === 'string') {
                try {
                    processedDoctorFields.specialization = JSON.parse(doctorFields.specialization);
                }
                catch {
                    processedDoctorFields.specialization = [
                        doctorFields.specialization,
                    ];
                }
            }
        }
        const userUpdates = {
            ...(fullName && { fullName }),
            ...(phoneNumber && { phoneNumber }),
            ...(bio && { bio }),
        };
        if (Object.keys(userUpdates).length > 0) {
            await this.userModel.findByIdAndUpdate(userId, { $set: userUpdates });
        }
        if (Object.keys(processedDoctorFields).length > 0) {
            await this.doctorProfileModel.findOneAndUpdate({ userId: new mongoose_2.Types.ObjectId(userId) }, { $set: processedDoctorFields }, { upsert: true, new: true });
        }
        if (profileImage) {
            this.handleImageUploadAsync(userId, profileImage).catch((err) => console.error('Background Image Upload Error:', err));
        }
        const updatedProfile = await this.getDoctorProfile(userId);
        return {
            success: true,
            message: 'تم تحديث بيانات الدكتور بنجاح',
            data: updatedProfile.data,
        };
    }
    async handleImageUploadAsync(userId, newImage) {
        try {
            const user = await this.userModel
                .findById(userId)
                .select('profileImage')
                .lean();
            if (user?.profileImage) {
                const publicId = this.cloudinaryService.extractPublicId(user.profileImage);
                this.cloudinaryService
                    .deleteImage(publicId)
                    .catch((err) => console.error('Delete old image failed', err));
            }
            const uploadResult = await this.cloudinaryService.uploadImage(newImage, file_upload_constants_1.FILE_UPLOAD_CONFIG.FOLDERS.USER_PROFILES);
            if (uploadResult?.secure_url) {
                await this.userModel.findByIdAndUpdate(userId, {
                    $set: { profileImage: uploadResult.secure_url },
                });
                console.log(`✅ Image updated successfully in DB: ${uploadResult.secure_url}`);
            }
        }
        catch (error) {
            console.error(` Background upload failed for user ${userId}:`, error);
        }
    }
};
exports.DoctorSpecializationService = DoctorSpecializationService;
exports.DoctorSpecializationService = DoctorSpecializationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(1, (0, mongoose_1.InjectModel)(doctor_specialization_schema_1.DoctorProfile.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        cloudinary_service_1.CloudinaryService])
], DoctorSpecializationService);
//# sourceMappingURL=doctor-specialization.service.js.map