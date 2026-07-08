import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorProfile } from './schema/doctor-specialization.schema';
import { User, UserRole } from 'src/user/schemas/user.schema';
import { UpdateDoctorProfileDto } from './dto/update-doctor-specialization.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  ERROR_MESSAGES,
  FILE_UPLOAD_CONFIG,
} from '../common/constants/file-upload.constants';
import { Team } from 'src/teams/schemas/team.schema';

@Injectable()
export class DoctorSpecializationService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>, // 👈 أضيفي هذا السطر
    @InjectModel(DoctorProfile.name)
    private doctorProfileModel: Model<DoctorProfile>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('معرف المستخدم غير صالح');
    }
  }

  async getDetailedDoctorStats(doctorId: string) {
    const doctorObjectId = new Types.ObjectId(doctorId);

    // 1. إجمالي الطلاب والطلاب النشطين
    // سنقوم بجلب كل الطلاب في فرق الدكتور ونفلترهم
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
          // حساب الطلاب النشطين (isVerified: true)
          activeStudents: {
            $sum: { $cond: [{ $eq: ['$studentInfo.isVerified', true] }, 1, 0] },
          },
        },
      },
    ]);

    // 2. إجمالي الفرق المختلفة (Total Teams)
    const totalTeams = await this.teamModel.countDocuments({
      doctorId: doctorObjectId,
    });

    // 3. المشاريع النشطة (Active Projects)
    // المشروع النشط هو الذي حالته 'start' أو 'in_progress'
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

  async getDoctorStats(doctorId: string) {
    const doctorObjectId = new Types.ObjectId(doctorId);

    // 1. إجمالي الفرق (Total Teams)
    const totalTeams = await this.teamModel.countDocuments({
      doctorId: doctorObjectId,
    });

    // 2. إجمالي الأعضاء (Total Students/Members)
    // بنحسب الطلاب الفريدين في كل الفرق اللي الدكتور ده بيشرف عليها
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

    // 3. الفرق النشطة (Active Teams)
    // بنعرفها من خلال حالة المشروع المرتبط (start أو in_progress)
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

    // 4. مشاريع منجزة (Completed Projects)
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
  // --- 1. عرض كل الطلاب التابعين للدكتور ---
  async getDoctorStudents(
    doctorId: string,
    filters: { departmentId?: string; universityId?: string },
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const doctorObjectId = new Types.ObjectId(doctorId);

    // البايب لاين الأساسي (قبل الباجنيشن)
    const basePipeline: any[] = [
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

    // إضافة فلاتر الربط (القسم والجامعة)
    if (filters.departmentId)
      basePipeline.push({
        $match: {
          'studentInfo.departmentId': new Types.ObjectId(filters.departmentId),
        },
      });
    if (filters.universityId)
      basePipeline.push({
        $match: {
          'studentInfo.universityId': new Types.ObjectId(filters.universityId),
        },
      });

    // --- خطوة حساب الإجمالي (Total) ---
    const countResult = await this.teamModel.aggregate([
      ...basePipeline,
      { $count: 'total' },
    ]);
    const total = countResult[0]?.total || 0;

    // --- إكمال البايب لاين للبيانات النهائية ---
    const dataPipeline = [
      ...basePipeline,
      // ربط المشاريع والأقسام للبيانات النهائية فقط
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

  // --- 2. عرض تفاصيل طالب محدد بالـ ID ---
  async getStudentDetailsForDoctor(studentId: string) {
    const student = await this.userModel.aggregate([
      // 1. تحديد الطالب
      { $match: { _id: new Types.ObjectId(studentId) } },

      // 2. البحث عن التيم اللي الطالب مشترك فيه (من جدول teammembers)
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

      // 3. ربط التيم عشان نوصل للـ project_id
      {
        $lookup: {
          from: 'teams',
          localField: 'teamMembership.team_id',
          foreignField: '_id',
          as: 'teamInfo',
        },
      },
      { $unwind: { path: '$teamInfo', preserveNullAndEmptyArrays: true } },

      // 4. ربط المشروع (Project) عشان نجيب الاسم والسنة
      {
        $lookup: {
          from: 'projects',
          localField: 'teamInfo.project_id',
          foreignField: '_id',
          as: 'projectInfo',
        },
      },
      { $unwind: { path: '$projectInfo', preserveNullAndEmptyArrays: true } },

      // 5. ربط القسم والجامعة
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

      // 6. التشكيل النهائي (مع إضافة بيانات المشروع)
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
          // بيانات المشروع المطلوبة
          projectId: { $ifNull: ['$projectInfo._id', 'N/A'] },
          projectName: { $ifNull: ['$projectInfo.title', 'N/A'] },
          projectYear: { $ifNull: ['$projectInfo.year', 'N/A'] },
        },
      },
    ]);

    if (!student[0]) throw new NotFoundException('Student not found');
    return { success: true, data: student[0] };
  }

  // دالة لجلب البيانات الكاملة
  async getDoctorProfile(userId: string) {
    this.validateObjectId(userId);

    const user = await this.userModel
      .findById(userId)
      .select(
        'fullName email phoneNumber profileImage bio universityCode role isDeleted',
      )
      .populate('departmentId', 'departmentName')
      .populate('universityId', 'name')
      .lean();

    if (!user || user.isDeleted)
      throw new NotFoundException('الدكتور غير موجود');
    if (user.role !== UserRole.DOCTOR)
      throw new ForbiddenException('هذا الحساب ليس دكتور');

    const profile = await this.doctorProfileModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .select('-__v -userId -_id') // يخفي الحاجات دي من النتيجة
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

  async updateDoctorProfile(
    userId: string,
    updateData: UpdateDoctorProfileDto,
    profileImage?: Express.Multer.File,
  ) {
    this.validateObjectId(userId);

    // 1. فصل البيانات
    const { fullName, phoneNumber, bio, ...doctorFields } = updateData;

    // 2. معالجة التخصصات (specialization) لضمان أنها مصفوفة
    const processedDoctorFields = { ...doctorFields };

    if (doctorFields.specialization) {
      if (typeof doctorFields.specialization === 'string') {
        try {
          processedDoctorFields.specialization = JSON.parse(
            doctorFields.specialization,
          );
        } catch {
          processedDoctorFields.specialization = [
            doctorFields.specialization,
          ] as any;
        }
      }
    }

    // 3. تحديث بيانات المستخدم الأساسية
    const userUpdates: any = {
      ...(fullName && { fullName }),
      ...(phoneNumber && { phoneNumber }),
      ...(bio && { bio }),
    };

    if (Object.keys(userUpdates).length > 0) {
      await this.userModel.findByIdAndUpdate(userId, { $set: userUpdates });
    }

    // 4. تحديث البيانات الأكاديمية (حل خطأ التخصصات هنا)
    if (Object.keys(processedDoctorFields).length > 0) {
      await this.doctorProfileModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: processedDoctorFields },
        { upsert: true, new: true },
      );
    }

    if (profileImage) {
      this.handleImageUploadAsync(userId, profileImage).catch((err) =>
        console.error('Background Image Upload Error:', err),
      );
    }

    const updatedProfile = await this.getDoctorProfile(userId);
    return {
      success: true,
      message: 'تم تحديث بيانات الدكتور بنجاح',
      data: updatedProfile.data,
    };
  }

  private async handleImageUploadAsync(
    userId: string, // غيرنا البارامتر الأول لـ userId
    newImage: Express.Multer.File,
  ): Promise<void> {
    // مفيش داعي نرجع string لأننا بنحدث الداتا هنا
    try {
      // 1. جلب بيانات المستخدم لمعرفة الصورة القديمة لمسحها
      const user = await this.userModel
        .findById(userId)
        .select('profileImage')
        .lean();

      // 2. مسح الصورة القديمة من Cloudinary لو موجودة
      if (user?.profileImage) {
        const publicId = this.cloudinaryService.extractPublicId(
          user.profileImage,
        );
        this.cloudinaryService
          .deleteImage(publicId)
          .catch((err) => console.error('Delete old image failed', err));
      }

      // 3. رفع الصورة الجديدة في الفولدر الصح
      const uploadResult = await this.cloudinaryService.uploadImage(
        newImage,
        FILE_UPLOAD_CONFIG.FOLDERS.USER_PROFILES, // هيتخزن في المكان اللي قلتِ عليه صح
      );

      if (uploadResult?.secure_url) {
        // 4. 🔥 الخطوة اللي كانت ناقصة: تحديث الداتابيز باللينك الجديد
        await this.userModel.findByIdAndUpdate(userId, {
          $set: { profileImage: uploadResult.secure_url },
        });
        console.log(
          `✅ Image updated successfully in DB: ${uploadResult.secure_url}`,
        );
      }
    } catch (error) {
      console.error(` Background upload failed for user ${userId}:`, error);
    }
  }
}
