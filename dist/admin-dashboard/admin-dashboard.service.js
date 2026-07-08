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
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../user/schemas/user.schema");
const university_schema_1 = require("../universities/schemas/university.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
const supervision_request_schema_1 = require("../supervision-requests/schemas/supervision-request.schema");
const department_doctor_schema_1 = require("../department-doctors/schemas/department-doctor.schema");
const team_schema_1 = require("../teams/schemas/team.schema");
const team_member_schema_1 = require("../teams/schemas/team-member.schema");
const doctor_specialization_schema_1 = require("../doctor-specialization/schema/doctor-specialization.schema");
const user_auth_schema_1 = require("../auth/schemas/user-auth.schema");
let AdminDashboardService = class AdminDashboardService {
    userModel;
    universityModel;
    departmentModel;
    projectModel;
    supervisionRequestModel;
    departmentDoctorModel;
    teamModel;
    teamMemberModel;
    doctorProfileModel;
    UserAuthModel;
    constructor(userModel, universityModel, departmentModel, projectModel, supervisionRequestModel, departmentDoctorModel, teamModel, teamMemberModel, doctorProfileModel, UserAuthModel) {
        this.userModel = userModel;
        this.universityModel = universityModel;
        this.departmentModel = departmentModel;
        this.projectModel = projectModel;
        this.supervisionRequestModel = supervisionRequestModel;
        this.departmentDoctorModel = departmentDoctorModel;
        this.teamModel = teamModel;
        this.teamMemberModel = teamMemberModel;
        this.doctorProfileModel = doctorProfileModel;
        this.UserAuthModel = UserAuthModel;
    }
    async getAdminStats() {
        const totalUniversities = await this.universityModel.countDocuments({
            is_deleted: false,
        });
        const totalDepartments = await this.departmentModel.countDocuments({
            is_deleted: false,
        });
        const totalDoctors = await this.userModel.countDocuments({
            role: user_schema_1.UserRole.DOCTOR,
            isDeleted: false,
        });
        const totalStudents = await this.userModel.countDocuments({
            role: user_schema_1.UserRole.STUDENT,
            isDeleted: false,
        });
        const totalProjects = await this.projectModel.countDocuments({});
        const activeProjects = await this.projectModel.countDocuments({
            status: 'in_progress',
        });
        const completedProjects = await this.projectModel.countDocuments({
            status: 'completed',
        });
        const starredProjects = await this.projectModel.countDocuments({
            status: 'start',
        });
        const pendingRequests = await this.supervisionRequestModel.countDocuments({
            status: 'pending',
        });
        return {
            success: true,
            data: {
                universities: totalUniversities,
                departments: totalDepartments,
                doctors: totalDoctors,
                students: totalStudents,
                totalProjects: totalProjects,
                activeProjects: activeProjects,
                completedProjects: completedProjects + starredProjects,
                pendingRequests: pendingRequests,
            },
        };
    }
    async createUser(dto) {
        const universityId = dto.universityId
            ? new mongoose_2.Types.ObjectId(dto.universityId)
            : null;
        const departmentId = dto.departmentId
            ? new mongoose_2.Types.ObjectId(dto.departmentId)
            : null;
        const newUser = await this.userModel.create({
            fullName: dto.fullName,
            email: dto.email,
            password: dto.password,
            role: dto.role,
            universityId: universityId,
            isVerified: true,
            departmentId: departmentId,
            phoneNumber: dto.phoneNumber,
        });
        if (dto.role === 'doctor') {
            await this.departmentDoctorModel.create({
                departmentId: departmentId,
                doctorId: newUser._id,
                isHead: false,
            });
            await this.doctorProfileModel.create({
                userId: newUser._id,
                academicTitle: dto.academicTitle || 'Doctor',
                specialization: dto.specialization || [],
                academicDegree: dto.academicDegree || 'PhD',
                yearsOfExperience: dto.yearsOfExperience || 0,
            });
        }
        await this.UserAuthModel.create({
            userId: newUser._id,
        });
        return {
            success: true,
            message: dto.role === 'doctor'
                ? 'تم إنشاء حساب الدكتور وملفه المهني وربطه بالقسم بنجاح'
                : 'تم إنشاء حساب المستخدم بنجاح',
            data: {
                userId: newUser._id,
                role: newUser.role,
            },
        };
    }
    async findAllUniversities() {
        return await this.universityModel
            .find({ is_deleted: false })
            .select('universityName _id');
    }
    async findDepartmentsByUniversity(universityId) {
        return await this.departmentModel
            .find({
            universityId: universityId,
            is_deleted: false,
        })
            .select('departmentName _id');
    }
    async getProjectsDistributionByUniversity() {
        const distribution = await this.universityModel.aggregate([
            { $match: { is_deleted: false } },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: 'universityId',
                    as: 'departments',
                },
            },
            {
                $lookup: {
                    from: 'supervisionrequests',
                    localField: 'departments._id',
                    foreignField: 'departmentId',
                    as: 'requests',
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'requests._id',
                    foreignField: 'supervision_request_id',
                    as: 'projects',
                },
            },
            {
                $project: {
                    _id: 0,
                    universityName: '$universityName',
                    projectCount: { $size: '$projects' },
                },
            },
            { $sort: { projectCount: -1 } },
        ]);
        return {
            success: true,
            data: distribution,
        };
    }
    async createUniversity(dto) {
        const existingUni = await this.universityModel.findOne({
            universityName: dto.universityName,
            is_deleted: false,
        });
        if (existingUni) {
            throw new common_1.BadRequestException('هذه الجامعة مسجلة بالفعل');
        }
        const newUniversity = new this.universityModel({
            universityName: dto.universityName,
            location: dto.location,
            contactEmail: dto.contactEmail,
        });
        const savedUni = await newUniversity.save();
        return { success: true, message: 'تم إضافة الجامعة بنجاح', data: savedUni };
    }
    async getAllUniversitiesWithDetails(query) {
        const { searchTerm = '', isDeletedFilter = null, page = 1, limit = 10, } = query;
        const skip = (page - 1) * limit;
        const matchQuery = {};
        if (searchTerm) {
            matchQuery.universityName = { $regex: searchTerm, $options: 'i' };
        }
        if (isDeletedFilter !== null) {
            matchQuery.is_deleted = isDeletedFilter;
        }
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: 'universityId',
                    as: 'departments',
                },
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                universityName: 1,
                                location: 1,
                                contactEmail: 1,
                                is_deleted: 1,
                                departmentsCount: { $size: '$departments' },
                                createdAt: 1,
                            },
                        },
                    ],
                },
            },
        ];
        const result = await this.universityModel.aggregate(pipeline);
        const totalItems = result[0].metadata[0]?.total || 0;
        const universities = result[0].data;
        return {
            success: true,
            data: universities,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
            },
        };
    }
    async getUniversityDetails(universityId) {
        const uniObjectId = new mongoose_2.Types.ObjectId(universityId);
        const universityDetails = await this.universityModel.aggregate([
            { $match: { _id: uniObjectId } },
            {
                $lookup: {
                    from: 'departments',
                    localField: '_id',
                    foreignField: 'universityId',
                    as: 'departments',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { deptIds: '$departments._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $in: ['$departmentId', '$$deptIds'] },
                                        { $eq: ['$role', 'doctor'] },
                                        { $eq: ['$isDeleted', false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'doctors',
                },
            },
            {
                $lookup: {
                    from: 'supervisionrequests',
                    localField: 'departments._id',
                    foreignField: 'departmentId',
                    as: 'requests',
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'requests._id',
                    foreignField: 'supervision_request_id',
                    as: 'projects',
                },
            },
            {
                $project: {
                    _id: 1,
                    universityName: 1,
                    location: { $ifNull: ['$location', 'غير محدد'] },
                    contactEmail: { $ifNull: ['$contactEmail', 'لا يوجد بريد'] },
                    status: {
                        $cond: {
                            if: { $eq: ['$is_deleted', false] },
                            then: 'نشط',
                            else: 'غير نشط',
                        },
                    },
                    stats: {
                        departmentsCount: { $size: '$departments' },
                        doctorsCount: { $size: '$doctors' },
                        projectsCount: { $size: '$projects' },
                    },
                },
            },
        ]);
        if (!universityDetails[0]) {
            throw new common_1.NotFoundException('الجامعة غير موجودة');
        }
        return {
            success: true,
            data: universityDetails[0],
        };
    }
    async updateUniversity(id, dto) {
        const updatedUni = await this.universityModel.findByIdAndUpdate(id, { $set: dto }, { new: true });
        if (!updatedUni)
            throw new common_1.NotFoundException('الجامعة غير موجودة');
        return {
            success: true,
            message: 'تم تحديث بيانات الجامعة بنجاح',
            data: updatedUni,
        };
    }
    async toggleUniversityStatus(id) {
        const university = await this.universityModel.findById(id);
        if (!university)
            throw new common_1.NotFoundException('الجامعة غير موجودة');
        const newStatus = !university.is_deleted;
        await this.universityModel.findByIdAndUpdate(id, { $set: { is_deleted: newStatus } }, { new: true });
        return {
            success: true,
            message: newStatus
                ? 'تم نقل الجامعة إلى سلة المحذوفات بنجاح'
                : 'تم استعادة الجامعة بنجاح',
            currentStatus: newStatus ? 'Deleted' : 'Active',
        };
    }
    async getDepartmentStats() {
        const deptStats = await this.departmentModel.aggregate([
            {
                $facet: {
                    totalDepartments: [{ $count: 'count' }],
                    activeDepartments: [
                        { $match: { is_deleted: false } },
                        { $count: 'count' },
                    ],
                },
            },
        ]);
        const doctorStats = await this.departmentDoctorModel.aggregate([
            {
                $facet: {
                    totalDoctors: [{ $count: 'count' }],
                    departmentHeads: [{ $match: { isHead: true } }, { $count: 'count' }],
                },
            },
        ]);
        return {
            success: true,
            data: {
                totalDepartments: deptStats[0].totalDepartments[0]?.count || 0,
                activeDepartments: deptStats[0].activeDepartments[0]?.count || 0,
                totalDoctors: doctorStats[0].totalDoctors[0]?.count || 0,
                departmentHeads: doctorStats[0].departmentHeads[0]?.count || 0,
            },
        };
    }
    async createDepartment(data) {
        const newDepartment = await this.departmentModel.create({
            departmentName: data.departmentName,
            universityId: data.universityId,
            is_deleted: false,
        });
        if (data.headDoctorId) {
            await this.departmentDoctorModel.create({
                departmentId: newDepartment._id,
                doctorId: data.headDoctorId,
                isHead: true,
            });
        }
        return {
            success: true,
            message: data.headDoctorId
                ? 'تم إضافة القسم وتعيين رئيس القسم بنجاح'
                : 'تم إضافة القسم بدون تعيين رئيس قسم',
            data: newDepartment,
        };
    }
    async getDoctorsByUniversity(universityId) {
        const uniObjectId = new mongoose_2.Types.ObjectId(universityId);
        const doctors = await this.userModel
            .find({
            universityId: uniObjectId,
            role: 'doctor',
            isDeleted: false,
        })
            .select('-password')
            .populate('departmentId', 'departmentName');
        return {
            success: true,
            count: doctors.length,
            data: doctors,
        };
    }
    async getAllDepartments(query) {
        const { searchTerm = '', isDeletedFilter = null, universityId = '', page = 1, limit = 10, } = query;
        const skip = (page - 1) * limit;
        const matchQuery = {};
        if (searchTerm) {
            matchQuery.departmentName = { $regex: searchTerm, $options: 'i' };
        }
        if (isDeletedFilter !== null) {
            matchQuery.is_deleted = isDeletedFilter;
        }
        if (universityId && mongoose_2.Types.ObjectId.isValid(universityId)) {
            matchQuery.universityId = new mongoose_2.Types.ObjectId(universityId);
        }
        const pipeline = [
            { $match: matchQuery },
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
                $lookup: {
                    from: 'departmentdoctors',
                    let: { deptId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$departmentId', '$$deptId'] },
                                        { $eq: ['$isHead', true] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'doctorId',
                                foreignField: '_id',
                                as: 'userDetails',
                            },
                        },
                        { $unwind: '$userDetails' },
                        {
                            $project: {
                                _id: '$userDetails._id',
                                fullName: '$userDetails.fullName',
                            },
                        },
                    ],
                    as: 'headInfo',
                },
            },
            { $unwind: { path: '$headInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departmentdoctors',
                    localField: '_id',
                    foreignField: 'departmentId',
                    as: 'allDoctors',
                },
            },
            {
                $lookup: {
                    from: 'supervisionrequests',
                    localField: '_id',
                    foreignField: 'departmentId',
                    as: 'allRequests',
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'allRequests._id',
                    foreignField: 'supervision_request_id',
                    as: 'allProjects',
                },
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { departmentName: 1 } },
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                departmentName: 1,
                                universityId: '$uni._id',
                                universityName: '$uni.universityName',
                                headId: { $ifNull: ['$headInfo._id', 'لا يوجد'] },
                                headName: { $ifNull: ['$headInfo.fullName', 'غير معين'] },
                                stats: {
                                    doctorsCount: { $size: '$allDoctors' },
                                    requestsCount: { $size: '$allRequests' },
                                    projectsCount: { $size: '$allProjects' },
                                },
                                status: {
                                    $cond: {
                                        if: { $eq: ['$is_deleted', false] },
                                        then: 'نشط',
                                        else: 'محذوف',
                                    },
                                },
                                createdAt: 1,
                            },
                        },
                    ],
                },
            },
        ];
        const result = await this.departmentModel.aggregate(pipeline);
        const totalItems = result[0].metadata[0]?.total || 0;
        const departments = result[0].data;
        return {
            success: true,
            data: departments,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
            },
        };
    }
    async updateDepartment(id, dto) {
        const updateData = {};
        if (dto.departmentName) {
            updateData.departmentName = dto.departmentName.trim();
        }
        const updatedDept = await this.departmentModel.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        if (!updatedDept)
            throw new common_1.NotFoundException('القسم غير موجود');
        if (dto.headDoctorId) {
            await this.departmentDoctorModel.updateMany({
                departmentId: { $in: [id, new mongoose_2.Types.ObjectId(id)] },
                isHead: true,
            }, { $set: { isHead: false } });
            const updateResult = await this.departmentDoctorModel.updateOne({
                departmentId: { $in: [id, new mongoose_2.Types.ObjectId(id)] },
                doctorId: {
                    $in: [dto.headDoctorId, new mongoose_2.Types.ObjectId(dto.headDoctorId)],
                },
            }, { $set: { isHead: true } });
            if (updateResult.matchedCount === 0) {
                throw new common_1.BadRequestException('الدكتور المختار ليس عضواً في هذا القسم، يرجى إضافته أولاً');
            }
        }
        return {
            success: true,
            message: 'تم التحديث بنجاح',
            data: updatedDept,
        };
    }
    async toggleDepartmentStatus(id) {
        const department = await this.departmentModel.findById(id);
        if (!department)
            throw new common_1.NotFoundException('القسم غير موجود');
        const newStatus = !department.is_deleted;
        const updatedDept = await this.departmentModel.findByIdAndUpdate(id, { $set: { is_deleted: newStatus } }, { new: true });
        return {
            success: true,
            message: newStatus ? 'تم حذف القسم بنجاح ' : 'تم استعادة القسم بنجاح',
            currentStatus: newStatus ? 'Deleted' : 'Active',
        };
    }
    async getUniversitiesList(departmentId) {
        if (departmentId) {
            if (!mongoose_2.Types.ObjectId.isValid(departmentId)) {
                throw new common_1.BadRequestException('Invalid departmentId');
            }
            const department = await this.departmentModel.findById(departmentId);
            if (!department) {
                throw new common_1.NotFoundException('القسم غير موجود');
            }
            const university = await this.universityModel.findOne({ _id: department.universityId, is_deleted: false }, { _id: 1, universityName: 1 });
            return {
                success: true,
                data: university ? [university] : [],
            };
        }
        const universities = await this.universityModel
            .find({ is_deleted: false }, { _id: 1, universityName: 1 })
            .sort({ universityName: 1 });
        return {
            success: true,
            data: universities,
        };
    }
    async getDoctorStats() {
        const totalDoctors = await this.userModel.countDocuments({
            role: 'doctor',
        });
        const activeDoctors = await this.userModel.countDocuments({
            role: 'doctor',
            isDeleted: false,
        });
        const inactiveDoctors = await this.userModel.countDocuments({
            role: 'doctor',
            isDeleted: true,
        });
        const departmentHeads = await this.departmentDoctorModel.countDocuments({
            isHead: true,
        });
        return {
            success: true,
            data: {
                totalDoctors,
                activeDoctors,
                inactiveDoctors,
                departmentHeads,
            },
        };
    }
    async getAllDoctorsDetailed(query) {
        const { page = 1, limit = 10, searchTerm, departmentId, isHead, academicTitle, status, } = query;
        const skip = (page - 1) * limit;
        const matchQuery = { role: 'doctor' };
        if (searchTerm) {
            matchQuery.$or = [
                { fullName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (status === 'active')
            matchQuery.isDeleted = false;
        if (status === 'deleted')
            matchQuery.isDeleted = true;
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'departmentdoctors',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$userId'] },
                                        { $eq: ['$doctorId', { $toString: '$$userId' }] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'departments',
                                localField: 'departmentId',
                                foreignField: '_id',
                                as: 'info',
                            },
                        },
                        { $unwind: '$info' },
                    ],
                    as: 'deptLinks',
                },
            },
            ...(departmentId && departmentId !== 'all'
                ? [
                    {
                        $match: {
                            'deptLinks.departmentId': new mongoose_2.Types.ObjectId(departmentId),
                        },
                    },
                ]
                : []),
            ...(isHead === 'true' || isHead === true
                ? [{ $match: { 'deptLinks.isHead': true } }]
                : []),
            {
                $lookup: {
                    from: 'doctorprofiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile',
                },
            },
            { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
            ...(academicTitle && academicTitle !== 'all'
                ? [{ $match: { 'profile.academicTitle': academicTitle } }]
                : []),
            {
                $lookup: {
                    from: 'teams',
                    let: { docId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$docId'] },
                                        { $eq: ['$doctorId', { $toString: '$$docId' }] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'doctorTeams',
                },
            },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: 'doctorTeams._id',
                    foreignField: 'team_id',
                    as: 'allMembers',
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    let: { docId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$docId'] },
                                        { $eq: ['$doctorId', { $toString: '$$docId' }] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'allProjects',
                },
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                email: 1,
                                phoneNumber: 1,
                                profileImage: 1,
                                isDeleted: 1,
                                academicTitle: {
                                    $ifNull: ['$profile.academicTitle', 'غير محدد'],
                                },
                                academicDegree: {
                                    $ifNull: ['$profile.academicDegree', 'غير محدد'],
                                },
                                departments: {
                                    $map: {
                                        input: '$deptLinks',
                                        as: 'd',
                                        in: {
                                            departmentName: '$$d.info.departmentName',
                                            departmentId: '$$d.info._id',
                                            isHead: '$$d.isHead',
                                        },
                                    },
                                },
                                stats: {
                                    projectsCount: { $size: { $ifNull: ['$allProjects', []] } },
                                    teamsCount: { $size: { $ifNull: ['$doctorTeams', []] } },
                                    studentsCount: { $size: { $ifNull: ['$allMembers', []] } },
                                },
                            },
                        },
                    ],
                },
            },
        ];
        const result = await this.userModel.aggregate(pipeline);
        const totalItems = result[0].metadata[0]?.total || 0;
        const doctors = result[0].data;
        return {
            success: true,
            data: doctors,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
            },
        };
    }
    async getDoctorFullProfile(doctorId) {
        if (!mongoose_2.Types.ObjectId.isValid(doctorId)) {
            throw new common_1.BadRequestException('معرف الدكتور غير صحيح');
        }
        const doctor = await this.userModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(doctorId), role: 'doctor' } },
            {
                $lookup: {
                    from: 'doctorprofiles',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'profile',
                },
            },
            { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departmentdoctors',
                    let: { docId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$docId'] },
                                        { $eq: ['$doctorId', { $toString: '$$docId' }] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'departments',
                                localField: 'departmentId',
                                foreignField: '_id',
                                as: 'info',
                            },
                        },
                        { $unwind: '$info' },
                    ],
                    as: 'departmentLinks',
                },
            },
            {
                $lookup: {
                    from: 'teams',
                    let: { docId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$docId'] },
                                        { $eq: ['$doctorId', { $toString: '$$docId' }] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'teams',
                },
            },
            {
                $lookup: {
                    from: 'teammembers',
                    localField: 'teams._id',
                    foreignField: 'team_id',
                    as: 'members',
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    let: { docId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$docId'] },
                                        { $eq: ['$doctorId', { $toString: '$$docId' }] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'projects',
                },
            },
            {
                $project: {
                    _id: 1,
                    fullName: 1,
                    email: 1,
                    phoneNumber: 1,
                    profileImage: 1,
                    createdAt: 1,
                    isVerified: {
                        $cond: [{ $eq: ['$isDeleted', false] }, 'مفعل', 'غير مفعل'],
                    },
                    status: { $cond: [{ $eq: ['$isDeleted', false] }, 'نشط', 'غير نشط'] },
                    bio: {
                        $ifNull: ['$profile.bio', 'لا توجد نبذة تعريفية متاحة حالياً'],
                    },
                    academicInfo: {
                        academicTitle: { $ifNull: ['$profile.academicTitle', 'غير محدد'] },
                        academicDegree: {
                            $ifNull: ['$profile.academicDegree', 'غير محدد'],
                        },
                        specialization: {
                            $ifNull: ['$profile.specialization', 'غير محدد'],
                        },
                        yearsOfExperience: { $ifNull: ['$profile.yearsOfExperience', 0] },
                        departments: {
                            $map: {
                                input: '$departmentLinks',
                                as: 'd',
                                in: {
                                    departmentName: '$$d.info.departmentName',
                                    departmentId: '$$d.info._id',
                                    isHead: '$$d.isHead',
                                },
                            },
                        },
                    },
                    stats: {
                        projectsCount: { $size: '$projects' },
                        studentsCount: { $size: '$members' },
                        teamsCount: { $size: '$teams' },
                        experienceYears: { $ifNull: ['$profile.yearsOfExperience', 0] },
                    },
                },
            },
        ]);
        if (!doctor || doctor.length === 0) {
            throw new common_1.NotFoundException('الدكتور غير موجود');
        }
        return { success: true, data: doctor[0] };
    }
    async getProjectsStats() {
        const currentYear = new Date().getFullYear().toString();
        const stats = await this.projectModel.aggregate([
            {
                $facet: {
                    totalProjects: [{ $count: 'count' }],
                    activeProjects: [
                        { $match: { status: { $in: ['in_progress', 'start'] } } },
                        { $count: 'count' },
                    ],
                    completedProjects: [
                        { $match: { status: 'completed' } },
                        { $count: 'count' },
                    ],
                    thisYearProjects: [
                        { $match: { year: currentYear } },
                        { $count: 'count' },
                    ],
                },
            },
            {
                $project: {
                    projectTotal: {
                        $ifNull: [{ $arrayElemAt: ['$totalProjects.count', 0] }, 0],
                    },
                    projectActive: {
                        $ifNull: [{ $arrayElemAt: ['$activeProjects.count', 0] }, 0],
                    },
                    projectCompleted: {
                        $ifNull: [{ $arrayElemAt: ['$completedProjects.count', 0] }, 0],
                    },
                    projectThisYear: {
                        $ifNull: [{ $arrayElemAt: ['$thisYearProjects.count', 0] }, 0],
                    },
                },
            },
        ]);
        return {
            success: true,
            data: stats[0],
        };
    }
    async getAllProjectsDetailed(query) {
        const { page = 1, limit = 10, searchTerm, universityId, departmentId, doctorId, year, status, } = query;
        const skip = (page - 1) * limit;
        const matchQuery = {};
        if (status && status !== 'all') {
            matchQuery.status = status;
        }
        if (searchTerm) {
            matchQuery.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (year)
            matchQuery.year = year;
        if (doctorId) {
            matchQuery.$or = [
                { doctorId: new mongoose_2.Types.ObjectId(doctorId) },
                { doctorId: doctorId },
            ];
        }
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'projecttechnologies',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'techData',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    let: { dId: '$doctorId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$dId'] },
                                        { $eq: [{ $toString: '$_id' }, '$$dId'] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'doctorInfo',
                },
            },
            { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departmentdoctors',
                    let: { docId: '$doctorInfo._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$docId'] },
                                        { $eq: ['$doctorId', { $toString: '$$docId' }] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'departments',
                                localField: 'departmentId',
                                foreignField: '_id',
                                as: 'actualDept',
                            },
                        },
                        { $unwind: '$actualDept' },
                    ],
                    as: 'deptLink',
                },
            },
            { $unwind: { path: '$deptLink', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'universities',
                    let: { uniId: '$deptLink.actualDept.universityId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$_id', '$$uniId'] },
                                        { $eq: [{ $toString: '$_id' }, '$$uniId'] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'uniInfo',
                },
            },
            { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },
            ...(universityId
                ? [{ $match: { 'uniInfo._id': new mongoose_2.Types.ObjectId(universityId) } }]
                : []),
            ...(departmentId
                ? [
                    {
                        $match: {
                            'deptLink.actualDept._id': new mongoose_2.Types.ObjectId(departmentId),
                        },
                    },
                ]
                : []),
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                description: 1,
                                year: 1,
                                status: 1,
                                technologies: '$techData.tech_name',
                                doctorName: { $ifNull: ['$doctorInfo.fullName', 'غير معروف'] },
                                doctorId: '$doctorInfo._id',
                                departmentName: {
                                    $ifNull: ['$deptLink.actualDept.departmentName', 'بدون قسم'],
                                },
                                departmentId: '$deptLink.actualDept._id',
                                universityName: {
                                    $ifNull: ['$uniInfo.universityName', 'بدون جامعة'],
                                },
                                universityId: '$uniInfo._id',
                                createdAt: 1,
                            },
                        },
                    ],
                },
            },
        ];
        const result = await this.projectModel.aggregate(pipeline);
        const totalItems = result[0].metadata[0]?.total || 0;
        const projects = result[0].data;
        return {
            success: true,
            data: projects,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
                limit: Number(limit),
            },
        };
    }
    async getProjectFullDetails(projectId) {
        if (!mongoose_2.Types.ObjectId.isValid(projectId)) {
            throw new common_1.BadRequestException('معرف المشروع غير صحيح');
        }
        const project = await this.projectModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(projectId) } },
            {
                $lookup: {
                    from: 'projecttechnologies',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'techData',
                },
            },
            {
                $lookup: {
                    from: 'projectfiles',
                    localField: '_id',
                    foreignField: 'project_id',
                    as: 'files',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctorInfo',
                },
            },
            { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departmentdoctors',
                    let: { docId: '$doctorInfo._id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ['$doctorId', '$$docId'] },
                                        { $eq: ['$doctorId', { $toString: '$$docId' }] },
                                    ],
                                },
                            },
                        },
                        {
                            $lookup: {
                                from: 'departments',
                                localField: 'departmentId',
                                foreignField: '_id',
                                as: 'actualDept',
                            },
                        },
                        { $unwind: '$actualDept' },
                    ],
                    as: 'deptLink',
                },
            },
            { $unwind: { path: '$deptLink', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'universities',
                    localField: 'deptLink.actualDept.universityId',
                    foreignField: '_id',
                    as: 'uniInfo',
                },
            },
            { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },
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
                    as: 'membersList',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'membersList.user_id',
                    foreignField: '_id',
                    as: 'memberUsers',
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    year: 1,
                    status: 1,
                    projectLink: { $ifNull: ['$projectLink', ''] },
                    projectImage: { $ifNull: ['$projectImage', ''] },
                    technologies: '$techData.tech_name',
                    doctorName: '$doctorInfo.fullName',
                    doctorId: '$doctorInfo._id',
                    departmentName: '$deptLink.actualDept.departmentName',
                    departmentId: '$deptLink.actualDept._id',
                    universityName: '$uniInfo.universityName',
                    universityId: '$uniInfo._id',
                    membersCount: { $size: { $ifNull: ['$memberUsers', []] } },
                    membersNames: '$memberUsers.fullName',
                    files: {
                        $map: {
                            input: '$files',
                            as: 'f',
                            in: {
                                filename: '$$f.filename',
                                filepath: '$$f.filepath',
                            },
                        },
                    },
                    createdAt: 1,
                },
            },
        ]);
        if (!project || project.length === 0) {
            throw new common_1.NotFoundException('المشروع غير موجود');
        }
        return {
            success: true,
            data: project[0],
        };
    }
    async getTeamsStats() {
        const currentYear = new Date().getFullYear();
        const startOfYear = new Date(currentYear, 0, 1);
        const [teamStats, memberStats] = await Promise.all([
            this.teamModel.aggregate([
                {
                    $facet: {
                        totalTeams: [{ $count: 'count' }],
                        thisYearTeams: [
                            { $match: { createdAt: { $gte: startOfYear } } },
                            { $count: 'count' },
                        ],
                        activeTeams: [
                            {
                                $lookup: {
                                    from: 'projects',
                                    localField: 'project_id',
                                    foreignField: '_id',
                                    as: 'projectInfo',
                                },
                            },
                            { $unwind: '$projectInfo' },
                            { $match: { 'projectInfo.status': { $ne: 'completed' } } },
                            { $count: 'count' },
                        ],
                    },
                },
                {
                    $project: {
                        total: { $arrayElemAt: ['$totalTeams.count', 0] },
                        thisYear: { $arrayElemAt: ['$thisYearTeams.count', 0] },
                        active: { $arrayElemAt: ['$activeTeams.count', 0] },
                    },
                },
            ]),
            this.teamMemberModel.countDocuments(),
        ]);
        const stats = teamStats[0] || {};
        return {
            success: true,
            data: {
                totalTeams: stats.total || 0,
                activeTeams: stats.active || 0,
                totalMembers: memberStats || 0,
                thisYearTeams: stats.thisYear || 0,
            },
        };
    }
    async getAllTeamsDetailed(query) {
        const { page = 1, limit = 10, searchTerm, universityId, departmentId, doctorId, year, } = query;
        const skip = (page - 1) * limit;
        const matchQuery = {};
        if (doctorId) {
            matchQuery.doctorId = new mongoose_2.Types.ObjectId(doctorId);
        }
        if (searchTerm) {
            matchQuery.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { code: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'projects',
                    localField: 'project_id',
                    foreignField: '_id',
                    as: 'projectInfo',
                },
            },
            { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },
            ...(year ? [{ $match: { 'projectInfo.year': year } }] : []),
            {
                $lookup: {
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctorInfo',
                },
            },
            { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lead_id',
                    foreignField: '_id',
                    as: 'leadInfo',
                },
            },
            { $unwind: { path: '$leadInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departmentdoctors',
                    localField: 'doctorId',
                    foreignField: 'doctorId',
                    as: 'deptLink',
                },
            },
            { $unwind: { path: '$deptLink', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'deptLink.departmentId',
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
            ...(universityId
                ? [{ $match: { 'uniInfo._id': new mongoose_2.Types.ObjectId(universityId) } }]
                : []),
            ...(departmentId
                ? [{ $match: { 'deptInfo._id': new mongoose_2.Types.ObjectId(departmentId) } }]
                : []),
            {
                $lookup: {
                    from: 'teammembers',
                    localField: '_id',
                    foreignField: 'team_id',
                    as: 'membersData',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'membersData.user_id',
                    foreignField: '_id',
                    as: 'memberUsers',
                },
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                teamName: '$name',
                                teamCode: '$code',
                                projectName: {
                                    $ifNull: ['$projectInfo.title', 'غير مرتبط بمشروع'],
                                },
                                projectYear: '$projectInfo.year',
                                doctorId: '$doctorInfo._id',
                                doctorName: '$doctorInfo.fullName',
                                leaderName: '$leadInfo.fullName',
                                universityId: '$uniInfo._id',
                                universityName: '$uniInfo.universityName',
                                departmentId: '$deptInfo._id',
                                departmentName: '$deptInfo.departmentName',
                                membersCount: { $size: '$memberUsers' },
                                membersNames: '$memberUsers.fullName',
                            },
                        },
                    ],
                },
            },
        ];
        const result = await this.teamModel.aggregate(pipeline);
        const totalItems = result[0].metadata[0]?.total || 0;
        const teams = result[0].data;
        return {
            success: true,
            data: teams,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
                limit: Number(limit),
            },
        };
    }
    async getTeamDetailsById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException('معرف الفريق غير صحيح');
        }
        const team = await this.teamModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(id) } },
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
                    from: 'users',
                    localField: 'doctorId',
                    foreignField: '_id',
                    as: 'doctorInfo',
                },
            },
            { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'lead_id',
                    foreignField: '_id',
                    as: 'leadInfo',
                },
            },
            { $unwind: { path: '$leadInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departmentdoctors',
                    localField: 'doctorId',
                    foreignField: 'doctorId',
                    as: 'deptLink',
                },
            },
            { $unwind: { path: '$deptLink', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'deptLink.departmentId',
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
                    as: 'membersRecords',
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'membersRecords.user_id',
                    foreignField: '_id',
                    as: 'memberUsers',
                },
            },
            {
                $project: {
                    _id: 1,
                    teamName: '$name',
                    teamCode: '$code',
                    projectName: { $ifNull: ['$projectInfo.title', 'غير مرتبط بمشروع'] },
                    projectYear: '$projectInfo.year',
                    projectStatus: { $ifNull: ['$projectInfo.status', 'N/A'] },
                    doctorId: '$doctorInfo._id',
                    doctorName: '$doctorInfo.fullName',
                    leaderId: '$leadInfo._id',
                    leaderName: '$leadInfo.fullName',
                    universityId: '$uniInfo._id',
                    universityName: '$uniInfo.universityName',
                    departmentId: '$deptInfo._id',
                    departmentName: '$deptInfo.departmentName',
                    membersCount: { $size: '$memberUsers' },
                    membersDetails: {
                        $map: {
                            input: '$memberUsers',
                            as: 'user',
                            in: {
                                _id: '$$user._id',
                                fullName: '$$user.fullName',
                                email: '$$user.email',
                                phoneNumber: '$$user.phoneNumber',
                            },
                        },
                    },
                },
            },
        ]);
        if (!team || team.length === 0) {
            throw new common_1.NotFoundException('هذا الفريق غير موجود');
        }
        return {
            success: true,
            data: team[0],
        };
    }
    async getUsersStatistics() {
        const stats = await this.userModel.aggregate([
            {
                $match: { isDeleted: false },
            },
            {
                $facet: {
                    totalUsers: [{ $count: 'count' }],
                    totalDoctors: [{ $match: { role: 'doctor' } }, { $count: 'count' }],
                    totalStudents: [{ $match: { role: 'student' } }, { $count: 'count' }],
                    verifiedUsers: [
                        { $match: { isVerified: true } },
                        { $count: 'count' },
                    ],
                },
            },
            {
                $project: {
                    totalUsers: { $arrayElemAt: ['$totalUsers.count', 0] },
                    totalDoctors: { $arrayElemAt: ['$totalDoctors.count', 0] },
                    totalStudents: { $arrayElemAt: ['$totalStudents.count', 0] },
                    verifiedUsers: { $arrayElemAt: ['$verifiedUsers.count', 0] },
                },
            },
        ]);
        const result = stats[0] || {};
        return {
            success: true,
            data: {
                totalUsers: result.totalUsers || 0,
                totalDoctors: result.totalDoctors || 0,
                totalStudents: result.totalStudents || 0,
                verifiedUsers: result.verifiedUsers || 0,
            },
        };
    }
    async getAllUsersDetailed(query) {
        const { page = 1, limit = 10, searchTerm, role, universityId, departmentId, isVerified, status, } = query;
        const skip = (page - 1) * limit;
        const matchQuery = {};
        if (status === 'deleted') {
            matchQuery.isDeleted = true;
        }
        else if (status === 'active') {
            matchQuery.isDeleted = false;
        }
        else {
            matchQuery.isDeleted = false;
        }
        if (searchTerm) {
            matchQuery.$or = [
                { fullName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ];
        }
        if (role && role !== 'all') {
            matchQuery.role = role;
        }
        if (isVerified !== undefined && isVerified !== '') {
            matchQuery.isVerified = isVerified === 'true';
        }
        if (universityId)
            matchQuery.universityId = new mongoose_2.Types.ObjectId(universityId);
        if (departmentId)
            matchQuery.departmentId = new mongoose_2.Types.ObjectId(departmentId);
        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'universities',
                    localField: 'universityId',
                    foreignField: '_id',
                    as: 'uniInfo',
                },
            },
            { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'deptInfo',
                },
            },
            { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                fullName: 1,
                                email: 1,
                                role: 1,
                                isVerified: 1,
                                isDeleted: 1,
                                phoneNumber: 1,
                                profileImage: 1,
                                universityId: 1,
                                departmentId: 1,
                                createdAt: 1,
                                universityName: { $ifNull: ['$uniInfo.universityName', 'N/A'] },
                                departmentName: {
                                    $ifNull: ['$deptInfo.departmentName', 'N/A'],
                                },
                            },
                        },
                    ],
                },
            },
        ];
        const result = await this.userModel.aggregate(pipeline);
        const totalItems = result[0]?.metadata[0]?.total || 0;
        const users = result[0]?.data || [];
        return {
            success: true,
            data: users,
            meta: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: Number(page),
                limit: Number(limit),
            },
        };
    }
    async updateByAdmin(userId, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('معرف المستخدم غير صحيح');
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, { $set: updateDto }, { new: true, runValidators: true })
            .select('-password');
        if (!updatedUser) {
            throw new common_1.NotFoundException('المستخدم غير موجود');
        }
        if (updateDto.role === user_schema_1.UserRole.DOCTOR) {
            const existingProfile = await this.doctorProfileModel.findOne({ userId });
            if (!existingProfile) {
                await this.doctorProfileModel.create({
                    userId: updatedUser._id,
                    academicTitle: 'غير محدد',
                    specialization: ['غير محدد'],
                    academicDegree: 'غير محدد',
                    yearsOfExperience: 0,
                });
            }
        }
        return {
            success: true,
            message: 'تم تحديث بيانات المستخدم بنجاح',
            data: updatedUser,
        };
    }
    async toggleUserStatus(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('معرف المستخدم غير صحيح');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('المستخدم غير موجود');
        }
        user.isDeleted = !user.isDeleted;
        await user.save();
        return {
            success: true,
            message: user.isDeleted
                ? 'تم حذف المستخدم بنجاح (Soft Delete)'
                : 'تم استعادة المستخدم بنجاح',
            data: {
                userId: user._id,
                isDeleted: user.isDeleted,
            },
        };
    }
    async getUserDetailsById(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('معرف المستخدم غير صحيح');
        }
        const user = await this.userModel.aggregate([
            { $match: { _id: new mongoose_2.Types.ObjectId(userId) } },
            {
                $lookup: {
                    from: 'universities',
                    localField: 'universityId',
                    foreignField: '_id',
                    as: 'uniInfo',
                },
            },
            { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'departmentId',
                    foreignField: '_id',
                    as: 'deptInfo',
                },
            },
            { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },
            {
                $addFields: {
                    universityId: { $ifNull: ['$uniInfo._id', 'N/A'] },
                    universityName: { $ifNull: ['$uniInfo.universityName', 'N/A'] },
                    departmentId: { $ifNull: ['$deptInfo._id', 'N/A'] },
                    departmentName: { $ifNull: ['$deptInfo._id', 'N/A'] },
                },
            },
            {
                $project: {
                    password: 0,
                    uniInfo: 0,
                    deptInfo: 0,
                    __v: 0,
                },
            },
        ]);
        if (!user || user.length === 0) {
            throw new common_1.NotFoundException('المستخدم غير موجود');
        }
        return {
            success: true,
            data: user[0],
        };
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(university_schema_1.University.name)),
    __param(2, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __param(3, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(4, (0, mongoose_1.InjectModel)(supervision_request_schema_1.SupervisionRequest.name)),
    __param(5, (0, mongoose_1.InjectModel)(department_doctor_schema_1.DepartmentDoctor.name)),
    __param(6, (0, mongoose_1.InjectModel)(team_schema_1.Team.name)),
    __param(7, (0, mongoose_1.InjectModel)(team_member_schema_1.TeamMember.name)),
    __param(8, (0, mongoose_1.InjectModel)(doctor_specialization_schema_1.DoctorProfile.name)),
    __param(9, (0, mongoose_1.InjectModel)(user_auth_schema_1.UserAuth.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AdminDashboardService);
//# sourceMappingURL=admin-dashboard.service.js.map