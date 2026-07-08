import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  SupervisionRequest,
  SupervisionRequestDocument,
} from './schemas/supervision-request.schema';
import {
  SupervisionRequestMember,
  SupervisionRequestMemberDocument,
} from './schemas/supervision-request-member.schema';
import { User, UserDocument, UserRole } from '../user/schemas/user.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';
import {
  Department,
  DepartmentDocument,
} from '../departments/schemas/department.schema';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ProjectFile,
  ProjectFileDocument,
} from 'src/projects/schemas/project-file.schema';
import {
  ProjectTechnology,
  ProjectTechnologyDocument,
} from 'src/projects/schemas/project-technology.schema';
import { EmailService } from 'src/common/email/email.service';
import { TeamsService } from 'src/teams/teams.service';
import { GroupChatsService } from 'src/chats/schemas/group-chats.service';
import {
  DepartmentDoctor,
  DepartmentDoctorDocument,
} from 'src/department-doctors/schemas/department-doctor.schema';
import { CreateSupervisionRequestDto } from './dto/create-supervision-request.dto';
import { UpdateRequestStatusDto } from './dto/update-status.dto';
import { Team, TeamDocument } from 'src/teams/schemas/team.schema';
import {
  TeamMember,
  TeamMemberDocument,
} from 'src/teams/schemas/team-member.schema';

@Injectable()
export class SupervisionRequestsService {
  constructor(
    @InjectModel(SupervisionRequest.name)
    private supervisionRequestModel: Model<SupervisionRequestDocument>,
    @InjectModel(SupervisionRequestMember.name)
    private requestMemberModel: Model<SupervisionRequestMemberDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectFile.name)
    private projectFileModel: Model<ProjectFileDocument>,
    @InjectModel(ProjectTechnology.name)
    private projectTechnologyModel: Model<ProjectTechnologyDocument>,
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>, // ✅ حل مشكلة Property teamModel
    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMemberDocument>, // ✅ حل مشكلة Property teamMemberModel
    @InjectModel(DepartmentDoctor.name)
    private departmentDoctorModel: Model<DepartmentDoctorDocument>,

    private emailService: EmailService,

    private notificationsService: NotificationsService,

    private teamsService: TeamsService,

    private groupChatsService: GroupChatsService,
  ) {}

  async createSupervisionRequest(
    userId: string,
    createDto: CreateSupervisionRequestDto,
  ) {
    // ✅ 1. التحقق من صحة معرف الطالب وجلبه
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صالح');
    }
    const userObjectId = new Types.ObjectId(userId);

    const student = await this.userModel.findById(userObjectId);
    if (!student) throw new NotFoundException('المستخدم غير موجود');
    if (student.role !== UserRole.STUDENT) {
      throw new ForbiddenException('فقط الطلاب يمكنهم إنشاء طلبات إشراف');
    }
    if (student.isDeleted)
      throw new BadRequestException('الحساب محذوف من النظام');
    if (!student.universityId || !student.departmentId) {
      throw new BadRequestException('يجب إكمال بيانات الجامعة والقسم أولاً');
    }

    const studentUniversityId = student.universityId;
    const studentDepartmentId = student.departmentId;

    const studentDepartment =
      await this.departmentModel.findById(studentDepartmentId);
    if (!studentDepartment)
      throw new BadRequestException('القسم الخاص بك غير موجود في النظام');
    if (studentDepartment.is_deleted)
      throw new BadRequestException('القسم الخاص بك محذوف من النظام');

    // ✅ 2. التحقق من صحة معرف الدكتور وجلبه
    if (!Types.ObjectId.isValid(createDto.doctorId)) {
      throw new BadRequestException('doctorId غير صالح');
    }

    const doctorObjectId = new Types.ObjectId(createDto.doctorId);

    const doctor = await this.userModel.findById(doctorObjectId);
    if (!doctor) throw new NotFoundException('الدكتور غير موجود');
    if (doctor.role !== UserRole.DOCTOR)
      throw new BadRequestException('المستخدم المحدد ليس دكتورًا');
    if (doctor.isDeleted)
      throw new BadRequestException('الدكتور محذوف من النظام');

    // ✅ 3. جلب الأقسام المرتبطة بالدكتور باستخدام ObjectId
    const doctorDepartments = await this.departmentDoctorModel.find({
      doctorId: doctorObjectId,
    });

    if (!doctorDepartments || doctorDepartments.length === 0) {
      throw new BadRequestException(
        'الدكتور غير مسجل في أي قسم، يرجى التواصل مع الإدارة',
      );
    }

    // ✅ 4. اختيار القسم المناسب
    let doctorDepartment;
    if (createDto.departmentId) {
      const targetDeptId = new Types.ObjectId(createDto.departmentId);
      doctorDepartment = doctorDepartments.find(
        (d) => d.departmentId.toString() === targetDeptId.toString(),
      );
      if (!doctorDepartment) {
        throw new BadRequestException(
          'الدكتور المحدد غير موجود في القسم المطلوب',
        );
      }
    } else {
      doctorDepartment = doctorDepartments[0];
    }

    const doctorDept = await this.departmentModel.findById(
      doctorDepartment.departmentId,
    );
    if (!doctorDept)
      throw new BadRequestException('القسم الخاص بالدكتور غير موجود في النظام');
    if (doctorDept.is_deleted)
      throw new BadRequestException('القسم الخاص بالدكتور محذوف من النظام');

    // ✅ 5. التأكد من تطابق الجامعة والقسم
    if (doctorDept.universityId.toString() !== studentUniversityId.toString()) {
      throw new BadRequestException(
        'الدكتور يجب أن يكون في نفس الجامعة الخاصة بك',
      );
    }
    if (
      doctorDepartment.departmentId.toString() !==
      studentDepartmentId.toString()
    ) {
      throw new BadRequestException(
        'الدكتور يجب أن يكون في نفس القسم الخاص بك',
      );
    }

    // ✅ 6. التحقق من بيانات أعضاء الفريق
    if (!createDto.team_members || createDto.team_members.length === 0) {
      throw new BadRequestException('يجب إضافة أعضاء الفريق');
    }

    const emails = createDto.team_members.map((m) => m.contact_email);
    const uniqueEmails = [...new Set(emails)];
    if (uniqueEmails.length !== emails.length) {
      throw new BadRequestException('يوجد إيميلات مكررة في قائمة أعضاء الفريق');
    }

    const users = await this.userModel.find({ email: { $in: emails } });
    if (users.length !== emails.length) {
      const foundEmails = users.map((u) => u.email);
      const missingEmails = emails.filter((e) => !foundEmails.includes(e));
      throw new BadRequestException(
        `الإيميلات التالية غير موجودة في قاعدة البيانات: ${missingEmails.join(', ')}`,
      );
    }

    for (const u of users) {
      if (u.role !== UserRole.STUDENT)
        throw new BadRequestException(`المستخدم ${u.fullName} ليس طالباً`);
      if (u.isDeleted)
        throw new BadRequestException(`الطالب ${u.fullName} محذوف من النظام`);
      if (
        u.departmentId?.toString() !== studentDepartmentId.toString() ||
        u.universityId?.toString() !== studentUniversityId.toString()
      ) {
        throw new BadRequestException(
          `الطالب ${u.fullName} ليس في نفس الجامعة أو القسم`,
        );
      }
    }

    const leaders = createDto.team_members.filter((m) => m.isLeader);
    if (leaders.length === 0)
      throw new BadRequestException('يجب تحديد قائد للفريق');
    if (leaders.length > 1)
      throw new BadRequestException('يجب تحديد قائد واحد فقط للفريق');

    const userIds = users.map((u) => u._id);

    // ✅ 7. التأكد من عدم وجود طلب نشط
    const existingRequests = await this.supervisionRequestModel.find({
      student_id: { $in: userIds },
      status: { $in: ['pending', 'approved'] },
    });
    if (existingRequests.length > 0) {
      throw new BadRequestException('أحد الطلاب لديه طلب إشراف نشط بالفعل');
    }

    // ✅ 8. التأكد من عدم تواجد الطلاب في أي فريق آخر (حل مشكلة الـ TypeScript هنا)
    for (const checkUserId of userIds) {
      const isInTeam = await this.teamsService.isUserInAnyTeam(checkUserId);
      if (isInTeam) {
        const user = users.find(
          (u) => u._id.toString() === checkUserId.toString(),
        );
        // تم استخدام ?.fullName والتحقق من وجود الكائن لتجنب خطأ TS18048
        const userName = user ? user.fullName : 'غير معروف';
        throw new BadRequestException(
          `الطالب ${userName} موجود في فريق آخر بالفعل`,
        );
      }
    }

    // ✅ 9. تنفيذ عملية الحفظ
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

  async getRequestForTeamMember(id: string, userId: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف الطلب غير صالح');
    }
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('معرف المستخدم غير صالح');
    }

    const userObjectId = new Types.ObjectId(userId);

    const request = await this.supervisionRequestModel
      .findById(id)
      .populate(
        'student_id',
        'fullName email profileImage universityCode phoneNumber',
      )
      .populate('doctorId', 'fullName email profileImage')
      .populate('departmentId', 'departmentName')
      .lean();

    if (!request) {
      throw new NotFoundException('الطلب غير موجود');
    }

    if (request.student_id._id.toString() === userId) {
      const members = await this.requestMemberModel
        .find({
          request_id: request._id,
        })
        .lean();

      return {
        ...request,
        team_members: members,
      };
    }

    const currentUser = await this.userModel.findById(userObjectId);
    if (!currentUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const isTeamMember = await this.requestMemberModel.findOne({
      request_id: request._id,
      contact_email: currentUser.email,
    });

    if (!isTeamMember) {
      throw new ForbiddenException('غير مسموح لك بعرض هذا الطلب');
    }

    const members = await this.requestMemberModel
      .find({
        request_id: request._id,
      })
      .lean();

    return {
      ...request,
      team_members: members,
      is_team_leader: isTeamMember.isLeader,
    };
  }

  async updateRequestStatus(
    requestId: string,
    doctorId: string,
    status: 'approved' | 'rejected',
  ) {
    // 1. البحث عن الطلب
    const request = await this.supervisionRequestModel.findOne({
      _id: requestId,
      doctorId: new Types.ObjectId(doctorId),
    });

    if (!request) throw new NotFoundException('الطلب غير موجود');

    // منع التكرار: إذا كان الطلب مقبولاً أو مرفوضاً مسبقاً، نرجع رسالة توضيحية بدل الخطأ
    if (request.status === 'approved' || request.status === 'rejected') {
      throw new BadRequestException(
        `هذا الطلب تم ${request.status === 'approved' ? 'قبوله' : 'رفضه'} بالفعل`,
      );
    }

    // 2. استخدام Transaction لضمان سلامة البيانات
    return await this.supervisionRequestModel.db.transaction(
      async (session) => {
        if (status === 'rejected') {
          request.status = 'rejected';
          await request.save({ session });
          return { success: true, message: 'تم رفض الطلب بنجاح' };
        }

        // --- منطق القبول ---
        // أ- إنشاء المشروع
        const project = await this.projectModel.create(
          [
            {
              title: request.project_name,
              description: request.project_description,
              year: request.year,
              status: 'start',
              doctorId: request.doctorId,
              created_by: request.student_id,
              supervision_request_id: request._id,
            },
          ],
          { session },
        );

        const createdProject = project[0];

        // ب- التكنولوجيات
        if (request.technologies?.length) {
          const techData = request.technologies.map((t) => ({
            project_id: createdProject._id,
            tech_name: t,
          }));
          await this.projectTechnologyModel.insertMany(techData, { session });
        }

        // ج- الفريق
        const team = await this.teamModel.create(
          [
            {
              name: `Team ${request.project_name}`,
              code: `PRJ-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
              project_id: createdProject._id,
              doctorId: request.doctorId,
              lead_id: request.student_id,
            },
          ],
          { session },
        );

        const createdTeam = team[0];

        // د- نقل القائد (Leader)
        const leaderUser = await this.userModel
          .findById(request.student_id)
          .session(session);
        await this.teamMemberModel.create(
          [
            {
              team_id: createdTeam._id,
              user_id: request.student_id,
              role: 'Leader',
              isLeader: true,
              university_number: (leaderUser as any)?.universityCode,
              contact_email: (leaderUser as any)?.email,
            },
          ],
          { session },
        );

        // هـ- نقل الأعضاء
        const reqMembers = await this.requestMemberModel
          .find({ request_id: request._id })
          .session(session);
        if (reqMembers.length) {
          const membersData = await Promise.all(
            reqMembers.map(async (m) => {
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
            }),
          );
          await this.teamMemberModel.insertMany(membersData, { session });
        }

        // و- تحديث حالة الطلب
        request.status = 'approved';
        await request.save({ session });

        return {
          success: true,
          message: 'تم قبول المشروع بنجاح وإنشاء الفريق',
        };
      },
    );
  }

  async getRequestDetails(id: string, doctorId: Types.ObjectId) {
    const request = await this.supervisionRequestModel
      .findById(id)
      .populate(
        'student_id',
        'fullName email profileImage universityCode phoneNumber bio',
      )
      .populate('doctorId', 'fullName email profileImage')
      .populate('departmentId', 'departmentName');

    if (!request) {
      throw new NotFoundException('الطلب غير موجود');
    }
    if (request.doctorId._id.toString() !== doctorId.toString()) {
      throw new ForbiddenException('غير مسموح لك بعرض هذا الطلب');
    }
    // Get team members with full user details
    const members = await this.requestMemberModel.find({
      request_id: request._id,
    });
    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
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
      }),
    );

    return {
      ...request.toObject(),
      team_members: membersWithDetails,
    };
  }

  async getDoctorRequests(
    doctorId: string,
    filters: {
      departmentId?: string;
      year?: string;
      universityId?: string;
      status?: string; // إضافة الـ status هنا
    },
    page: number = 1,
    limit: number = 10,
  ) {
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('معرف الدكتور غير صالح');
    }

    // 1. بناء الفلتر الأساسي
    const query: any = {
      doctorId: new Types.ObjectId(doctorId),
    };

    // تعيين الحالة: لو مبعتش حاجة نستخدم pending كافتراضي، لو بعت نستخدم اللي بعته
    if (
      filters.status &&
      ['pending', 'approved', 'rejected'].includes(filters.status)
    ) {
      query.status = filters.status;
    } else {
      query.status = 'pending';
    }

    // فلتر السنة
    if (filters.year) {
      query.year = filters.year;
    }

    // 2. منطق فلاتر القسم والجامعة (بدون تكرار)
    if (filters.universityId && Types.ObjectId.isValid(filters.universityId)) {
      const departmentsInUniv = await this.departmentModel
        .find({ universityId: new Types.ObjectId(filters.universityId) })
        .select('_id')
        .lean();

      const deptIds = departmentsInUniv.map((d) => d._id.toString());

      if (
        filters.departmentId &&
        Types.ObjectId.isValid(filters.departmentId)
      ) {
        if (!deptIds.includes(filters.departmentId)) {
          query.departmentId = new Types.ObjectId();
        } else {
          query.departmentId = new Types.ObjectId(filters.departmentId);
        }
      } else {
        query.departmentId = {
          $in: deptIds.map((id) => new Types.ObjectId(id)),
        };
      }
    } else if (
      filters.departmentId &&
      Types.ObjectId.isValid(filters.departmentId)
    ) {
      query.departmentId = new Types.ObjectId(filters.departmentId);
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

    const formattedRequests = requests.map((request: any) => {
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
  async getrequestDetails(requestId: string) {
    if (!Types.ObjectId.isValid(requestId)) {
      throw new BadRequestException('معرف الطلب غير صالح');
    }

    const request = await this.supervisionRequestModel
      .findById(requestId)
      .populate(
        'student_id',
        'fullName profileImage email universityCode phoneNumber',
      )
      .populate({
        path: 'departmentId',
        select: 'departmentName universityId',
        populate: { path: 'universityId', select: 'name' },
      })
      .lean();

    if (!request) {
      throw new NotFoundException('الطلب غير موجود');
    }

    const req = request as any;

    // 1. جلب الأعضاء من سكيمة الـ Members
    const members = await this.requestMemberModel
      .find({ request_id: req._id })
      .lean();

    // 2. محاولة جلب صور الأعضاء من جدول اليوزر (عن طريق الإيميل)
    const teamWithImages = await Promise.all(
      members.map(async (m: any) => {
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
          profileImage: user?.profileImage || '', // الصورة من جدول اليوزر
        };
      }),
    );

    const dept = req.departmentId || {};
    const university = dept.universityId || {};

    return {
      success: true,
      data: {
        // نفس بيانات الـ getDoctorRequests
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

        // بيانات الفريق الإضافية (من السكيمة الجديدة)
        team: teamWithImages,
      },
    };
  }

  async getStudentRequests(studentId: Types.ObjectId) {
    const requests = await this.supervisionRequestModel
      .find({ student_id: studentId })
      .populate('doctorId', 'fullName email profileImage')
      .populate('departmentId', 'departmentName')
      .sort({ createdAt: -1 });

    return requests;
  }

  async getDoctorRequestStats(doctorId: string) {
    // 1. التحقق من صحة المعرف لتجنب أخطاء CastError

    if (!doctorId || !Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('معرف الدكتور غير صالح');
    }

    const dId = new Types.ObjectId(doctorId);

    // 2. الحصول على السنة الحالية ديناميكياً

    const currentYear = new Date().getFullYear().toString();

    // 3. تنفيذ جميع الاستعلامات في وقت واحد لتحسين الأداء

    const [
      totalRequests,

      approvedRequests,

      pendingRequests,

      currentYearRequests,
    ] = await Promise.all([
      // إجمالي الطلبات المقدمة لهذا الدكتور

      this.supervisionRequestModel.countDocuments({ doctorId: dId }),

      // الطلبات المقبولة فقط

      this.supervisionRequestModel.countDocuments({
        doctorId: dId,
        status: 'approved',
      }),

      // الطلبات التي لا تزال قيد الانتظار

      this.supervisionRequestModel.countDocuments({
        doctorId: dId,
        status: 'pending',
      }),

      // طلبات السنة الحالية فقط

      this.supervisionRequestModel.countDocuments({
        doctorId: dId,
        year: currentYear,
      }),
    ]);

    return {
      success: true,

      data: {
        totalRequests, // إجمالي الطلبات

        approvedRequests, // المقبولة

        pendingRequests, // المعلقة

        currentYearRequests, // طلبات سنة 2026 (أو السنة الحالية)

        year: currentYear, // السنة المحسوبة
      },
    };
  }
}
