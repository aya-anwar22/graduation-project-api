import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from 'src/user/schemas/user.schema';
import { University } from 'src/universities/schemas/university.schema';
import { Department } from 'src/departments/schemas/department.schema';
import { Project } from 'src/projects/schemas/project.schema';
import { SupervisionRequest } from 'src/supervision-requests/schemas/supervision-request.schema';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { DepartmentDoctor } from 'src/department-doctors/schemas/department-doctor.schema';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Team } from 'src/teams/schemas/team.schema';
import { TeamMember } from 'src/teams/schemas/team-member.schema';
import { DoctorProfile } from 'src/doctor-specialization/schema/doctor-specialization.schema';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UserAuth } from 'src/auth/schemas/user-auth.schema';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(University.name) private universityModel: Model<University>,
    @InjectModel(Department.name) private departmentModel: Model<Department>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(SupervisionRequest.name)
    private supervisionRequestModel: Model<SupervisionRequest>,
    @InjectModel(DepartmentDoctor.name)
    private departmentDoctorModel: Model<DepartmentDoctor>,
    @InjectModel(Team.name) private teamModel: Model<Team>,
    @InjectModel(TeamMember.name) private teamMemberModel: Model<TeamMember>,
    @InjectModel(DoctorProfile.name)
    private doctorProfileModel: Model<DoctorProfile>,
    @InjectModel(UserAuth.name) private UserAuthModel: Model<UserAuth>, // تأكدي من كتابة الاسم كما هو في الميثود
  ) {}

  async getAdminStats() {
    // 1. الجامعات والأقسام
    const totalUniversities = await this.universityModel.countDocuments({
      is_deleted: false,
    });
    const totalDepartments = await this.departmentModel.countDocuments({
      is_deleted: false,
    });

    // 2. المستخدمين
    const totalDoctors = await this.userModel.countDocuments({
      role: UserRole.DOCTOR,
      isDeleted: false,
    });
    const totalStudents = await this.userModel.countDocuments({
      role: UserRole.STUDENT,
      isDeleted: false,
    });

    // 3. المشاريع وتفصيل حالاتها
    const totalProjects = await this.projectModel.countDocuments({});

    // مشاريع نشطة (قيد العمل حالياً)
    const activeProjects = await this.projectModel.countDocuments({
      status: 'in_progress',
    });

    // مشاريع مكتملة (خلصت فعلياً)
    const completedProjects = await this.projectModel.countDocuments({
      status: 'completed',
    });

    // 🔥 مشاريع مميزة (اللي حالة الـ status بتاعتها start أو "عليها نجمة")
    const starredProjects = await this.projectModel.countDocuments({
      status: 'start',
    });

    // 4. طلبات الإشراف المعلقة
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

  async createUser(dto: any) {
    // 1. تحويل الـ IDs لـ ObjectIds لضمان صحة العلاقات في الداتابيز
    const universityId = dto.universityId
      ? new Types.ObjectId(dto.universityId)
      : null;
    const departmentId = dto.departmentId
      ? new Types.ObjectId(dto.departmentId)
      : null;

    // 2. إنشاء المستخدم الأساسي
    const newUser = await this.userModel.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password, // يفضل عمل Hash هنا
      role: dto.role,
      universityId: universityId,
      isVerified: true,
      departmentId: departmentId,
      phoneNumber: dto.phoneNumber,
    });

    // 3. إذا كان المستخدم دكتور (إضافة للجدول الوسيط + ملف الدكتور)
    if (dto.role === 'doctor') {
      // أ- الإضافة في الجدول الوسيط (DepartmentDoctor)
      // هنا الدكتور بيضاف للقسم المختار وتكون حالة isHead هي false افتراضياً
      await this.departmentDoctorModel.create({
        departmentId: departmentId,
        doctorId: newUser._id,
        isHead: false,
      });

      // ب- إنشاء ملف الدكتور (DoctorProfile) بالبيانات المهنية
      await this.doctorProfileModel.create({
        userId: newUser._id,
        academicTitle: dto.academicTitle || 'Doctor',
        specialization: dto.specialization || [],
        academicDegree: dto.academicDegree || 'PhD',
        yearsOfExperience: dto.yearsOfExperience || 0,
      });
    }

    // 4. إنشاء سجل الـ Auth (للتعامل مع تسجيل الدخول لاحقاً)
    await this.UserAuthModel.create({
      userId: newUser._id,
    });

    return {
      success: true,
      message:
        dto.role === 'doctor'
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

  async findDepartmentsByUniversity(universityId: string) {
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
          projectCount: { $size: '$projects' }, // حساب عدد العناصر في المصفوفة
        },
      },

      // 6. الترتيب من الأكثر للأقل
      { $sort: { projectCount: -1 } },
    ]);

    return {
      success: true,
      data: distribution,
    };
  }

  // --- إضافة جامعة جديدة ---
  async createUniversity(dto: CreateUniversityDto) {
    const existingUni = await this.universityModel.findOne({
      universityName: dto.universityName,
      is_deleted: false,
    });

    if (existingUni) {
      throw new BadRequestException('هذه الجامعة مسجلة بالفعل');
    }

    const newUniversity = new this.universityModel({
      universityName: dto.universityName,
      location: dto.location, // 👈 تخزين العنوان الجغرافي (مثل: كيلو 21)
      contactEmail: dto.contactEmail,
    });

    const savedUni = await newUniversity.save();
    return { success: true, message: 'تم إضافة الجامعة بنجاح', data: savedUni };
  }

  async getAllUniversitiesWithDetails(query: {
    searchTerm?: string;
    isDeletedFilter?: boolean | null;
    page?: number;
    limit?: number;
  }) {
    const {
      searchTerm = '',
      isDeletedFilter = null,
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;
    const matchQuery: Record<string, any> = {};

    if (searchTerm) {
      matchQuery.universityName = { $regex: searchTerm, $options: 'i' };
    }

    if (isDeletedFilter !== null) {
      matchQuery.is_deleted = isDeletedFilter;
    }

    const pipeline: any[] = [
      { $match: matchQuery },

      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: 'universityId',
          as: 'departments',
        },
      },

      // 2. استخدام Facet لحساب الإحصائيات وجلب البيانات في نفس الوقت
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { createdAt: -1 } }, // ترتيب الأحدث أولاً
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

    // استخراج البيانات من نتيجة الـ Facet
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

  async getUniversityDetails(universityId: string) {
    const uniObjectId = new Types.ObjectId(universityId);

    const universityDetails = await this.universityModel.aggregate([
      { $match: { _id: uniObjectId } },

      // 1. حساب عدد الأقسام (مباشرة من جدول الأقسام)
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: 'universityId',
          as: 'departments',
        },
      },

      // 2. حساب عدد الدكاترة (المستخدمين اللي دورهم doctor ومربوطين بأي قسم من أقسام الجامعة دي)
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

      // 3. حساب عدد المشاريع (المشاريع المربوطة بطلبات إشراف تابعة لأقسام الجامعة)
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

      // 4. التنسيق النهائي وعرض الأرقام
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
      throw new NotFoundException('الجامعة غير موجودة');
    }

    return {
      success: true,
      data: universityDetails[0],
    };
  }

  // --- تعديل بيانات الجامعة ---
  async updateUniversity(id: string, dto: UpdateUniversityDto) {
    const updatedUni = await this.universityModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true }, // لإرجاع البيانات الجديدة بعد التعديل
    );

    if (!updatedUni) throw new NotFoundException('الجامعة غير موجودة');

    return {
      success: true,
      message: 'تم تحديث بيانات الجامعة بنجاح',
      data: updatedUni,
    };
  }

  // --- الحذف الناعم (Soft Delete) ---
  async toggleUniversityStatus(id: string) {
    // 1. نبحث عن الجامعة أولاً لنعرف حالتها الحالية
    const university = await this.universityModel.findById(id);

    if (!university) throw new NotFoundException('الجامعة غير موجودة');

    // 2. تبديل الحالة: لو true تبقى false والعكس
    const newStatus = !university.is_deleted;

    await this.universityModel.findByIdAndUpdate(
      id,
      { $set: { is_deleted: newStatus } },
      { new: true },
    );

    return {
      success: true,
      message: newStatus
        ? 'تم نقل الجامعة إلى سلة المحذوفات بنجاح'
        : 'تم استعادة الجامعة بنجاح',
      currentStatus: newStatus ? 'Deleted' : 'Active',
    };
  }

  async getDepartmentStats() {
    // 1. إحصائيات الأقسام (الإجمالي والنشط)
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

    // 2. إحصائيات الدكاترة ورؤساء الأقسام
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

  async createDepartment(data: {
    departmentName: string;
    universityId: string;
    headDoctorId?: string;
  }) {
    // 1. إنشاء القسم
    const newDepartment = await this.departmentModel.create({
      departmentName: data.departmentName,
      universityId: data.universityId,
      is_deleted: false,
    });

    // 2. لو فيه دكتور رئيس قسم يتسجل
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

  async getDoctorsByUniversity(universityId: string) {
    // 1. تحويل الـ ID لـ ObjectId لضمان دقة البحث
    const uniObjectId = new Types.ObjectId(universityId);

    // 2. البحث عن الدكاترة مع جلب بيانات القسم الخاص بهم (Populate)
    const doctors = await this.userModel
      .find({
        universityId: uniObjectId,
        role: 'doctor', // نفلتر بالرول دكتور فقط
        isDeleted: false, // نتأكد إنه مش محذوف
      })
      .select('-password') // عشان منرجعش الباسورد في الـ API للأمان
      .populate('departmentId', 'departmentName'); // عرض اسم القسم بدل الـ ID فقط

    return {
      success: true,
      count: doctors.length,
      data: doctors,
    };
  }

  async getAllDepartments(query: {
    searchTerm?: string;
    isDeletedFilter?: boolean | null;
    universityId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      searchTerm = '',
      isDeletedFilter = null,
      universityId = '',
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;
    const matchQuery: Record<string, any> = {};

    // 1. فلاتر البحث والحالة والجامعة
    if (searchTerm) {
      matchQuery.departmentName = { $regex: searchTerm, $options: 'i' };
    }
    if (isDeletedFilter !== null) {
      matchQuery.is_deleted = isDeletedFilter;
    }
    if (universityId && Types.ObjectId.isValid(universityId)) {
      matchQuery.universityId = new Types.ObjectId(universityId);
    }

    const pipeline: any[] = [
      { $match: matchQuery },

      // --- (نفس مراحل الـ Lookups اللي إنتي كاتباها) ---

      // 1. ربط الجامعة
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'uni',
        },
      },
      { $unwind: { path: '$uni', preserveNullAndEmptyArrays: true } },

      // 2. ربط رئيس القسم
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

      // 3. الإحصائيات (دكاترة، طلبات، مشاريع)
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

      // --- (نهاية الـ Lookups) ---

      // 2. استخدام Facet للتقسيم لصفحات وحساب المجموع
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

  async updateDepartment(id: string, dto: UpdateDepartmentDto) {
    // 1. تحديث اسم القسم
    const updateData: any = {};
    if (dto.departmentName) {
      updateData.departmentName = dto.departmentName.trim();
    }

    const updatedDept = await this.departmentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!updatedDept) throw new NotFoundException('القسم غير موجود');

    // 2. تحديث رئيس القسم
    if (dto.headDoctorId) {
      // تصفير الرؤساء الحاليين للقسم (بندور بالـ ID كـ String وكـ ObjectId)
      await this.departmentDoctorModel.updateMany(
        {
          departmentId: { $in: [id, new Types.ObjectId(id)] },
          isHead: true,
        },
        { $set: { isHead: false } },
      );

      // البحث عن الدكتور وتعيينه رئيس
      const updateResult = await this.departmentDoctorModel.updateOne(
        {
          departmentId: { $in: [id, new Types.ObjectId(id)] }, // تجربة النوعين لضمان المطابقة
          doctorId: {
            $in: [dto.headDoctorId, new Types.ObjectId(dto.headDoctorId)],
          },
        },
        { $set: { isHead: true } },
      );

      if (updateResult.matchedCount === 0) {
        throw new BadRequestException(
          'الدكتور المختار ليس عضواً في هذا القسم، يرجى إضافته أولاً',
        );
      }
    }

    return {
      success: true,
      message: 'تم التحديث بنجاح',
      data: updatedDept,
    };
  }
  // --- تبديل حالة القسم (حذف ناعم / استعادة) ---
  async toggleDepartmentStatus(id: string) {
    const department = await this.departmentModel.findById(id);

    if (!department) throw new NotFoundException('القسم غير موجود');

    // تبديل القيمة (لو true تبقى false والعكس)
    // ملاحظة: تأكدي من مسمى الحقل في السكيما (is_deleted أم isDeleted)
    const newStatus = !department.is_deleted;

    const updatedDept = await this.departmentModel.findByIdAndUpdate(
      id,
      { $set: { is_deleted: newStatus } },
      { new: true },
    );

    return {
      success: true,
      message: newStatus ? 'تم حذف القسم بنجاح ' : 'تم استعادة القسم بنجاح',
      currentStatus: newStatus ? 'Deleted' : 'Active',
    };
  }

  async getUniversitiesList(departmentId?: string) {
    // 🟢 الحالة 1: لو فيه departmentId
    if (departmentId) {
      if (!Types.ObjectId.isValid(departmentId)) {
        throw new BadRequestException('Invalid departmentId');
      }

      // نجيب القسم
      const department = await this.departmentModel.findById(departmentId);

      if (!department) {
        throw new NotFoundException('القسم غير موجود');
      }

      // نجيب الجامعة المرتبطة بيه
      const university = await this.universityModel.findOne(
        { _id: department.universityId, is_deleted: false },
        { _id: 1, universityName: 1 },
      );

      return {
        success: true,
        data: university ? [university] : [],
      };
    }

    // 🔵 الحالة 2: مفيش departmentId → رجّع كله
    const universities = await this.universityModel
      .find({ is_deleted: false }, { _id: 1, universityName: 1 })
      .sort({ universityName: 1 });

    return {
      success: true,
      data: universities,
    };
  }

  async getDoctorStats() {
    // 1. حساب الدكاترة النشطين وغير النشطين من جدول Users
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

    // 2. حساب رؤساء الأقسام من جدول DepartmentDoctor
    // (نحسب السجلات اللي فيها isHead: true)
    const departmentHeads = await this.departmentDoctorModel.countDocuments({
      isHead: true,
    });

    return {
      success: true,
      data: {
        totalDoctors, // إجمالي الدكاترة
        activeDoctors, // نشطين
        inactiveDoctors, // دكاترة غير نشطين
        departmentHeads, // رؤساء الأقسام
      },
    };
  }

  async getAllDoctorsDetailed(query: {
    searchTerm?: string;
    departmentId?: string;
    isHead?: any;
    academicTitle?: string;
    status?: string;
    page?: number; // إضافة الصفحة
    limit?: number; // إضافة الليميت
  }) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      departmentId,
      isHead,
      academicTitle,
      status,
    } = query;

    const skip = (page - 1) * limit;
    const matchQuery: any = { role: 'doctor' };

    // فلترة البحث
    if (searchTerm) {
      matchQuery.$or = [
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // فلترة الحالة
    if (status === 'active') matchQuery.isDeleted = false;
    if (status === 'deleted') matchQuery.isDeleted = true;

    const pipeline: any[] = [
      { $match: matchQuery },

      // ربط الأقسام
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

      // فلاتر بعد الـ Lookup (القسم ورئيس القسم)
      ...(departmentId && departmentId !== 'all'
        ? [
            {
              $match: {
                'deptLinks.departmentId': new Types.ObjectId(departmentId),
              },
            },
          ]
        : []),
      ...(isHead === 'true' || isHead === true
        ? [{ $match: { 'deptLinks.isHead': true } }]
        : []),

      // ربط الملف الشخصي (Profile)
      {
        $lookup: {
          from: 'doctorprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile',
        },
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },

      // فلترة اللقب الأكاديمي
      ...(academicTitle && academicTitle !== 'all'
        ? [{ $match: { 'profile.academicTitle': academicTitle } }]
        : []),

      // ربط الفرق والمشاريع للإحصائيات
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

      // --- المرحلة النهائية: Facet للـ Pagination ---
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

  async getDoctorFullProfile(doctorId: string) {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('معرف الدكتور غير صحيح');
    }

    const doctor = await this.userModel.aggregate([
      // 1. تحديد الدكتور
      { $match: { _id: new Types.ObjectId(doctorId), role: 'doctor' } },

      // 2. ربط ملف الدكتور (Profile)
      {
        $lookup: {
          from: 'doctorprofiles',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile',
        },
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },

      // 3. ربط جميع الأقسام (تعدد الأقسام)
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

      // 4. حساب الإحصائيات (فرق، طلاب، مشاريع) مع معالجة الـ ID بكل أنواعه
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

      // 5. التنسيق النهائي ليدعم تعدد الأقسام
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
            // مصفوفة بكل الأقسام وحالة الرئاسة في كل قسم
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
            // لسهولة العرض في الواجهة (هل هو رئيس في أي قسم؟)
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
      throw new NotFoundException('الدكتور غير موجود');
    }

    return { success: true, data: doctor[0] };
  }

  async getProjectsStats() {
    const currentYear = new Date().getFullYear().toString(); // "2026"

    const stats = await this.projectModel.aggregate([
      {
        $facet: {
          // إجمالي المشاريع
          totalProjects: [{ $count: 'count' }],

          // مشاريع نشطة (in_progress أو start)
          activeProjects: [
            { $match: { status: { $in: ['in_progress', 'start'] } } },
            { $count: 'count' },
          ],

          // مشاريع مكتملة (completed)
          completedProjects: [
            { $match: { status: 'completed' } },
            { $count: 'count' },
          ],

          // مشاريع هذا العام
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

  async getAllProjectsDetailed(query: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    universityId?: string;
    departmentId?: string;
    doctorId?: string;
    year?: string;
    status?: string; // إضافة الحالة هنا
  }) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      universityId,
      departmentId,
      doctorId,
      year,
      status,
    } = query;

    const skip = (page - 1) * limit;
    const matchQuery: any = {};

    // فلترة الحالة (in_progress | completed | start)
    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    if (searchTerm) {
      matchQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (year) matchQuery.year = year;

    if (doctorId) {
      matchQuery.$or = [
        { doctorId: new Types.ObjectId(doctorId) },
        { doctorId: doctorId },
      ];
    }

    const pipeline: any[] = [
      { $match: matchQuery },

      // 1. ربط التكنولوجي
      {
        $lookup: {
          from: 'projecttechnologies',
          localField: '_id',
          foreignField: 'project_id',
          as: 'techData',
        },
      },

      // 2. ربط الدكتور
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

      // 3. ربط القسم
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

      // 4. ربط الجامعة
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

      // فلاتر الربط النهائية (بعد الـ Lookups)
      ...(universityId
        ? [{ $match: { 'uniInfo._id': new Types.ObjectId(universityId) } }]
        : []),
      ...(departmentId
        ? [
            {
              $match: {
                'deptLink.actualDept._id': new Types.ObjectId(departmentId),
              },
            },
          ]
        : []),

      // 5. استخدام Facet للـ Pagination
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

  async getProjectFullDetails(projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('معرف المشروع غير صحيح');
    }

    const project = await this.projectModel.aggregate([
      // 1. تحديد المشروع المطلوب
      { $match: { _id: new Types.ObjectId(projectId) } },

      // 2. ربط التكنولوجيات
      {
        $lookup: {
          from: 'projecttechnologies',
          localField: '_id',
          foreignField: 'project_id',
          as: 'techData',
        },
      },

      // 3. ربط الملفات (Files)
      {
        $lookup: {
          from: 'projectfiles',
          localField: '_id',
          foreignField: 'project_id',
          as: 'files',
        },
      },

      // 4. ربط الدكتور (User)
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorInfo',
        },
      },
      { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },

      // 5. ربط القسم (عبر جدول الوسيط DepartmentDoctor)
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

      // 6. ربط الجامعة (من خلال القسم)
      {
        $lookup: {
          from: 'universities',
          localField: 'deptLink.actualDept.universityId',
          foreignField: '_id',
          as: 'uniInfo',
        },
      },
      { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },

      // 7. ربط الفريق والأعضاء
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

      // 8. التنسيق النهائي وعرض الحقول المطلوبة
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          year: 1,
          status: 1,
          projectLink: { $ifNull: ['$projectLink', ''] },
          projectImage: { $ifNull: ['$projectImage', ''] },

          // التكنولوجي كقائمة أسماء
          technologies: '$techData.tech_name',

          // بيانات الدكتور
          doctorName: '$doctorInfo.fullName',
          doctorId: '$doctorInfo._id',

          // بيانات القسم والجامعة
          departmentName: '$deptLink.actualDept.departmentName',
          departmentId: '$deptLink.actualDept._id',
          universityName: '$uniInfo.universityName',
          universityId: '$uniInfo._id',

          // بيانات الأعضاء
          membersCount: { $size: { $ifNull: ['$memberUsers', []] } },
          membersNames: '$memberUsers.fullName',

          // بيانات الملفات
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
      throw new NotFoundException('المشروع غير موجود');
    }

    return {
      success: true,
      data: project[0],
    };
  }

  async getTeamsStats() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // 1 يناير من العام الحالي

    const [teamStats, memberStats] = await Promise.all([
      this.teamModel.aggregate([
        {
          $facet: {
            // 1. إجمالي الفرق
            totalTeams: [{ $count: 'count' }],

            // 2. فرق هذا العام (بناءً على تاريخ الإنشاء)
            thisYearTeams: [
              { $match: { createdAt: { $gte: startOfYear } } },
              { $count: 'count' },
            ],

            // 3. الفرق النشطة
            // (لو افترضنا أن الفريق النشط هو المرتبط بمشروع حالته ليست completed)
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

      // 4. إجمالي الأعضاء (من جدول TeamMember)
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

  async getAllTeamsDetailed(query: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    universityId?: string;
    departmentId?: string;
    doctorId?: string;
    year?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      universityId,
      departmentId,
      doctorId,
      year,
    } = query;

    const skip = (page - 1) * limit;
    const matchQuery: any = {};

    // فلترة بالدكتور (من جدول الفريق مباشرة)
    if (doctorId) {
      matchQuery.doctorId = new Types.ObjectId(doctorId);
    }

    // فلترة بالبحث (اسم التيم أو الكود)
    if (searchTerm) {
      matchQuery.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const pipeline: any[] = [
      { $match: matchQuery },

      // 1. ربط المشروع
      {
        $lookup: {
          from: 'projects',
          localField: 'project_id',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },

      // فلترة بالسنة (من جدول المشروع)
      ...(year ? [{ $match: { 'projectInfo.year': year } }] : []),

      // 2. ربط الدكتور (المشرف)
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorInfo',
        },
      },
      { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },

      // 3. ربط الليدر (قائد الفريق)
      {
        $lookup: {
          from: 'users',
          localField: 'lead_id',
          foreignField: '_id',
          as: 'leadInfo',
        },
      },
      { $unwind: { path: '$leadInfo', preserveNullAndEmptyArrays: true } },

      // 4. ربط القسم والجامعة (عن طريق الدكتور)
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

      // فلاتر الجامعة والقسم
      ...(universityId
        ? [{ $match: { 'uniInfo._id': new Types.ObjectId(universityId) } }]
        : []),
      ...(departmentId
        ? [{ $match: { 'deptInfo._id': new Types.ObjectId(departmentId) } }]
        : []),

      // 5. ربط الأعضاء وأسمائهم
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

      // 6. التشكيل النهائي والـ Pagination
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

  async getTeamDetailsById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف الفريق غير صحيح');
    }

    const team = await this.teamModel.aggregate([
      // 1. تحديد الفريق المطلوب
      { $match: { _id: new Types.ObjectId(id) } },

      // 2. ربط المشروع
      {
        $lookup: {
          from: 'projects',
          localField: 'project_id',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },

      // 3. ربط الدكتور
      {
        $lookup: {
          from: 'users',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorInfo',
        },
      },
      { $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true } },

      // 4. ربط الليدر
      {
        $lookup: {
          from: 'users',
          localField: 'lead_id',
          foreignField: '_id',
          as: 'leadInfo',
        },
      },
      { $unwind: { path: '$leadInfo', preserveNullAndEmptyArrays: true } },

      // 5. ربط القسم والجامعة
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

      // 6. ربط الأعضاء
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

      // 7. الشكل النهائي
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
      throw new NotFoundException('هذا الفريق غير موجود');
    }

    return {
      success: true,
      data: team[0],
    };
  }

  async getUsersStatistics() {
    const stats = await this.userModel.aggregate([
      {
        // نفلتر فقط المستخدمين غير المحذوفين
        $match: { isDeleted: false },
      },
      {
        $facet: {
          // 1. إجمالي المستخدمين
          totalUsers: [{ $count: 'count' }],

          // 2. عدد الدكاترة
          totalDoctors: [{ $match: { role: 'doctor' } }, { $count: 'count' }],

          // 3. عدد الطلاب
          totalStudents: [{ $match: { role: 'student' } }, { $count: 'count' }],

          // 4. الحسابات المفعلة (المؤكدة بالبريد مثلاً)
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

  async getAllUsersDetailed(query: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    role?: string;
    universityId?: string;
    departmentId?: string;
    isVerified?: string;
    status?: string;
  }) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      role,
      universityId,
      departmentId,
      isVerified,
      status,
    } = query;

    const skip = (page - 1) * limit;
    const matchQuery: any = {};

    // 1. فلترة الحالة (نشط أو محذوف)
    if (status === 'deleted') {
      matchQuery.isDeleted = true;
    } else if (status === 'active') {
      matchQuery.isDeleted = false;
    } else {
      // كحالة افتراضية إذا لم يحدد، نعرض غير المحذوفين فقط
      matchQuery.isDeleted = false;
    }

    // 2. البحث بالاسم أو الإيميل
    if (searchTerm) {
      matchQuery.$or = [
        { fullName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // 3. فلترة الدور (Role)
    if (role && role !== 'all') {
      matchQuery.role = role;
    }

    // 4. فلترة التفعيل (isVerified)
    if (isVerified !== undefined && isVerified !== '') {
      matchQuery.isVerified = isVerified === 'true';
    }

    // 5. فلترة الجامعة والقسم
    if (universityId)
      matchQuery.universityId = new Types.ObjectId(universityId);
    if (departmentId)
      matchQuery.departmentId = new Types.ObjectId(departmentId);

    const pipeline: any[] = [
      { $match: matchQuery },

      // ربط بيانات الجامعة
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'uniInfo',
        },
      },
      { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },

      // ربط بيانات القسم
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'deptInfo',
        },
      },
      { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },

      // التنسيق والـ Pagination باستخدام Facet
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: Number(limit) },
            {
              $project: {
                // الحقول التي نريد إرجاعها
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
                // استخراج الأسماء من المصفوفات ثم حذف المصفوفات نفسها
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

    // استخراج البيانات من نتيجة الـ aggregate
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

  // داخل admin.service.ts أو user.service.ts
  async updateByAdmin(userId: string, updateDto: UpdateUserAdminDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    // التحديث في اليوزر (role, universityId, departmentId)
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateDto }, // هيحدث اللي مبعوث بس
        { new: true, runValidators: true },
      )
      .select('-password');

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // منطق إنشاء بروفايل الدكتور لو الرول اتغير أو كان دكتور أصلاً
    if (updateDto.role === UserRole.DOCTOR) {
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

  async toggleUserStatus(userId: string) {
    // 1. التأكد من صحة الـ ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    // 2. البحث عن المستخدم (حتى لو كان محذوفاً)
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    // 3. عكس حالة الحذف (Toggle)
    // إذا كان true سيصبح false والعكس
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

  async getUserDetailsById(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صحيح');
    }

    const user = await this.userModel.aggregate([
      { $match: { _id: new Types.ObjectId(userId) } },

      // 1. ربط بيانات الجامعة
      {
        $lookup: {
          from: 'universities',
          localField: 'universityId',
          foreignField: '_id',
          as: 'uniInfo',
        },
      },
      { $unwind: { path: '$uniInfo', preserveNullAndEmptyArrays: true } },

      // 2. ربط بيانات القسم
      {
        $lookup: {
          from: 'departments',
          localField: 'departmentId',
          foreignField: '_id',
          as: 'deptInfo',
        },
      },
      { $unwind: { path: '$deptInfo', preserveNullAndEmptyArrays: true } },

      // 3. إضافة الحقول الجديدة أولاً
      {
        $addFields: {
          universityId: { $ifNull: ['$uniInfo._id', 'N/A'] },
          universityName: { $ifNull: ['$uniInfo.universityName', 'N/A'] },
          departmentId: { $ifNull: ['$deptInfo._id', 'N/A'] },
          departmentName: { $ifNull: ['$deptInfo._id', 'N/A'] },
        },
      },

      // 4. استبعاد الحقول غير المرغوب فيها (الإقصاء فقط هنا)
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
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      success: true,
      data: user[0],
    };
  }
}
