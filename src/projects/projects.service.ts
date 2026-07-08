import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { Team, TeamDocument } from '../teams/schemas/team.schema';
import {
  TeamMember,
  TeamMemberDocument,
} from '../teams/schemas/team-member.schema';
import {
  ProjectFile,
  ProjectFileDocument,
} from './schemas/project-file.schema';
import {
  ProjectTechnology,
  ProjectTechnologyDocument,
} from './schemas/project-technology.schema';
import {
  SupervisionRequest,
  SupervisionRequestDocument,
} from '../supervision-requests/schemas/supervision-request.schema';
import {
  SupervisionRequestMember,
  SupervisionRequestMemberDocument,
} from '../supervision-requests/schemas/supervision-request-member.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
    @InjectModel(TeamMember.name)
    private readonly teamMemberModel: Model<TeamMemberDocument>,
    @InjectModel(ProjectFile.name)
    private readonly projectFileModel: Model<ProjectFileDocument>,
    @InjectModel(ProjectTechnology.name)
    private readonly projectTechnologyModel: Model<ProjectTechnologyDocument>,
    @InjectModel(SupervisionRequest.name)
    private readonly supervisionRequestModel: Model<SupervisionRequestDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ================= HELPER METHODS =================
  private async checkUserProjectAccess(
    userId: string,
    projectId: string,
  ): Promise<boolean> {
    const uid = new Types.ObjectId(userId);
    const pid = new Types.ObjectId(projectId);

    const proj = await this.projectModel.findOne({ _id: pid, created_by: uid });
    if (proj) return true;

    const team = await this.teamModel.findOne({ project_id: pid });
    if (team) {
      const member = await this.teamMemberModel.findOne({
        team_id: team._id,
        user_id: uid,
      });
      if (member) return true;
    }
    return false;
  }

  async updateProjectStatus(
    projectId: string,
    doctorId: string,
    updateStatusDto: UpdateProjectStatusDto,
  ) {
    // 1. التحقق من صحة المعرفات (ObjectIds)
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('معرف المشروع غير صالح');
    }

    // 2. البحث عن المشروع
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('المشروع غير موجود');
    }

    // 3. الأمان الفائق: التحقق من أن الدكتور الحالي هو المشرف على هذا المشروع فقط
    //  if (project.doctorId.toString() !== doctorId) {
    //  throw new ForbiddenException('غير مسموح لك بتحديث حالة مشروع لا تشرف عليه');
    //}

    // 4. تحديث الحالة وحفظ التعديل
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

  // ================= MAIN METHODS =================
  async getMyProject(studentId: string) {
    const sid = new Types.ObjectId(studentId);

    const student = await this.userModel
      .findById(sid)
      .populate('universityId', 'universityName location')
      .lean();

    if (!student) throw new NotFoundException('Student not found');

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

    let supReq: any = supReqs[0] || null;
    let proj: any = null;

    if (!supReq && tmember?.team_id) {
      const team = tmember.team_id as any;
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
      throw new NotFoundException('No approved supervision request found.');

    if (!proj) {
      proj = await this.projectModel
        .findOne({ supervision_request_id: supReq._id })
        .lean();
    }

    const doc = supReq.doctorId || {};
    const dept = supReq.departmentId || {};
    const uni = (student.universityId as any) || {};

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

    let teamMembersFormatted: any[] = [];
    if (team) {
      const members = await this.teamMemberModel
        .find({ team_id: team._id })
        .populate('user_id', 'fullName email phoneNumber profileImage bio')
        .lean();

      teamMembersFormatted = members.map((m: any) => ({
        memberId: m.user_id._id,
        memberFullName: m.user_id.fullName,
        memberEmail: m.user_id.email,
        memberBio: m.user_id.bio,
        memberPhone: m.user_id.phoneNumber,
        memberProfileImage: m.user_id.profileImage,
        memberRole: m.role,
        memberIsLeader:
          team.lead_id?._id?.toString() === m.user_id._id.toString(),
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
        technologies: techs.map((t: any) => t.tech_name),
        files: projFiles.map((f: any) => ({
          fileId: f._id,
          fileName: f.filename,
          filePath: f.filepath,
        })),
      },
    };
  }

  // ================= FILE UPLOAD METHODS =================

  async uploadProjectFileByToken(
    file: Express.Multer.File,
    userId: string,
    description?: string,
  ) {
    // 1. تحويل الـ ID والتأكد من صحته
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid User ID format');
    }
    const uid = new Types.ObjectId(userId);

    // 2. البحث عن الفريق (مع جلب الـ project_id مباشرة)
    const teamMember = await this.teamMemberModel
      .findOne({ user_id: uid })
      .lean();

    if (!teamMember) {
      throw new NotFoundException('عفواً، أنت لست عضواً في أي فريق حالياً');
    }

    // نجلب بيانات الفريق للتأكد من وجود مشروع
    const team = await this.teamModel.findById(teamMember.team_id).lean();

    if (!team || (!team.project_id && !(team as any).projectId)) {
      throw new NotFoundException(
        'لا يمكن رفع ملفات: لم يتم العثور على مشروع مرتبط بفريقك.',
      );
    }

    // دعم التسميتين (Snake Case & Camel Case)
    const projectId = team.project_id || (team as any).projectId;

    // 3. استدعاء دالة المعالجة مع الـ await (مؤقتاً) لكشف الخطأ فوراً
    try {
      const savedDoc = await this.handleFileFieldsUploadAsync(
        projectId.toString(),
        uid.toString(),
        file,
        description,
      );

      return {
        success: true,
        message: 'تم رفع وحفظ الملف بنجاح',
        data: {
          fileId: savedDoc._id,
          url: savedDoc.filepath,
        },
      };
    } catch (error) {
      // في حالة الفشل، الـ API هيرد بالسبب الحقيقي
      throw new BadRequestException(`فشل الرفع: ${error.message}`);
    }
  }

  private async handleFileFieldsUploadAsync(
    projectId: string,
    userId: string,
    file: Express.Multer.File,
    description?: string,
  ) {
    try {
      console.log('--- [Step 1] بدأت عملية الرفع للمشروع:', projectId);

      const folder = `project-documents/${projectId}`;

      // الرفع لـ Cloudinary
      const uploadedFile = await this.cloudinaryService.uploadFile(
        file,
        folder,
      );

      if (!uploadedFile || !uploadedFile.secure_url) {
        throw new Error('Cloudinary response missing secure_url');
      }

      console.log(
        '--- [Step 2] تم الرفع لكلاوديناري. الرابط:',
        uploadedFile.secure_url,
      );

      // تجهيز البيانات للحفظ
      const fileData = {
        project_id: new Types.ObjectId(projectId),
        uploaded_by: new Types.ObjectId(userId),
        filename: file.originalname,
        filepath: uploadedFile.secure_url,
        file_type: file.mimetype,
        size: file.size,
        cloudinary_id: uploadedFile.public_id,
        description: description || '',
      };

      console.log('--- [Step 3] محاولة الحفظ في المونجو بالبيانات:', fileData);

      // الحفظ الفعلي
      const newFile = await this.projectFileModel.create(fileData);

      console.log('--- [Step 4] تم الحفظ بنجاح! ID المستند:', newFile._id);
      return newFile;
    } catch (error) {
      // طباعة تفصيلية لأي ValidationError من المونجوس
      console.error('--- [ERROR] فشل في handleFileFieldsUploadAsync:');
      if (error.name === 'ValidationError') {
        console.error(
          'تفاصيل خطأ الـ Schema:',
          Object.keys(error.errors).map(
            (key) => `${key}: ${error.errors[key].message}`,
          ),
        );
      } else {
        console.error(error);
      }
      throw error;
    }
  }
  async deleteProjectFile(fileId: string, userId: string) {
    const file: any = await this.projectFileModel.findById(fileId).lean();
    if (!file) throw new NotFoundException('File not found');

    const access = await this.checkUserProjectAccess(
      userId,
      file.project_id.toString(),
    );
    if (!access) throw new ForbiddenException('No permission to delete files');

    if (file.cloudinary_public_id) {
      await this.cloudinaryService.deleteFile(file.cloudinary_public_id, 'raw');
    }

    await this.projectFileModel.findByIdAndDelete(fileId);
    return { success: true, message: 'File deleted successfully' };
  }

  // ================= IMAGE UPLOAD METHODS =================

  async updateProjectByToken(
    userId: string,
    updateData: any,
    file?: Express.Multer.File,
  ) {
    const uid = new Types.ObjectId(userId);

    // 1. العثور على المشروع المرتبط بالمستخدم
    const teamMember = await this.teamMemberModel
      .findOne({ user_id: uid })
      .lean();
    if (!teamMember) throw new NotFoundException('أنت لست عضواً في فريق.');

    const team = await this.teamModel.findById(teamMember.team_id).lean();
    if (!team || !team.project_id)
      throw new NotFoundException('لا يوجد مشروع مرتبط بهذا الفريق.');

    const pid = team.project_id;

    // 2. تحديث البيانات النصية
    const updatePayload: any = {};
    if (updateData.description)
      updatePayload.description = updateData.description;
    if (updateData.project_type)
      updatePayload.project_type = updateData.project_type;
    if (updateData.projectLink)
      updatePayload.projectLink = updateData.projectLink;
    if (updateData.main_objectives)
      updatePayload.main_objectives = updateData.main_objectives;

    await this.projectModel.findByIdAndUpdate(pid, { $set: updatePayload });

    // 3. تحديث التقنيات (دعم الـ Array والـ String معاً للأمان)
    // 3. تحديث التقنيات
    if (updateData.technologies) {
      let techArray: string[] = [];

      try {
        // لو الـ Array مبعوت كـ String من الـ FormData (مثلاً: '["React", "Node"]')
        if (
          typeof updateData.technologies === 'string' &&
          updateData.technologies.startsWith('[')
        ) {
          techArray = JSON.parse(updateData.technologies);
        }
        // لو مبعوت كـ Array صريح
        else if (Array.isArray(updateData.technologies)) {
          techArray = updateData.technologies;
        }
        // لو مبعوت كـ String عادي مفصول بفواصل
        else if (typeof updateData.technologies === 'string') {
          techArray = updateData.technologies.split(',').map((t) => t.trim());
        }
      } catch (e) {
        // لو حصل خطأ في الـ Parse خده كـ String عادي
        techArray = [updateData.technologies.toString()];
      }

      // تنظيف الـ Array من أي فراغات أو عناصر فاضية
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

    // 4. معالجة الصورة في الخلفية
    if (file) {
      const currentProject = await this.projectModel
        .findById(pid)
        .select('projectImage')
        .lean();
      this.handleProjectImageUploadAsync(
        pid.toString(),
        currentProject?.projectImage,
        file,
      ).catch((error) =>
        console.error('Background Image Upload Error:', error),
      );
    }

    return {
      success: true,
      message: 'تم تحديث بيانات المشروع بنجاح.',
    };
  }

  private async handleProjectImageUploadAsync(
    projectId: string,
    oldImageUrl: string | undefined,
    newImage: Express.Multer.File,
  ) {
    try {
      if (oldImageUrl) {
        const publicId = this.cloudinaryService.extractPublicId(oldImageUrl);
        if (publicId) await this.cloudinaryService.deleteImage(publicId);
      }

      const uploadResult = await this.cloudinaryService.uploadImage(
        newImage,
        'projects-images',
      );

      await this.projectModel
        .updateOne(
          { _id: new Types.ObjectId(projectId) },
          { $set: { projectImage: uploadResult.secure_url } },
        )
        .exec();
    } catch (error) {
      console.error(`[Error] Project image background upload failed:`, error);
    }
  }

  async deleteProjectImageByToken(userId: string) {
    const uid = new Types.ObjectId(userId);

    // 1. البحث عن المشروع المرتبط بالمستخدم
    const teamMember = await this.teamMemberModel
      .findOne({ user_id: uid })
      .populate({ path: 'team_id', select: 'project_id' })
      .lean();

    const team = teamMember?.team_id as any;
    if (!team || !team.project_id) {
      throw new NotFoundException('لم يتم العثور على مشروع لهذا الطالب.');
    }

    const pid = team.project_id;

    // 2. جلب بيانات المشروع للتأكد من وجود صورة
    const project = await this.projectModel
      .findById(pid)
      .select('projectImage')
      .lean();
    if (!project || !project.projectImage) {
      throw new BadRequestException('لا توجد صورة لهذا المشروع لحذفها.');
    }

    // 3. حذف الصورة من Cloudinary
    const publicId = this.cloudinaryService.extractPublicId(
      project.projectImage,
    );
    if (publicId) {
      try {
        await this.cloudinaryService.deleteImage(publicId);
      } catch (error) {
        console.error('Cloudinary Delete Error:', error);
        // نكمل العملية حتى لو فشل الحذف من السحابة لضمان تنظيف الداتابيز
      }
    }

    // 4. تحديث قاعدة البيانات بوضع القيمة null أو سلسلة فارغة
    await this.projectModel.updateOne(
      { _id: pid },
      { $unset: { projectImage: '' } }, // أو { $set: { projectImage: null } }
    );

    return {
      success: true,
      message: 'تم حذف صورة المشروع بنجاح',
    };
  }

  async getAllCompletedProjects(queryDto: any) {
    const {
      page = 1,
      limit = 10,
      search,
      year,
      status,
      doctorEmail,
      projectType,
      technologies,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (page - 1) * limit;
    const currentYear = new Date().getFullYear().toString();
    // --- 1. حساب الإحصائيات العامة (Stats) ---
    const [totalCount, completedCount, currentYearCount, uniqueTypes] =
      await Promise.all([
        this.projectModel.countDocuments({
          status: { $in: ['start', 'completed'] },
        }),
        this.projectModel.countDocuments({ status: 'completed' }),
        this.projectModel.countDocuments({ year: currentYear }),
        this.projectModel.distinct('project_type'),
      ]);

    // --- 2. جلب ID الدكتور للفلاتر ---
    let doctorIdFilter: any = null;
    if (doctorEmail) {
      const doctorUser = await this.userModel
        .findOne({ email: doctorEmail, role: 'doctor' })
        .lean();
      if (doctorUser) doctorIdFilter = doctorUser._id;
      else
        return {
          success: true,
          stats: { totalProjects: totalCount },
          meta: { total: 0 },
          data: [],
        };
    }

    // --- 3. بناء الفلاتر ---
    const matchConditions: any[] = [
      { status: status ? status : { $in: ['completed', 'start'] } },
    ];
    if (doctorIdFilter) matchConditions.push({ doctorId: doctorIdFilter });
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

    // --- 4. الـ Pipeline الخاص بـ Aggregation ---
    const pipeline: any[] = [
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

    // --- 5. التنفيذ ---
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

    // --- 6. تنسيق البيانات (تطابق تام مع getMyProject) ---
    const finalData = await Promise.all(
      projects.map(async (proj: any) => {
        // جلب البيانات العميقة المفقودة في الـ aggregate
        const fullPopulated: any = await this.projectModel
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

        // تنسيق الأعضاء (نفس الهيكل المطلب)
        const membersFormatted = await Promise.all(
          (proj.members || []).map(async (m: any) => {
            const u = (await this.userModel
              .findById(m.user_id)
              .select('fullName email phoneNumber profileImage bio')
              .lean()) as any;
            return {
              memberId: u?._id,
              memberFullName: u?.fullName,
              memberEmail: u?.email,
              memberBio: u?.bio,
              memberPhone: u?.phoneNumber,
              memberProfileImage: u?.profileImage,
              memberRole: m.role,
              memberIsLeader:
                proj.teamDoc?.lead_id?.toString() === u?._id?.toString(),
            };
          }),
        );

        const files = await this.projectFileModel
          .find({ project_id: proj._id })
          .lean();

        return {
          projectId: proj._id,
          projectTitle: fullPopulated?.title || supReq.project_name,
          projectDescription:
            fullPopulated?.description || supReq.project_description,
          projectYear: fullPopulated?.year || supReq.year,
          projectStatus: fullPopulated?.status || supReq.status,
          projectLink: fullPopulated?.projectLink || null,
          projectImage: fullPopulated?.projectImage || null,
          projectType: fullPopulated?.project_type || supReq.project_type,
          projectMainObjectives:
            fullPopulated?.main_objectives || supReq.main_objectives,

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

          technologies: (proj.techDocs || []).map((t: any) => t.tech_name),
          files: files.map((f: any) => ({
            fileId: f._id,
            fileName: f.filename,
            filePath: f.filepath,
          })),
        };
      }),
    );

    return {
      success: true,
      message: 'Projects retrieved successfully',
      stats: {
        totalProjects: totalCount, // ربط الاسم المطلوب بالمتغير المعرف فوق
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

  async getProjectById(projectId: string) {
    const pId = new Types.ObjectId(projectId);

    // 1. جلب بيانات المشروع الأساسية
    const fullPopulated: any = await this.projectModel
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

    if (!fullPopulated) throw new NotFoundException('المشروع غير موجود');

    // 2. جلب البيانات المرتبطة (تقنيات، فريق، ملفات)
    const [techDocs, teamDoc, files] = await Promise.all([
      this.projectTechnologyModel.find({ project_id: pId }).lean(),
      this.teamModel.findOne({ project_id: pId }).lean(),
      this.projectFileModel.find({ project_id: pId }).lean(),
    ]);

    // محاولة البحث بـ projectId لو الـ project_id مرجعش نتيجة
    let finalTeamDoc = teamDoc;
    if (!finalTeamDoc) {
      finalTeamDoc = await this.teamModel.findOne({ projectId: pId }).lean();
    }

    let membersFormatted: any[] = [];

    // 3. الجزء اللي كان ناقص: جلب وتنسيق الأعضاء
    if (finalTeamDoc && finalTeamDoc._id) {
      const teamObjectId = new Types.ObjectId(finalTeamDoc._id.toString());

      // جلب الأعضاء من جدول teammembers
      const members = await this.teamMemberModel
        .find({ team_id: teamObjectId })
        .lean();

      if (members && members.length > 0) {
        // عمل loop لجلب بيانات كل مستخدم (User) لكل عضو
        membersFormatted = await Promise.all(
          members.map(async (m: any) => {
            const u = (await this.userModel
              .findById(m.user_id)
              .select('fullName email phoneNumber profileImage bio')
              .lean()) as any;

            return {
              memberId: u?._id,
              memberFullName: u?.fullName,
              memberEmail: u?.email,
              memberBio: u?.bio || 'This user has not added a bio yet',
              memberPhone: u?.phoneNumber,
              memberProfileImage: u?.profileImage,
              memberRole: m.role,
              memberIsLeader:
                finalTeamDoc.lead_id?.toString() === u?._id?.toString(),
            };
          }),
        );
      }
    }

    const supReq = fullPopulated?.supervision_request_id || {};
    const doctor = fullPopulated?.doctorId || {};
    const department = supReq.departmentId || {};
    const university = supReq.student_id?.universityId || {};

    // 4. بناء الرد النهائي
    return {
      success: true,
      data: {
        projectId: fullPopulated._id,
        projectTitle: fullPopulated.title || supReq.project_name,
        projectDescription:
          fullPopulated.description || supReq.project_description,
        projectYear: fullPopulated.year || supReq.year,
        projectStatus: fullPopulated.status,
        projectLink: fullPopulated.projectLink || null,
        projectImage: fullPopulated.projectImage || null,
        projectType: fullPopulated.project_type || supReq.project_type,
        projectMainObjectives:
          fullPopulated.main_objectives || supReq.main_objectives,

        doctorFullName: doctor.fullName || null,
        doctorEmail: doctor.email || null,
        doctorPhone: doctor.phoneNumber || null,
        doctorImage: doctor.profileImage || null,
        doctorBio: doctor.bio || null,

        departmentName: department.departmentName || null,
        universityName: university.universityName || null,

        teamName: finalTeamDoc?.name || null,
        teamCode: finalTeamDoc?.code || null,
        teamMembers: membersFormatted, // الآن سيظهر الأعضاء هنا

        technologies: techDocs.map((t: any) => t.tech_name),
        files: files.map((f: any) => ({
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

    // تنفيذ العمليات في وقت واحد لسرعة الاستجابة
    const [totalCount, completedCount, currentYearCount, uniqueTypes] =
      await Promise.all([
        this.projectModel.countDocuments({
          status: { $in: ['start', 'completed'] },
        }),
        this.projectModel.countDocuments({ status: 'completed' }),
        this.projectModel.countDocuments({ year: currentYear }),
        this.projectModel.distinct('project_type'),
      ]);

    return {
      // نرجع البيانات مباشرة، والـ Interceptor سيقوم بتغليفها
      totalProjects: totalCount,
      completedProjects: completedCount,
      currentYearProjects: currentYearCount,
    };
  }

  ////////////// doctor ////////////////////
  async getDoctorDashboardStats(doctorId: string) {
    if (!doctorId || !Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('معرف الدكتور المبعوث غير صالح أو مفقود');
    }

    // 2. الآن نقوم بالتحويل بأمان
    const dId = new Types.ObjectId(doctorId);

    // 1. جعل السنة ديناميكية (تتغير تلقائياً كل سنة)
    const currentYear = new Date().getFullYear().toString();

    const [
      totalProjects,
      completedProjects,
      pendingRequests,
      totalTeams,
      featuredProjectsCount, // المشاريع المميزة (status: start)
      currentYearProjectsCount,
    ] = await Promise.all([
      // 1. إجمالي المشاريع (كل الحالات النشطة والمكتملة)
      this.projectModel.countDocuments({
        doctorId: dId,
        status: { $in: ['in_progress', 'completed', 'start'] },
      }),

      // 2. المشاريع المكتملة فقط
      this.projectModel.countDocuments({
        doctorId: dId,
        status: 'completed',
      }),

      // 3. الطلبات قيد الانتظار (من جدول طلبات الإشراف)
      this.supervisionRequestModel.countDocuments({
        doctorId: dId,
        status: 'pending',
      }),

      // 4. عدد الفرق المرتبطة بالدكتور
      this.teamModel.countDocuments({
        doctorId: dId,
      }),

      // 5. عد المشاريع المميزة (بناءً على الحالة 'start' كما في الوثيقة المرسلة)
      this.projectModel.countDocuments({
        doctorId: dId,
        status: 'start',
      }),

      // 6. عدد مشاريع السنة الحالية (تلقائياً حسب السنة الحالية)
      this.projectModel.countDocuments({
        doctorId: dId,
        year: currentYear,
      }),
    ]);

    return {
      success: true,
      stats: {
        totalProjects, // إجمالي المشاريع
        pendingActions: pendingRequests, // طلبات تنتظر الموافقة
        completedProjects, // المشاريع المنتهية
        totalTeams, // عدد الفرق
        featuredProjects: featuredProjectsCount, // المشاريع المميزة (التي حالتها start)
        currentYearProjects: currentYearProjectsCount, // مشاريع سنة 2026 (أو السنة الحالية)
        year: currentYear, // إرجاع السنة للتأكد في الفرونت إند
      },
    };
  }

  // ///// فيه كل حاجه
  // async getDoctorProjectsWithStats(doctorId: string, queryDto: any) {
  //   const dId = new Types.ObjectId(doctorId);
  //   const {
  //     page = 1,
  //     limit = 10,
  //     search,
  //     year,
  //     status,
  //     projectType,
  //     technologies,
  //     departmentId, // 1. إضافة القسم للـ DTO
  //     sortBy = 'createdAt',
  //     sortOrder = 'desc',
  //   } = queryDto;

  //   const skip = (page - 1) * limit;
  //   const currentYear = new Date().getFullYear().toString();

  //   // --- 1. الإحصائيات (تظل كما هي) ---
  //   const [totalCount, completedCount, currentYearCount] = await Promise.all([
  //     this.projectModel.countDocuments({ doctorId: dId }),
  //     this.projectModel.countDocuments({ doctorId: dId, status: { $in: ['completed', 'start'] } }),
  //     this.projectModel.countDocuments({ doctorId: dId, year: currentYear }),
  //   ]);

  //   // --- 2. بناء فلاتر البحث والفلترة ---
  //   const matchConditions: any[] = [{ doctorId: dId }];

  //   if (status) {
  //     matchConditions.push({ status });
  //   }
  //   if (projectType) {
  //     matchConditions.push({ $or: [{ project_type: projectType }, { 'supReq.project_type': projectType }] });
  //   }
  //   if (year) {
  //     matchConditions.push({ $or: [{ year: year }, { 'supReq.year': year }] });
  //   }
  //   // 2. إضافة فلترة القسم
  //   if (departmentId) {
  //     matchConditions.push({ 'supReq.departmentId': new Types.ObjectId(departmentId) });
  //   }

  //   if (technologies) {
  //     const techArray = technologies.split(',').map(t => t.trim());
  //     matchConditions.push({ 'techDocs.tech_name': { $in: techArray } });
  //   }
  //   if (search) {
  //     matchConditions.push({
  //       $or: [
  //         { title: { $regex: search, $options: 'i' } },
  //         { 'supReq.project_name': { $regex: search, $options: 'i' } },
  //         { 'memberUsers.fullName': { $regex: search, $options: 'i' } }
  //       ]
  //     });
  //   }

  //   // --- 3. الـ Pipeline الخاص بالبيانات ---
  //   const pipeline: any[] = [
  //     { $lookup: { from: 'supervisionrequests', localField: 'supervision_request_id', foreignField: '_id', as: 'supReq' } },
  //     { $unwind: { path: '$supReq', preserveNullAndEmptyArrays: true } },
  //     // ملاحظة: الـ Match يجب أن يكون بعد الـ lookup والـ unwind الخاص بـ supReq ليتمكن من رؤية الـ departmentId
  //     { $lookup: { from: 'projecttechnologies', localField: '_id', foreignField: 'project_id', as: 'techDocs' } },
  //     { $lookup: { from: 'teams', localField: '_id', foreignField: 'project_id', as: 'teamDoc' } },
  //     { $unwind: { path: '$teamDoc', preserveNullAndEmptyArrays: true } },
  //     { $lookup: { from: 'teammembers', localField: 'teamDoc._id', foreignField: 'team_id', as: 'members' } },
  //     { $lookup: { from: 'users', localField: 'members.user_id', foreignField: '_id', as: 'memberUsers' } },
  //     { $match: { $and: matchConditions } }
  //   ];

  //   // --- 4. التنفيذ والنتائج (تظل كما هي) ---
  //   const totalResults = await this.projectModel.aggregate([...pipeline, { $count: 'count' }]);
  //   const totalFiltered = totalResults[0]?.count || 0;

  //   const projects = await this.projectModel.aggregate([
  //     ...pipeline,
  //     { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
  //     { $skip: skip },
  //     { $limit: Number(limit) }
  //   ]);

  //   // --- 5. تنسيق البيانات النهائي ---
  //   const finalData = await Promise.all(projects.map(async (proj: any) => {
  //     // استخدمنا الـ fullPopulated لجلب بيانات الـ Nested Objects بشكل Flat في الخطوة الأخيرة
  //     const fullPopulated: any = await this.projectModel.findById(proj._id)
  //       .populate('doctorId', 'fullName email phoneNumber profileImage bio')
  //       .populate({
  //         path: 'supervision_request_id',
  //         populate: [
  //           { path: 'departmentId', select: 'departmentName' },
  //           { path: 'student_id', populate: { path: 'universityId', select: 'universityName' } }
  //         ]
  //       })
  //       .lean();

  //     const supReq = fullPopulated?.supervision_request_id || {};
  //     const doctor = fullPopulated?.doctorId || {};
  //     const department = supReq.departmentId || {};
  //     const university = supReq.student_id?.universityId || {};

  //     const membersFormatted = await Promise.all((proj.members || []).map(async (m: any) => {
  //       const u = await this.userModel.findById(m.user_id).select('fullName email phoneNumber profileImage bio').lean() as any;
  //       return {
  //         memberId: u?._id,
  //         memberFullName: u?.fullName,
  //         memberEmail: u?.email,
  //         memberBio: u?.bio,
  //         memberPhone: u?.phoneNumber,
  //         memberProfileImage: u?.profileImage,
  //         memberRole: m.role,
  //         memberIsLeader: proj.teamDoc?.lead_id?.toString() === u?._id?.toString()
  //       };
  //     }));

  //     const files = await this.projectFileModel.find({ project_id: proj._id }).lean();

  //     return {
  //       projectId: proj._id,
  //       projectTitle: fullPopulated?.title || supReq.project_name,
  //       projectDescription: fullPopulated?.description || supReq.project_description,
  //       projectYear: fullPopulated?.year || supReq.year,
  //       projectStatus: fullPopulated?.status,
  //       projectLink: fullPopulated?.projectLink || null,
  //       projectImage: fullPopulated?.projectImage || null,
  //       projectType: fullPopulated?.project_type || supReq.project_type,
  //       projectMainObjectives: fullPopulated?.main_objectives || supReq.main_objectives,
  //       doctorFullName: doctor.fullName,
  //       doctorEmail: doctor.email,
  //       doctorPhone: doctor.phoneNumber,
  //       doctorImage: doctor.profileImage,
  //       doctorBio: doctor.bio,
  //       departmentId: department._id,
  //       departmentName: department.departmentName,
  //       universityId: university._id,
  //       universityName: university.universityName,
  //       teamName: proj.teamDoc?.name || null,
  //       teamCode: proj.teamDoc?.code || null,
  //       teamMembers: membersFormatted,
  //       technologies: (proj.techDocs || []).map((t: any) => t.tech_name),
  //       files: files.map((f: any) => ({ fileId: f._id, fileName: f.filename, filePath: f.filepath }))
  //     };
  //   }));

  //   return {
  //     success: true,
  //     message: "Projects retrieved successfully",
  //     meta: {
  //       totalItems: totalFiltered,
  //       totalPages: Math.ceil(totalFiltered / limit),
  //       currentPage: Number(page)
  //     },
  //     data: finalData
  //   };
  // }

  async getDoctorProjectsWithStats(doctorId: string, queryDto: any) {
    const dId = new Types.ObjectId(doctorId);
    const {
      page = 1,
      limit = 10,
      search,
      year,
      status,
      projectType,
      technologies,
      departmentId, // 1. إضافة القسم للـ DTO
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const skip = (page - 1) * limit;
    const currentYear = new Date().getFullYear().toString();

    // --- 1. الإحصائيات (تظل كما هي) ---
    const [totalCount, completedCount, currentYearCount] = await Promise.all([
      this.projectModel.countDocuments({ doctorId: dId }),
      this.projectModel.countDocuments({
        doctorId: dId,
        status: { $in: ['completed', 'start'] },
      }),
      this.projectModel.countDocuments({ doctorId: dId, year: currentYear }),
    ]);

    // --- 2. بناء فلاتر البحث والفلترة ---
    const matchConditions: any[] = [{ doctorId: dId }];

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
    // 2. إضافة فلترة القسم
    if (departmentId) {
      matchConditions.push({
        'supReq.departmentId': new Types.ObjectId(departmentId),
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

    // --- 3. الـ Pipeline الخاص بالبيانات ---
    const pipeline: any[] = [
      {
        $lookup: {
          from: 'supervisionrequests',
          localField: 'supervision_request_id',
          foreignField: '_id',
          as: 'supReq',
        },
      },
      { $unwind: { path: '$supReq', preserveNullAndEmptyArrays: true } },
      // ملاحظة: الـ Match يجب أن يكون بعد الـ lookup والـ unwind الخاص بـ supReq ليتمكن من رؤية الـ departmentId
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

    // --- 4. التنفيذ والنتائج (تظل كما هي) ---
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

    // --- 5. تنسيق البيانات النهائي ---
    const finalData = await Promise.all(
      projects.map(async (proj: any) => {
        // استخدمنا الـ fullPopulated لجلب بيانات الـ Nested Objects بشكل Flat في الخطوة الأخيرة
        const fullPopulated: any = await this.projectModel
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

        const membersFormatted = await Promise.all(
          (proj.members || []).map(async (m: any) => {
            const u = (await this.userModel
              .findById(m.user_id)
              .select('fullName email phoneNumber profileImage bio')
              .lean()) as any;
            return {
              memberId: u?._id,
              memberFullName: u?.fullName,
              memberEmail: u?.email,
              memberBio: u?.bio,
              memberPhone: u?.phoneNumber,
              memberProfileImage: u?.profileImage,
              memberRole: m.role,
              memberIsLeader:
                proj.teamDoc?.lead_id?.toString() === u?._id?.toString(),
            };
          }),
        );

        const files = await this.projectFileModel
          .find({ project_id: proj._id })
          .lean();

        return {
          projectId: proj._id,
          projectTitle: fullPopulated?.title || supReq.project_name,
          projectDescription:
            fullPopulated?.description || supReq.project_description,
          projectYear: fullPopulated?.year || supReq.year,
          projectStatus: fullPopulated?.status,
          projectImage: fullPopulated?.projectImage || null,
          projectType: fullPopulated?.project_type || supReq.project_type,
          departmentId: department._id,
          departmentName: department.departmentName,
          universityId: university._id,
          universityName: university.universityName,
          technologies: (proj.techDocs || []).map((t: any) => t.tech_name),
        };
      }),
    );

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

  async getProjectDetailsForDoctor(projectId: string, doctorId: string) {
    // 1. التحقق من صحة الـ IDs
    if (
      !Types.ObjectId.isValid(projectId) ||
      !Types.ObjectId.isValid(doctorId)
    ) {
      throw new BadRequestException('معرف المشروع أو الدكتور غير صالح');
    }

    const pId = new Types.ObjectId(projectId);
    const dId = new Types.ObjectId(doctorId);

    // 2. جلب المشروع والتأكد من ملكيته للدكتور مع كل البيانات المرتبطة
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
      .lean()) as any;

    if (!project) {
      throw new NotFoundException(
        'المشروع غير موجود أو ليس لديك صلاحية للوصول إليه',
      );
    }

    // 3. جلب الفريق والملفات والتقنيات بالتوازي
    const [team, technologies, files] = await Promise.all([
      this.teamModel.findOne({ project_id: pId }).lean(),
      this.projectTechnologyModel.find({ project_id: pId }).lean(),
      this.projectFileModel.find({ project_id: pId }).lean(),
    ]);

    // 4. تنسيق أعضاء الفريق
    let teamMembersFormatted: any[] = [];
    if (team) {
      const members = await this.teamMemberModel
        .find({ team_id: team._id })
        .populate('user_id', 'fullName email profileImage phoneNumber bio')
        .lean();

      teamMembersFormatted = members.map((m: any) => ({
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

    // 5. استخراج البيانات الفرعية لعمل الـ Flat Object
    const supReq = project.supervision_request_id || {};
    const doctor = project.doctorId || {};
    const department = supReq.departmentId || {};
    const university = supReq.student_id?.universityId || {};

    // 6. بناء الرد النهائي بنفس المسميات المطلوبة
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
          projectMainObjectives:
            project.main_objectives || supReq.main_objectives || project.title,

          // بيانات الدكتور
          doctorFullName: doctor.fullName,
          doctorEmail: doctor.email,
          doctorPhone: doctor.phoneNumber,
          doctorImage: doctor.profileImage,
          doctorBio: doctor.bio,

          // القسم والجامعة
          departmentId: department._id,
          departmentName: department.departmentName,
          universityId: university._id,
          universityName: university.universityName,

          // الفريق
          teamName: team?.name || project.title, // لو مفيش اسم فريق بنحط اسم المشروع زي المثال
          teamCode: team?.code || null,
          teamMembers: teamMembersFormatted,

          // التقنيات والملفات
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
}
