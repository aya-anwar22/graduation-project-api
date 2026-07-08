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
exports.SupervisionRequestsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const supervision_request_schema_1 = require("./schemas/supervision-request.schema");
const supervision_request_member_schema_1 = require("./schemas/supervision-request-member.schema");
const user_schema_1 = require("../user/schemas/user.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
const notifications_service_1 = require("../notifications/notifications.service");
const project_file_schema_1 = require("../projects/schemas/project-file.schema");
const project_technology_schema_1 = require("../projects/schemas/project-technology.schema");
const email_service_1 = require("../common/email/email.service");
const teams_service_1 = require("../teams/teams.service");
const department_doctor_schema_1 = require("../department-doctors/schemas/department-doctor.schema");
const team_schema_1 = require("../teams/schemas/team.schema");
const team_member_schema_1 = require("../teams/schemas/team-member.schema");
let SupervisionRequestsService = class SupervisionRequestsService {
    supervisionRequestModel;
    requestMemberModel;
    userModel;
    projectModel;
    projectFileModel;
    projectTechnologyModel;
    departmentModel;
    teamModel;
    teamMemberModel;
    departmentDoctorModel;
    emailService;
    notificationsService;
    teamsService;
    constructor(supervisionRequestModel, requestMemberModel, userModel, projectModel, projectFileModel, projectTechnologyModel, departmentModel, teamModel, teamMemberModel, departmentDoctorModel, emailService, notificationsService, teamsService) {
        this.supervisionRequestModel = supervisionRequestModel;
        this.requestMemberModel = requestMemberModel;
        this.userModel = userModel;
        this.projectModel = projectModel;
        this.projectFileModel = projectFileModel;
        this.projectTechnologyModel = projectTechnologyModel;
        this.departmentModel = departmentModel;
        this.teamModel = teamModel;
        this.teamMemberModel = teamMemberModel;
        this.departmentDoctorModel = departmentDoctorModel;
        this.emailService = emailService;
        this.notificationsService = notificationsService;
        this.teamsService = teamsService;
    }
    async createSupervisionRequest(userId, createDto) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('معرف المستخدم غير صالح');
        }
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const student = await this.userModel.findById(userObjectId);
        if (!student)
            throw new common_1.NotFoundException('المستخدم غير موجود');
        if (student.role !== user_schema_1.UserRole.STUDENT) {
            throw new common_1.ForbiddenException('فقط الطلاب يمكنهم إنشاء طلبات إشراف');
        }
        if (student.isDeleted)
            throw new common_1.BadRequestException('الحساب محذوف من النظام');
        if (!student.universityId || !student.departmentId) {
            throw new common_1.BadRequestException('يجب إكمال بيانات الجامعة والقسم أولاً');
        }
        const studentUniversityId = student.universityId;
        const studentDepartmentId = student.departmentId;
        const studentDepartment = await this.departmentModel.findById(studentDepartmentId);
        if (!studentDepartment)
            throw new common_1.BadRequestException('القسم الخاص بك غير موجود في النظام');
        if (studentDepartment.is_deleted)
            throw new common_1.BadRequestException('القسم الخاص بك محذوف من النظام');
        if (!mongoose_2.Types.ObjectId.isValid(createDto.doctorId)) {
            throw new common_1.BadRequestException('doctorId غير صالح');
        }
        const doctorObjectId = new mongoose_2.Types.ObjectId(createDto.doctorId);
        const doctor = await this.userModel.findById(doctorObjectId);
        if (!doctor)
            throw new common_1.NotFoundException('الدكتور غير موجود');
        if (doctor.role !== user_schema_1.UserRole.DOCTOR)
            throw new common_1.BadRequestException('المستخدم المحدد ليس دكتورًا');
        if (doctor.isDeleted)
            throw new common_1.BadRequestException('الدكتور محذوف من النظام');
        const doctorDepartments = await this.departmentDoctorModel.find({
            doctorId: doctorObjectId,
        });
        if (!doctorDepartments || doctorDepartments.length === 0) {
            throw new common_1.BadRequestException('الدكتور غير مسجل في أي قسم، يرجى التواصل مع الإدارة');
        }
        let doctorDepartment;
        if (createDto.departmentId) {
            const targetDeptId = new mongoose_2.Types.ObjectId(createDto.departmentId);
            doctorDepartment = doctorDepartments.find((d) => d.departmentId.toString() === targetDeptId.toString());
            if (!doctorDepartment) {
                throw new common_1.BadRequestException('الدكتور المحدد غير موجود في القسم المطلوب');
            }
        }
        else {
            doctorDepartment = doctorDepartments[0];
        }
        const doctorDept = await this.departmentModel.findById(doctorDepartment.departmentId);
        if (!doctorDept)
            throw new common_1.BadRequestException('القسم الخاص بالدكتور غير موجود في النظام');
        if (doctorDept.is_deleted)
            throw new common_1.BadRequestException('القسم الخاص بالدكتور محذوف من النظام');
        if (doctorDept.universityId.toString() !== studentUniversityId.toString()) {
            throw new common_1.BadRequestException('الدكتور يجب أن يكون في نفس الجامعة الخاصة بك');
        }
        if (doctorDepartment.departmentId.toString() !==
            studentDepartmentId.toString()) {
            throw new common_1.BadRequestException('الدكتور يجب أن يكون في نفس القسم الخاص بك');
        }
        if (!createDto.team_members || createDto.team_members.length === 0) {
            throw new common_1.BadRequestException('يجب إضافة أعضاء الفريق');
        }
        const emails = createDto.team_members.map((m) => m.contact_email);
        const uniqueEmails = [...new Set(emails)];
        if (uniqueEmails.length !== emails.length) {
            throw new common_1.BadRequestException('يوجد إيميلات مكررة في قائمة أعضاء الفريق');
        }
        const users = await this.userModel.find({ email: { $in: emails } });
        if (users.length !== emails.length) {
            const foundEmails = users.map((u) => u.email);
            const missingEmails = emails.filter((e) => !foundEmails.includes(e));
            throw new common_1.BadRequestException(`الإيميلات التالية غير موجودة في قاعدة البيانات: ${missingEmails.join(', ')}`);
        }
        for (const u of users) {
            if (u.role !== user_schema_1.UserRole.STUDENT)
                throw new common_1.BadRequestException(`المستخدم ${u.fullName} ليس طالباً`);
            if (u.isDeleted)
                throw new common_1.BadRequestException(`الطالب ${u.fullName} محذوف من النظام`);
            if (u.departmentId?.toString() !== studentDepartmentId.toString() ||
                u.universityId?.toString() !== studentUniversityId.toString()) {
                throw new common_1.BadRequestException(`الطالب ${u.fullName} ليس في نفس الجامعة أو القسم`);
            }
        }
        const leaders = createDto.team_members.filter((m) => m.isLeader);
        if (leaders.length === 0)
            throw new common_1.BadRequestException('يجب تحديد قائد للفريق');
        if (leaders.length > 1)
            throw new common_1.BadRequestException('يجب تحديد قائد واحد فقط للفريق');
        const userIds = users.map((u) => u._id);
        const existingRequests = await this.supervisionRequestModel.find({
            student_id: { $in: userIds },
            status: { $in: ['pending', 'approved'] },
        });
        if (existingRequests.length > 0) {
            throw new common_1.BadRequestException('أحد الطلاب لديه طلب إشراف نشط بالفعل');
        }
        for (const checkUserId of userIds) {
            const isInTeam = await this.teamsService.isUserInAnyTeam(checkUserId);
            if (isInTeam) {
                const user = users.find((u) => u._id.toString() === checkUserId.toString());
                const userName = user ? user.fullName : 'غير معروف';
                throw new common_1.BadRequestException(`الطالب ${userName} موجود في فريق آخر بالفعل`);
            }
        }
        const request = await this.supervisionRequestModel.create({
            student_id: userObjectId,
            doctorId: doctorObjectId,
            departmentId: studentDepartmentId,
            project_name: createDto.project_name,
            project_description: createDto.project_description,
            main_objectives: createDto.main_objectives,
            year: createDto.year,
            project_type: createDto.project_type,
            technologies: createDto.technologies,
            prerequisites: createDto.prerequisites,
            additional_notes: createDto.additional_notes,
            status: 'pending',
        });
        const members = createDto.team_members.map((member) => ({
            request_id: request._id,
            full_name: member.full_name,
            role: member.role,
            university_number: member.university_number,
            contact_email: member.contact_email,
            isLeader: member.isLeader || false,
        }));
        await this.requestMemberModel.insertMany(members);
        return {
            message: 'تم إنشاء طلب الإشراف بنجاح',
            request,
        };
    }
    async getRequestForTeamMember(id, userId) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('معرف الطلب غير صالح');
        }
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('معرف المستخدم غير صالح');
        }
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const request = await this.supervisionRequestModel
            .findById(id)
            .populate('student_id', 'fullName email profileImage universityCode phoneNumber')
            .populate('doctorId', 'fullName email profileImage')
            .populate('departmentId', 'departmentName')
            .lean();
        if (!request) {
            throw new common_1.NotFoundException('الطلب غير موجود');
        }
        if (request.student_id._id.toString() === userId) {
            const members = await this.requestMemberModel
                .find({ request_id: request._id })
                .lean();
            return {
                ...request,
                team_members: members,
            };
        }
        const currentUser = await this.userModel.findById(userObjectId);
        if (!currentUser) {
            throw new common_1.NotFoundException('المستخدم غير موجود');
        }
        const isTeamMember = await this.requestMemberModel.findOne({
            request_id: request._id,
            contact_email: currentUser.email,
        });
        if (!isTeamMember) {
            throw new common_1.ForbiddenException('غير مسموح لك بعرض هذا الطلب');
        }
        const members = await this.requestMemberModel
            .find({ request_id: request._id })
            .lean();
        return {
            ...request,
            team_members: members,
            is_team_leader: isTeamMember.isLeader,
        };
    }
    async updateRequestStatus(requestId, doctorId, status) {
        const request = await this.supervisionRequestModel.findOne({
            _id: requestId,
            doctorId: new mongoose_2.Types.ObjectId(doctorId),
        });
        if (!request)
            throw new common_1.NotFoundException('الطلب غير موجود');
        if (request.status === 'approved' || request.status === 'rejected') {
            throw new common_1.BadRequestException(`هذا الطلب تم ${request.status === 'approved' ? 'قبوله' : 'رفضه'} بالفعل`);
        }
        return await this.supervisionRequestModel.db.transaction(async (session) => {
            if (status === 'rejected') {
                request.status = 'rejected';
                await request.save({ session });
                return { success: true, message: 'تم رفض الطلب بنجاح' };
            }
            const project = await this.projectModel.create([
                {
                    title: request.project_name,
                    description: request.project_description,
                    year: request.year,
                    status: 'start',
                    doctorId: request.doctorId,
                    created_by: request.student_id,
                    supervision_request_id: request._id,
                },
            ], { session });
            const createdProject = project[0];
            if (request.technologies?.length) {
                const techData = request.technologies.map((t) => ({
                    project_id: createdProject._id,
                    tech_name: t,
                }));
                await this.projectTechnologyModel.insertMany(techData, { session });
            }
            const team = await this.teamModel.create([
                {
                    name: `Team ${request.project_name}`,
                    code: `PRJ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
                    project_id: createdProject._id,
                    doctorId: request.doctorId,
                    lead_id: request.student_id,
                },
            ], { session });
            const createdTeam = team[0];
            const leaderUser = await this.userModel
                .findById(request.student_id)
                .session(session);
            await this.teamMemberModel.create([
                {
                    team_id: createdTeam._id,
                    user_id: request.student_id,
                    role: 'Leader',
                    isLeader: true,
                    university_number: leaderUser?.universityCode,
                    contact_email: leaderUser?.email,
                },
            ], { session });
            const reqMembers = await this.requestMemberModel
                .find({ request_id: request._id })
                .session(session);
            if (reqMembers.length) {
                const membersData = await Promise.all(reqMembers.map(async (m) => {
                    const u = await this.userModel
                        .findOne({ email: m.contact_email })
                        .session(session);
                    return {
                        team_id: createdTeam._id,
                        user_id: u?._id || null,
                        role: m.role,
                        university_number: m.university_number,
                        contact_email: m.contact_email,
                        isLeader: false,
                    };
                }));
                await this.teamMemberModel.insertMany(membersData, { session });
            }
            request.status = 'approved';
            await request.save({ session });
            return {
                success: true,
                message: 'تم قبول المشروع بنجاح وإنشاء الفريق',
            };
        });
    }
    async getRequestDetails(id, doctorId) {
        const request = await this.supervisionRequestModel
            .findById(id)
            .populate('student_id', 'fullName email profileImage universityCode phoneNumber bio')
            .populate('doctorId', 'fullName email profileImage')
            .populate('departmentId', 'departmentName');
        if (!request) {
            throw new common_1.NotFoundException('الطلب غير موجود');
        }
        if (request.doctorId._id.toString() !== doctorId.toString()) {
            throw new common_1.ForbiddenException('غير مسموح لك بعرض هذا الطلب');
        }
        const members = await this.requestMemberModel.find({
            request_id: request._id,
        });
        const membersWithDetails = await Promise.all(members.map(async (member) => {
            const user = await this.userModel.findOne({
                email: member.contact_email,
            });
            return {
                ...member.toObject(),
                userDetails: user
                    ? {
                        _id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        profileImage: user.profileImage,
                        phoneNumber: user.phoneNumber,
                        bio: user.bio,
                        universityCode: user.universityCode,
                        isDeleted: user.isDeleted,
                    }
                    : null,
            };
        }));
        return {
            ...request.toObject(),
            team_members: membersWithDetails,
        };
    }
    async getDoctorRequests(doctorId, filters, page = 1, limit = 10) {
        if (!mongoose_2.Types.ObjectId.isValid(doctorId)) {
            throw new common_1.BadRequestException('معرف الدكتور غير صالح');
        }
        const query = {
            doctorId: new mongoose_2.Types.ObjectId(doctorId),
        };
        if (filters.status &&
            ['pending', 'approved', 'rejected'].includes(filters.status)) {
            query.status = filters.status;
        }
        else {
            query.status = 'pending';
        }
        if (filters.year) {
            query.year = filters.year;
        }
        if (filters.universityId && mongoose_2.Types.ObjectId.isValid(filters.universityId)) {
            const departmentsInUniv = await this.departmentModel
                .find({ universityId: new mongoose_2.Types.ObjectId(filters.universityId) })
                .select('_id')
                .lean();
            const deptIds = departmentsInUniv.map((d) => d._id.toString());
            if (filters.departmentId &&
                mongoose_2.Types.ObjectId.isValid(filters.departmentId)) {
                if (!deptIds.includes(filters.departmentId)) {
                    query.departmentId = new mongoose_2.Types.ObjectId();
                }
                else {
                    query.departmentId = new mongoose_2.Types.ObjectId(filters.departmentId);
                }
            }
            else {
                query.departmentId = {
                    $in: deptIds.map((id) => new mongoose_2.Types.ObjectId(id)),
                };
            }
        }
        else if (filters.departmentId &&
            mongoose_2.Types.ObjectId.isValid(filters.departmentId)) {
            query.departmentId = new mongoose_2.Types.ObjectId(filters.departmentId);
        }
        const skip = (page - 1) * limit;
        const totalCount = await this.supervisionRequestModel.countDocuments(query);
        const requests = await this.supervisionRequestModel
            .find(query)
            .populate('student_id', 'fullName profileImage')
            .populate({
            path: 'departmentId',
            select: 'departmentName universityId',
            populate: { path: 'universityId', select: 'name' },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const formattedRequests = requests.map((request) => {
            const student = request.student_id || {};
            const dept = request.departmentId || {};
            const university = dept.universityId || {};
            return {
                studentId: student._id || null,
                studentName: student.fullName || 'غير معروف',
                projectImage: student.profileImage || '',
                requestId: request._id,
                projectName: request.project_name,
                projectDescription: request.project_description,
                mainObjectives: request.main_objectives,
                year: request.year,
                projectType: request.project_type,
                technologies: request.technologies || [],
                prerequisites: request.prerequisites || '',
                additionalNotes: request.additional_notes || '',
                status: request.status,
                departmentId: dept._id || null,
                departmentName: dept.departmentName || 'غير محدد',
                universityId: university._id || null,
                universityName: university.name || 'OBOUR',
            };
        });
        return {
            success: true,
            meta: {
                total: totalCount,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(totalCount / limit),
            },
            data: formattedRequests,
        };
    }
    async getrequestDetails(requestId) {
        if (!mongoose_2.Types.ObjectId.isValid(requestId)) {
            throw new common_1.BadRequestException('معرف الطلب غير صالح');
        }
        const request = await this.supervisionRequestModel
            .findById(requestId)
            .populate('student_id', 'fullName profileImage email universityCode phoneNumber')
            .populate({
            path: 'departmentId',
            select: 'departmentName universityId',
            populate: { path: 'universityId', select: 'name' },
        })
            .lean();
        if (!request) {
            throw new common_1.NotFoundException('الطلب غير موجود');
        }
        const req = request;
        const members = await this.requestMemberModel
            .find({ request_id: req._id })
            .lean();
        const teamWithImages = await Promise.all(members.map(async (m) => {
            const user = await this.userModel
                .findOne({ email: m.contact_email })
                .select('profileImage')
                .lean();
            return {
                fullName: m.full_name,
                role: m.role,
                universityNumber: m.university_number,
                contactEmail: m.contact_email,
                isLeader: m.isLeader,
                profileImage: user?.profileImage || '',
            };
        }));
        const dept = req.departmentId || {};
        const university = dept.universityId || {};
        return {
            success: true,
            data: {
                requestId: req._id,
                projectName: req.project_name,
                projectDescription: req.project_description,
                mainObjectives: req.main_objectives,
                year: req.year,
                projectType: req.project_type,
                technologies: req.technologies || [],
                prerequisites: req.prerequisites || '',
                additionalNotes: req.additional_notes || '',
                status: req.status,
                departmentId: dept._id,
                departmentName: dept.departmentName,
                universityId: university._id,
                universityName: university.name || 'OBOUR',
                team: teamWithImages,
            },
        };
    }
    async getStudentRequests(studentId) {
        const requests = await this.supervisionRequestModel
            .find({ student_id: studentId })
            .populate('doctorId', 'fullName email profileImage')
            .populate('departmentId', 'departmentName')
            .sort({ createdAt: -1 });
        return requests;
    }
    async getDoctorRequestStats(doctorId) {
        if (!doctorId || !mongoose_2.Types.ObjectId.isValid(doctorId)) {
            throw new common_1.BadRequestException('معرف الدكتور غير صالح');
        }
        const dId = new mongoose_2.Types.ObjectId(doctorId);
        const currentYear = new Date().getFullYear().toString();
        const [totalRequests, approvedRequests, pendingRequests, currentYearRequests,] = await Promise.all([
            this.supervisionRequestModel.countDocuments({ doctorId: dId }),
            this.supervisionRequestModel.countDocuments({
                doctorId: dId,
                status: 'approved',
            }),
            this.supervisionRequestModel.countDocuments({
                doctorId: dId,
                status: 'pending',
            }),
            this.supervisionRequestModel.countDocuments({
                doctorId: dId,
                year: currentYear,
            }),
        ]);
        return {
            success: true,
            data: {
                totalRequests,
                approvedRequests,
                pendingRequests,
                currentYearRequests,
                year: currentYear,
            },
        };
    }
};
exports.SupervisionRequestsService = SupervisionRequestsService;
exports.SupervisionRequestsService = SupervisionRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(supervision_request_schema_1.SupervisionRequest.name)),
    __param(1, (0, mongoose_1.InjectModel)(supervision_request_member_schema_1.SupervisionRequestMember.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(4, (0, mongoose_1.InjectModel)(project_file_schema_1.ProjectFile.name)),
    __param(5, (0, mongoose_1.InjectModel)(project_technology_schema_1.ProjectTechnology.name)),
    __param(6, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(7, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(8, (0, mongoose_1.InjectModel)(team_member_schema_1.TeamMember.name)),
    __param(9, (0, mongoose_1.InjectModel)(department_doctor_schema_1.DepartmentDoctor.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService,
        notifications_service_1.NotificationsService,
        teams_service_1.TeamsService])
], SupervisionRequestsService);
//# sourceMappingURL=supervision-requests.service.js.map