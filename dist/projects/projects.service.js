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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_schema_1 = require("./schemas/project.schema");
const team_schema_1 = require("../teams/schemas/team.schema");
const team_member_schema_1 = require("../teams/schemas/team-member.schema");
const project_file_schema_1 = require("./schemas/project-file.schema");
const project_technology_schema_1 = require("./schemas/project-technology.schema");
const supervision_request_schema_1 = require("../supervision-requests/schemas/supervision-request.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
let ProjectsService = class ProjectsService {
    projectModel;
    teamModel;
    teamMemberModel;
    projectFileModel;
    projectTechnologyModel;
    supervisionRequestModel;
    userModel;
    cloudinaryService;
    constructor(projectModel, teamModel, teamMemberModel, projectFileModel, projectTechnologyModel, supervisionRequestModel, userModel, cloudinaryService) {
        this.projectModel = projectModel;
        this.teamModel = teamModel;
        this.teamMemberModel = teamMemberModel;
        this.projectFileModel = projectFileModel;
        this.projectTechnologyModel = projectTechnologyModel;
        this.supervisionRequestModel = supervisionRequestModel;
        this.userModel = userModel;
        this.cloudinaryService = cloudinaryService;
    }
    async checkUserProjectAccess(userId, projectId) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const pid = new mongoose_2.Types.ObjectId(projectId);
        const proj = await this.projectModel.findOne({ _id: pid, created_by: uid });
        if (proj)
            return true;
        const team = await this.teamModel.findOne({ project_id: pid });
        if (team) {
            const member = await this.teamMemberModel.findOne({
                team_id: team._id,
                user_id: uid,
            });
            if (member)
                return true;
        }
        return false;
    }
    async updateProjectStatus(projectId, doctorId, updateStatusDto) {
        if (!mongoose_2.Types.ObjectId.isValid(projectId)) {
            throw new common_1.BadRequestException('معرف المشروع غير صالح');
        }
        const project = await this.projectModel.findById(projectId);
        if (!project) {
            throw new common_1.NotFoundException('المشروع غير موجود');
        }
        project.status = updateStatusDto.status;
        await project.save();
        return {
            success: true,
            message: 'تم تحديث حالة المشروع بنجاح',
            data: {
                projectId: project._id,
                status: project.status,
            },
        };
    }
    async getMyProject(studentId) {
        const sid = new mongoose_2.Types.ObjectId(studentId);
        const student = await this.userModel
            .findById(sid)
            .populate('universityId', 'universityName location')
            .lean();
        if (!student)
            throw new common_1.NotFoundException('Student not found');
        const [supReqs, tmember] = await Promise.all([
            this.supervisionRequestModel
                .find({ student_id: sid, status: 'approved' })
                .sort({ createdAt: -1 })
                .populate('doctorId', 'fullName email phoneNumber profileImage bio')
                .populate('departmentId', 'departmentName')
                .lean(),
            this.teamMemberModel
                .findOne({ user_id: sid })
                .populate({
                path: 'team_id',
                select: 'project_id doctorId lead_id name code',
            })
                .lean(),
        ]);
        let supReq = supReqs[0] || null;
        let proj = null;
        if (!supReq && tmember?.team_id) {
            const team = tmember.team_id;
            proj = await this.projectModel.findById(team.project_id).lean();
            if (proj?.supervision_request_id) {
                supReq = await this.supervisionRequestModel
                    .findById(proj.supervision_request_id)
                    .populate('doctorId', 'fullName email phoneNumber profileImage bio')
                    .populate('departmentId', 'departmentName')
                    .lean();
            }
        }
        if (!supReq)
            throw new common_1.NotFoundException('No approved supervision request found.');
        if (!proj) {
            proj = await this.projectModel
                .findOne({ supervision_request_id: supReq._id })
                .lean();
        }
        const doc = supReq.doctorId || {};
        const dept = supReq.departmentId || {};
        const uni = student.universityId || {};
        const [techs, projFiles, team] = await Promise.all([
            proj
                ? this.projectTechnologyModel
                    .find({ project_id: proj._id })
                    .select('tech_name')
                    .lean()
                : [],
            proj ? this.projectFileModel.find({ project_id: proj._id }).lean() : [],
            proj
                ? this.teamModel
                    .findOne({ project_id: proj._id })
                    .populate('lead_id', '_id')
                    .lean()
                : null,
        ]);
        let teamMembersFormatted = [];
        if (team) {
            const members = await this.teamMemberModel
                .find({ team_id: team._id })
                .populate('user_id', 'fullName email phoneNumber profileImage bio')
                .lean();
            teamMembersFormatted = members.map((m) => ({
                memberId: m.user_id._id,
                memberFullName: m.user_id.fullName,
                memberEmail: m.user_id.email,
                memberBio: m.user_id.bio,
                memberPhone: m.user_id.phoneNumber,
                memberProfileImage: m.user_id.profileImage,
                memberRole: m.role,
                memberIsLeader: team.lead_id?._id?.toString() === m.user_id._id.toString(),
            }));
        }
        return {
            success: true,
            message: 'Project details retrieved',
            data: {
                projectId: proj?._id,
                projectTitle: proj?.title || supReq.project_name,
                projectDescription: proj?.description || supReq.project_description,
                projectYear: proj?.year || supReq.year,
                projectStatus: proj?.status || supReq.status,
                projectLink: proj?.projectLink || null,
                projectImage: proj?.projectImage || null,
                projectType: proj?.project_type || supReq.project_type,
                projectMainObjectives: proj?.main_objectives || supReq.main_objectives,
                doctorFullName: doc.fullName,
                doctorEmail: doc.email,
                doctorPhone: doc.phoneNumber,
                doctorImage: doc.profileImage,
                doctorBio: doc.bio,
                departmentName: dept.departmentName,
                universityName: uni.universityName,
                teamName: team?.name || null,
                teamCode: team?.code || null,
                teamMembers: teamMembersFormatted,
                technologies: techs.map((t) => t.tech_name),
                files: projFiles.map((f) => ({
                    fileId: f._id,
                    fileName: f.filename,
                    filePath: f.filepath,
                })),
            },
        };
    }
    async uploadProjectFileByToken(file, userId, description) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('Invalid User ID format');
        }
        const uid = new mongoose_2.Types.ObjectId(userId);
        const teamMember = await this.teamMemberModel
            .findOne({ user_id: uid })
            .lean();
        if (!teamMember) {
            throw new common_1.NotFoundException('عفواً، أنت لست عضواً في أي فريق حالياً');
        }
        const team = await this.teamModel.findById(teamMember.team_id).lean();
        if (!team || (!team.project_id && !team.projectId)) {
            throw new common_1.NotFoundException('لا يمكن رفع ملفات: لم يتم العثور على مشروع مرتبط بفريقك.');
        }
        const projectId = team.project_id || team.projectId;
        try {
            const savedDoc = await this.handleFileFieldsUploadAsync(projectId.toString(), uid.toString(), file, description);
            return {
                success: true,
                message: 'تم رفع وحفظ الملف بنجاح',
                data: {
                    fileId: savedDoc._id,
                    url: savedDoc.filepath,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`فشل الرفع: ${error.message}`);
        }
    }
    async handleFileFieldsUploadAsync(projectId, userId, file, description) {
        try {
            console.log('--- [Step 1] بدأت عملية الرفع للمشروع:', projectId);
            const folder = `project-documents/${projectId}`;
            const uploadedFile = await this.cloudinaryService.uploadFile(file, folder);
            if (!uploadedFile || !uploadedFile.secure_url) {
                throw new Error('Cloudinary response missing secure_url');
            }
            console.log('--- [Step 2] تم الرفع لكلاوديناري. الرابط:', uploadedFile.secure_url);
            const fileData = {
                project_id: new mongoose_2.Types.ObjectId(projectId),
                uploaded_by: new mongoose_2.Types.ObjectId(userId),
                filename: file.originalname,
                filepath: uploadedFile.secure_url,
                file_type: file.mimetype,
                size: file.size,
                cloudinary_id: uploadedFile.public_id,
                description: description || '',
            };
            console.log('--- [Step 3] محاولة الحفظ في المونجو بالبيانات:', fileData);
            const newFile = await this.projectFileModel.create(fileData);
            console.log('--- [Step 4] تم الحفظ بنجاح! ID المستند:', newFile._id);
            return newFile;
        }
        catch (error) {
            console.error('--- [ERROR] فشل في handleFileFieldsUploadAsync:');
            if (error.name === 'ValidationError') {
                console.error('تفاصيل خطأ الـ Schema:', Object.keys(error.errors).map((key) => `${key}: ${error.errors[key].message}`));
            }
            else {
                console.error(error);
            }
            throw error;
        }
    }
    async deleteProjectFile(fileId, userId) {
        const file = await this.projectFileModel.findById(fileId).lean();
        if (!file)
            throw new common_1.NotFoundException('File not found');
        const access = await this.checkUserProjectAccess(userId, file.project_id.toString());
        if (!access)
            throw new common_1.ForbiddenException('No permission to delete files');
        if (file.cloudinary_public_id) {
            await this.cloudinaryService.deleteFile(file.cloudinary_public_id, 'raw');
        }
        await this.projectFileModel.findByIdAndDelete(fileId);
        return { success: true, message: 'File deleted successfully' };
    }
    async updateProjectByToken(userId, updateData, file) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const teamMember = await this.teamMemberModel
            .findOne({ user_id: uid })
            .lean();
        if (!teamMember)
            throw new common_1.NotFoundException('أنت لست عضواً في فريق.');
        const team = await this.teamModel.findById(teamMember.team_id).lean();
        if (!team || !team.project_id)
            throw new common_1.NotFoundException('لا يوجد مشروع مرتبط بهذا الفريق.');
        const pid = team.project_id;
        const updatePayload = {};
        if (updateData.description)
            updatePayload.description = updateData.description;
        if (updateData.project_type)
            updatePayload.project_type = updateData.project_type;
        if (updateData.projectLink)
            updatePayload.projectLink = updateData.projectLink;
        if (updateData.main_objectives)
            updatePayload.main_objectives = updateData.main_objectives;
        await this.projectModel.findByIdAndUpdate(pid, { $set: updatePayload });
        if (updateData.technologies) {
            let techArray = [];
            try {
                if (typeof updateData.technologies === 'string' &&
                    updateData.technologies.startsWith('[')) {
                    techArray = JSON.parse(updateData.technologies);
                }
                else if (Array.isArray(updateData.technologies)) {
                    techArray = updateData.technologies;
                }
                else if (typeof updateData.technologies === 'string') {
                    techArray = updateData.technologies.split(',').map((t) => t.trim());
                }
            }
            catch (e) {
                techArray = [updateData.technologies.toString()];
            }
            techArray = techArray
                .map((t) => t.replace(/[\]"']/g, '').trim())
                .filter((t) => t !== '');
            if (techArray.length > 0) {
                await this.projectTechnologyModel.deleteMany({ project_id: pid });
                const techEntries = techArray.map((tech) => ({
                    project_id: pid,
                    tech_name: tech,
                }));
                await this.projectTechnologyModel.insertMany(techEntries);
            }
        }
        if (file) {
            const currentProject = await this.projectModel
                .findById(pid)
                .select('projectImage')
                .lean();
            this.handleProjectImageUploadAsync(pid.toString(), currentProject?.projectImage, file).catch((error) => console.error('Background Image Upload Error:', error));
        }
        return {
            success: true,
            message: 'تم تحديث بيانات المشروع بنجاح.',
        };
    }
    async handleProjectImageUploadAsync(projectId, oldImageUrl, newImage) {
        try {
            if (oldImageUrl) {
                const publicId = this.cloudinaryService.extractPublicId(oldImageUrl);
                if (publicId)
                    await this.cloudinaryService.deleteImage(publicId);
            }
            const uploadResult = await this.cloudinaryService.uploadImage(newImage, 'projects-images');
            await this.projectModel
                .updateOne({ _id: new mongoose_2.Types.ObjectId(projectId) }, { $set: { projectImage: uploadResult.secure_url } })
                .exec();
        }
        catch (error) {
            console.error(`[Error] Project image background upload failed:`, error);
        }
    }
    async deleteProjectImageByToken(userId) {
        const uid = new mongoose_2.Types.ObjectId(userId);
        const teamMember = await this.teamMemberModel
            .findOne({ user_id: uid })
            .populate({ path: 'team_id', select: 'project_id' })
            .lean();
        const team = teamMember?.team_id;
        if (!team || !team.project_id) {
            throw new common_1.NotFoundException('لم يتم العثور على مشروع لهذا الطالب.');
        }
        const pid = team.project_id;
        const project = await this.projectModel
            .findById(pid)
            .select('projectImage')
            .lean();
        if (!project || !project.projectImage) {
            throw new common_1.BadRequestException('لا توجد صورة لهذا المشروع لحذفها.');
        }
        const publicId = this.cloudinaryService.extractPublicId(project.projectImage);
        if (publicId) {
            try {
                await this.cloudinaryService.deleteImage(publicId);
            }
            catch (error) {
                console.error('Cloudinary Delete Error:', error);
            }
        }
        await this.projectModel.updateOne({ _id: pid }, { $unset: { projectImage: '' } });
        return {
            success: true,
            message: 'تم حذف صورة المشروع بنجاح',
        };
    }
    async getAllCompletedProjects(queryDto) {
        const { page = 1, limit = 10, search, year, status, doctorEmail, projectType, technologies, sortBy = 'createdAt', sortOrder = 'desc', } = queryDto;
        const skip = (page - 1) * limit;
        const currentYear = new Date().getFullYear().toString();
        const [totalCount, completedCount, currentYearCount, uniqueTypes] = await Promise.all([
            this.projectModel.countDocuments({
                status: { $in: ['start', 'completed'] },
            }),
            this.projectModel.countDocuments({ status: 'completed' }),
            this.projectModel.countDocuments({ year: currentYear }),
            this.projectModel.distinct('project_type'),
        ]);
        let doctorIdFilter = null;
        if (doctorEmail) {
            const doctorUser = await this.userModel
                .findOne({ email: doctorEmail, role: 'doctor' })
                .lean();
            if (doctorUser)
                doctorIdFilter = doctorUser._id;
            else
                return {
                    success: true,
                    stats: { totalProjects: totalCount },
                    meta: { total: 0 },
                    data: [],
                };
        }
        const matchConditions = [
            { status: status ? status : { $in: ['completed', 'start'] } },
        ];
        if (doctorIdFilter)
            matchConditions.push({ doctorId: doctorIdFilter });
        if (projectType)
            matchConditions.push({
                $or: [
                    { project_type: projectType },
                    { 'supReq.project_type': projectType },
                ],
            });
        if (year)
            matchConditions.push({ $or: [{ year: year }, { 'supReq.year': year }] });
        if (technologies)
            matchConditions.push({
                'techDocs.tech_name': {
                    $in: technologies.split(',').map((t) => t.trim()),
                },
            });
        if (search) {
            matchConditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { 'supReq.project_name': { $regex: search, $options: 'i' } },
                    { 'memberUsers.fullName': { $regex: search, $options: 'i' } },
                ],
            });
        }
        const pipeline = [
            {
                $lookup: {
                    from: 'supervisionrequests',
                    localField: 'supervision_request_id',
                    foreignField: '_id',
                    as: 'supReq',
                },
            },
            { $unwind: { path: '$supReq', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'projecttechnologies',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'techDocs',
                },
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'teamDoc',
                },
            },
            { $unwind: { path: '$teamDoc', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: 'teamDoc._id',
                    foreignField: 'team_id',
                    as: 'members',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.user_id',
                    foreignField: '_id',
                    as: 'memberUsers',
                },
            },
            { $match: { $and: matchConditions } },
        ];
        const totalResults = await this.projectModel.aggregate([
            ...pipeline,
            { $count: 'count' },
        ]);
        const totalFiltered = totalResults[0]?.count || 0;
        const projects = await this.projectModel.aggregate([
            ...pipeline,
            { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
            { $skip: skip },
            { $limit: Number(limit) },
        ]);
        const finalData = await Promise.all(projects.map(async (proj) => {
            const fullPopulated = await this.projectModel
                .findById(proj._id)
                .populate('doctorId', 'fullName email phoneNumber profileImage bio')
                .populate({
                path: 'supervision_request_id',
                populate: [
                    { path: 'departmentId', select: 'departmentName' },
                    {
                        path: 'student_id',
                        populate: { path: 'universityId', select: 'universityName' },
                    },
                ],
            })
                .lean();
            const supReq = fullPopulated?.supervision_request_id || {};
            const doctor = fullPopulated?.doctorId || supReq.doctorId || {};
            const department = supReq.departmentId || {};
            const university = supReq.student_id?.universityId || {};
            const membersFormatted = await Promise.all((proj.members || []).map(async (m) => {
                const u = (await this.userModel
                    .findById(m.user_id)
                    .select('fullName email phoneNumber profileImage bio')
                    .lean());
                return {
                    memberId: u?._id,
                    memberFullName: u?.fullName,
                    memberEmail: u?.email,
                    memberBio: u?.bio,
                    memberPhone: u?.phoneNumber,
                    memberProfileImage: u?.profileImage,
                    memberRole: m.role,
                    memberIsLeader: proj.teamDoc?.lead_id?.toString() === u?._id?.toString(),
                };
            }));
            const files = await this.projectFileModel
                .find({ project_id: proj._id })
                .lean();
            return {
                projectId: proj._id,
                projectTitle: fullPopulated?.title || supReq.project_name,
                projectDescription: fullPopulated?.description || supReq.project_description,
                projectYear: fullPopulated?.year || supReq.year,
                projectStatus: fullPopulated?.status || supReq.status,
                projectLink: fullPopulated?.projectLink || null,
                projectImage: fullPopulated?.projectImage || null,
                projectType: fullPopulated?.project_type || supReq.project_type,
                projectMainObjectives: fullPopulated?.main_objectives || supReq.main_objectives,
                doctorFullName: doctor.fullName || null,
                doctorEmail: doctor.email || null,
                doctorPhone: doctor.phoneNumber || null,
                doctorImage: doctor.profileImage || null,
                doctorBio: doctor.bio || null,
                departmentName: department.departmentName || null,
                universityName: university.universityName || null,
                teamName: proj.teamDoc?.name || null,
                teamCode: proj.teamDoc?.code || null,
                teamMembers: membersFormatted,
                technologies: (proj.techDocs || []).map((t) => t.tech_name),
                files: files.map((f) => ({
                    fileId: f._id,
                    fileName: f.filename,
                    filePath: f.filepath,
                })),
            };
        }));
        return {
            success: true,
            message: 'Projects retrieved successfully',
            stats: {
                totalProjects: totalCount,
                completedProjects: completedCount,
                currentYearProjects: currentYearCount,
            },
            meta: {
                totalPages: Math.ceil(totalFiltered / limit),
                currentPage: Number(page),
            },
            data: finalData,
            timestamp: new Date().toISOString(),
        };
    }
    async getProjectById(projectId) {
        const pId = new mongoose_2.Types.ObjectId(projectId);
        const fullPopulated = await this.projectModel
            .findById(pId)
            .populate('doctorId', 'fullName email phoneNumber profileImage bio')
            .populate({
            path: 'supervision_request_id',
            populate: [
                { path: 'departmentId', select: 'departmentName' },
                {
                    path: 'student_id',
                    populate: { path: 'universityId', select: 'universityName' },
                },
            ],
        })
            .lean();
        if (!fullPopulated)
            throw new common_1.NotFoundException('المشروع غير موجود');
        const [techDocs, teamDoc, files] = await Promise.all([
            this.projectTechnologyModel.find({ project_id: pId }).lean(),
            this.teamModel.findOne({ project_id: pId }).lean(),
            this.projectFileModel.find({ project_id: pId }).lean(),
        ]);
        let finalTeamDoc = teamDoc;
        if (!finalTeamDoc) {
            finalTeamDoc = await this.teamModel.findOne({ projectId: pId }).lean();
        }
        let membersFormatted = [];
        if (finalTeamDoc && finalTeamDoc._id) {
            const teamObjectId = new mongoose_2.Types.ObjectId(finalTeamDoc._id.toString());
            const members = await this.teamMemberModel
                .find({ team_id: teamObjectId })
                .lean();
            if (members && members.length > 0) {
                membersFormatted = await Promise.all(members.map(async (m) => {
                    const u = (await this.userModel
                        .findById(m.user_id)
                        .select('fullName email phoneNumber profileImage bio')
                        .lean());
                    return {
                        memberId: u?._id,
                        memberFullName: u?.fullName,
                        memberEmail: u?.email,
                        memberBio: u?.bio || 'This user has not added a bio yet',
                        memberPhone: u?.phoneNumber,
                        memberProfileImage: u?.profileImage,
                        memberRole: m.role,
                        memberIsLeader: finalTeamDoc.lead_id?.toString() === u?._id?.toString(),
                    };
                }));
            }
        }
        const supReq = fullPopulated?.supervision_request_id || {};
        const doctor = fullPopulated?.doctorId || {};
        const department = supReq.departmentId || {};
        const university = supReq.student_id?.universityId || {};
        return {
            success: true,
            data: {
                projectId: fullPopulated._id,
                projectTitle: fullPopulated.title || supReq.project_name,
                projectDescription: fullPopulated.description || supReq.project_description,
                projectYear: fullPopulated.year || supReq.year,
                projectStatus: fullPopulated.status,
                projectLink: fullPopulated.projectLink || null,
                projectImage: fullPopulated.projectImage || null,
                projectType: fullPopulated.project_type || supReq.project_type,
                projectMainObjectives: fullPopulated.main_objectives || supReq.main_objectives,
                doctorFullName: doctor.fullName || null,
                doctorEmail: doctor.email || null,
                doctorPhone: doctor.phoneNumber || null,
                doctorImage: doctor.profileImage || null,
                doctorBio: doctor.bio || null,
                departmentName: department.departmentName || null,
                universityName: university.universityName || null,
                teamName: finalTeamDoc?.name || null,
                teamCode: finalTeamDoc?.code || null,
                teamMembers: membersFormatted,
                technologies: techDocs.map((t) => t.tech_name),
                files: files.map((f) => ({
                    fileId: f._id,
                    fileName: f.filename,
                    filePath: f.filepath,
                })),
            },
            timestamp: new Date().toISOString(),
        };
    }
    async getProjectsStats() {
        const currentYear = new Date().getFullYear().toString();
        const [totalCount, completedCount, currentYearCount, uniqueTypes] = await Promise.all([
            this.projectModel.countDocuments({
                status: { $in: ['start', 'completed'] },
            }),
            this.projectModel.countDocuments({ status: 'completed' }),
            this.projectModel.countDocuments({ year: currentYear }),
            this.projectModel.distinct('project_type'),
        ]);
        return {
            totalProjects: totalCount,
            completedProjects: completedCount,
            currentYearProjects: currentYearCount,
        };
    }
    async getDoctorDashboardStats(doctorId) {
        if (!doctorId || !mongoose_2.Types.ObjectId.isValid(doctorId)) {
            throw new common_1.BadRequestException('معرف الدكتور المبعوث غير صالح أو مفقود');
        }
        const dId = new mongoose_2.Types.ObjectId(doctorId);
        const currentYear = new Date().getFullYear().toString();
        const [totalProjects, completedProjects, pendingRequests, totalTeams, featuredProjectsCount, currentYearProjectsCount,] = await Promise.all([
            this.projectModel.countDocuments({
                doctorId: dId,
                status: { $in: ['in_progress', 'completed', 'start'] },
            }),
            this.projectModel.countDocuments({
                doctorId: dId,
                status: 'completed',
            }),
            this.supervisionRequestModel.countDocuments({
                doctorId: dId,
                status: 'pending',
            }),
            this.teamModel.countDocuments({
                doctorId: dId,
            }),
            this.projectModel.countDocuments({
                doctorId: dId,
                status: 'start',
            }),
            this.projectModel.countDocuments({
                doctorId: dId,
                year: currentYear,
            }),
        ]);
        return {
            success: true,
            stats: {
                totalProjects,
                pendingActions: pendingRequests,
                completedProjects,
                totalTeams,
                featuredProjects: featuredProjectsCount,
                currentYearProjects: currentYearProjectsCount,
                year: currentYear,
            },
        };
    }
    async getDoctorProjectsWithStats(doctorId, queryDto) {
        const dId = new mongoose_2.Types.ObjectId(doctorId);
        const { page = 1, limit = 10, search, year, status, projectType, technologies, departmentId, sortBy = 'createdAt', sortOrder = 'desc', } = queryDto;
        const skip = (page - 1) * limit;
        const currentYear = new Date().getFullYear().toString();
        const [totalCount, completedCount, currentYearCount] = await Promise.all([
            this.projectModel.countDocuments({ doctorId: dId }),
            this.projectModel.countDocuments({
                doctorId: dId,
                status: { $in: ['completed', 'start'] },
            }),
            this.projectModel.countDocuments({ doctorId: dId, year: currentYear }),
        ]);
        const matchConditions = [{ doctorId: dId }];
        if (status) {
            matchConditions.push({ status });
        }
        if (projectType) {
            matchConditions.push({
                $or: [
                    { project_type: projectType },
                    { 'supReq.project_type': projectType },
                ],
            });
        }
        if (year) {
            matchConditions.push({ $or: [{ year: year }, { 'supReq.year': year }] });
        }
        if (departmentId) {
            matchConditions.push({
                'supReq.departmentId': new mongoose_2.Types.ObjectId(departmentId),
            });
        }
        if (technologies) {
            const techArray = technologies.split(',').map((t) => t.trim());
            matchConditions.push({ 'techDocs.tech_name': { $in: techArray } });
        }
        if (search) {
            matchConditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { 'supReq.project_name': { $regex: search, $options: 'i' } },
                    { 'memberUsers.fullName': { $regex: search, $options: 'i' } },
                ],
            });
        }
        const pipeline = [
            {
                $lookup: {
                    from: 'supervisionrequests',
                    localField: 'supervision_request_id',
                    foreignField: '_id',
                    as: 'supReq',
                },
            },
            { $unwind: { path: '$supReq', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'projecttechnologies',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'techDocs',
                },
            },
            {
                $lookup: {
                    from: 'teams',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'teamDoc',
                },
            },
            { $unwind: { path: '$teamDoc', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: 'teamDoc._id',
                    foreignField: 'team_id',
                    as: 'members',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'members.user_id',
                    foreignField: '_id',
                    as: 'memberUsers',
                },
            },
            { $match: { $and: matchConditions } },
        ];
        const totalResults = await this.projectModel.aggregate([
            ...pipeline,
            { $count: 'count' },
        ]);
        const totalFiltered = totalResults[0]?.count || 0;
        const projects = await this.projectModel.aggregate([
            ...pipeline,
            { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
            { $skip: skip },
            { $limit: Number(limit) },
        ]);
        const finalData = await Promise.all(projects.map(async (proj) => {
            const fullPopulated = await this.projectModel
                .findById(proj._id)
                .populate('doctorId', 'fullName email phoneNumber profileImage bio')
                .populate({
                path: 'supervision_request_id',
                populate: [
                    { path: 'departmentId', select: 'departmentName' },
                    {
                        path: 'student_id',
                        populate: { path: 'universityId', select: 'universityName' },
                    },
                ],
            })
                .lean();
            const supReq = fullPopulated?.supervision_request_id || {};
            const doctor = fullPopulated?.doctorId || {};
            const department = supReq.departmentId || {};
            const university = supReq.student_id?.universityId || {};
            const membersFormatted = await Promise.all((proj.members || []).map(async (m) => {
                const u = (await this.userModel
                    .findById(m.user_id)
                    .select('fullName email phoneNumber profileImage bio')
                    .lean());
                return {
                    memberId: u?._id,
                    memberFullName: u?.fullName,
                    memberEmail: u?.email,
                    memberBio: u?.bio,
                    memberPhone: u?.phoneNumber,
                    memberProfileImage: u?.profileImage,
                    memberRole: m.role,
                    memberIsLeader: proj.teamDoc?.lead_id?.toString() === u?._id?.toString(),
                };
            }));
            const files = await this.projectFileModel
                .find({ project_id: proj._id })
                .lean();
            return {
                projectId: proj._id,
                projectTitle: fullPopulated?.title || supReq.project_name,
                projectDescription: fullPopulated?.description || supReq.project_description,
                projectYear: fullPopulated?.year || supReq.year,
                projectStatus: fullPopulated?.status,
                projectImage: fullPopulated?.projectImage || null,
                projectType: fullPopulated?.project_type || supReq.project_type,
                departmentId: department._id,
                departmentName: department.departmentName,
                universityId: university._id,
                universityName: university.universityName,
                technologies: (proj.techDocs || []).map((t) => t.tech_name),
            };
        }));
        return {
            success: true,
            message: 'Projects retrieved successfully',
            meta: {
                totalItems: totalFiltered,
                totalPages: Math.ceil(totalFiltered / limit),
                currentPage: Number(page),
            },
            data: finalData,
        };
    }
    async getProjectDetailsForDoctor(projectId, doctorId) {
        if (!mongoose_2.Types.ObjectId.isValid(projectId) ||
            !mongoose_2.Types.ObjectId.isValid(doctorId)) {
            throw new common_1.BadRequestException('معرف المشروع أو الدكتور غير صالح');
        }
        const pId = new mongoose_2.Types.ObjectId(projectId);
        const dId = new mongoose_2.Types.ObjectId(doctorId);
        const project = (await this.projectModel
            .findOne({ _id: pId, doctorId: dId })
            .populate('doctorId', 'fullName email phoneNumber profileImage bio')
            .populate({
            path: 'supervision_request_id',
            populate: [
                { path: 'departmentId', select: 'departmentName' },
                {
                    path: 'student_id',
                    populate: { path: 'universityId', select: 'universityName' },
                },
            ],
        })
            .lean());
        if (!project) {
            throw new common_1.NotFoundException('المشروع غير موجود أو ليس لديك صلاحية للوصول إليه');
        }
        const [team, technologies, files] = await Promise.all([
            this.teamModel.findOne({ project_id: pId }).lean(),
            this.projectTechnologyModel.find({ project_id: pId }).lean(),
            this.projectFileModel.find({ project_id: pId }).lean(),
        ]);
        let teamMembersFormatted = [];
        if (team) {
            const members = await this.teamMemberModel
                .find({ team_id: team._id })
                .populate('user_id', 'fullName email profileImage phoneNumber bio')
                .lean();
            teamMembersFormatted = members.map((m) => ({
                memberId: m.user_id?._id,
                memberFullName: m.user_id?.fullName,
                memberEmail: m.user_id?.email,
                memberBio: m.user_id?.bio || 'This user has not added a bio yet',
                memberPhone: m.user_id?.phoneNumber,
                memberProfileImage: m.user_id?.profileImage,
                memberRole: m.role,
                memberIsLeader: team.lead_id?.toString() === m.user_id?._id?.toString(),
            }));
        }
        const supReq = project.supervision_request_id || {};
        const doctor = project.doctorId || {};
        const department = supReq.departmentId || {};
        const university = supReq.student_id?.universityId || {};
        return {
            success: true,
            data: [
                {
                    projectId: project._id,
                    projectTitle: project.title || supReq.project_name,
                    projectDescription: project.description || supReq.project_description,
                    projectYear: project.year || supReq.year,
                    projectStatus: project.status,
                    projectLink: project.projectLink || null,
                    projectImage: project.projectImage || null,
                    projectType: project.project_type || supReq.project_type,
                    projectMainObjectives: project.main_objectives || supReq.main_objectives || project.title,
                    doctorFullName: doctor.fullName,
                    doctorEmail: doctor.email,
                    doctorPhone: doctor.phoneNumber,
                    doctorImage: doctor.profileImage,
                    doctorBio: doctor.bio,
                    departmentId: department._id,
                    departmentName: department.departmentName,
                    universityId: university._id,
                    universityName: university.universityName,
                    teamName: team?.name || project.title,
                    teamCode: team?.code || null,
                    teamMembers: teamMembersFormatted,
                    technologies: technologies.map((t) => t.tech_name),
                    files: files.map((f) => ({
                        fileId: f._id,
                        fileName: f.filename,
                        filePath: f.filepath,
                    })),
                },
            ],
            timestamp: new Date().toISOString(),
        };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(1, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(2, (0, mongoose_1.InjectModel)(team_member_schema_1.TeamMember.name)),
    __param(3, (0, mongoose_1.InjectModel)(project_file_schema_1.ProjectFile.name)),
    __param(4, (0, mongoose_1.InjectModel)(project_technology_schema_1.ProjectTechnology.name)),
    __param(5, (0, mongoose_1.InjectModel)(supervision_request_schema_1.SupervisionRequest.name)),
    __param(6, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        cloudinary_service_1.CloudinaryService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map