import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Team, TeamDocument } from './schemas/team.schema';
import { TeamMember, TeamMemberDocument } from './schemas/team-member.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class TeamsService {
  constructor(
    @InjectModel(Team.name) private teamModel: Model<TeamDocument>,
    @InjectModel(TeamMember.name)
    private teamMemberModel: Model<TeamMemberDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  private async generateUniqueCode(): Promise<string> {
    let code = '';
    let exists = true;

    while (exists) {
      code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existing = await this.teamModel.findOne({ code });
      exists = !!existing;
    }

    return code;
  }

  async createTeam(
    name: string,
    projectId: Types.ObjectId,
    doctorId: Types.ObjectId,
    leadId: Types.ObjectId,
    members: Array<{
      userId: Types.ObjectId;
      role: string;
      universityNumber: string;
      contactEmail: string;
    }>,
  ) {
    // Generate unique code
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

  async isUserInAnyTeam(userId: Types.ObjectId): Promise<boolean> {
    const member = await this.teamMemberModel.findOne({ user_id: userId });
    return !!member;
  }

  async getMyTeamDetails(userId: string) {
    const uid = new Types.ObjectId(userId);

    // 1. البحث عن انتماء المستخدم لأي فريق
    const memberRecord = await this.teamMemberModel
      .findOne({ user_id: uid })
      .lean();

    if (!memberRecord) {
      throw new NotFoundException('أنت لست عضواً في أي فريق حالياً');
    }

    // 2. جلب تفاصيل الفريق والدكتور المسؤول
    const team = await this.teamModel
      .findById(memberRecord.team_id)
      .populate('doctorId', 'fullName email phoneNumber profileImage bio')
      .lean();

    if (!team) {
      throw new NotFoundException('لم يتم العثور على بيانات الفريق');
    }

    // 3. جلب كل أعضاء الفريق وتنسيق بياناتهم
    const allMembers = await this.teamMemberModel
      .find({ team_id: team._id })
      .populate('user_id', 'fullName email phoneNumber profileImage bio')
      .lean();

    const teamMembersFormatted = allMembers.map((m: any) => ({
      memberId: m.user_id._id,
      memberFullName: m.user_id.fullName,
      memberEmail: m.user_id.email,
      memberBio: m.user_id.bio,
      memberPhone: m.user_id.phoneNumber,
      memberProfileImage: m.user_id.profileImage,
      memberRole: m.role,
      memberIsLeader: team.lead_id.toString() === m.user_id._id.toString(),
    }));

    const doctor = team.doctorId as any;

    // 4. الرد النهائي المسطح
    return {
      success: true,
      data: {
        // بيانات الفريق الأساسية
        teamId: team._id,
        teamName: team.name,
        teamCode: team.code,
        projectId: team.project_id,

        // بيانات الدكتور
        doctorFullName: doctor?.fullName || null,
        doctorEmail: doctor?.email || null,
        doctorPhone: doctor?.phoneNumber || null,
        doctorImage: doctor?.profileImage || null,
        doctorBio: doctor?.bio || null,

        // قائمة الأعضاء
        teamMembers: teamMembersFormatted,
      },
    };
  }

  async getDoctorTeams(
    doctorId: string,
    filters: {
      departmentId?: string;
      universityId?: string;
      projectStatus?: string;
      year?: string; // 👈 ضيفي الـ year هنا
    },
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const doctorObjectId = new Types.ObjectId(doctorId);

    const pipeline: any[] = [
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

      // ... باقي الـ lookups للـ supervisionrequests والـ departments والـ universities كما هي ...
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

    // --- تصفية (Filters) ---
    if (filters.projectStatus) {
      pipeline.push({ $match: { 'project.status': filters.projectStatus } });
    }
    // 👇 فلترة السنة هنا
    if (filters.year) {
      pipeline.push({ $match: { 'project.year': filters.year } });
    }
    if (filters.departmentId) {
      pipeline.push({
        $match: { 'deptInfo._id': new Types.ObjectId(filters.departmentId) },
      });
    }
    if (filters.universityId) {
      pipeline.push({
        $match: { 'uniInfo._id': new Types.ObjectId(filters.universityId) },
      });
    }

    // حساب الإجمالي
    const countRes = await this.teamModel.aggregate([
      ...pipeline,
      { $count: 'total' },
    ]);
    const total = countRes[0]?.total || 0;

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          teamName: '$name',
          teamCode: '$code',
          projectStatus: { $ifNull: ['$project.status', 'N/A'] },
          projectYear: { $ifNull: ['$project.year', 'N/A'] }, // 👈 عرض السنة في النتيجة
          universityId: { $ifNull: ['$uniInfo._id', 'N/A'] },
          universityName: { $ifNull: ['$uniInfo.universityName', 'N/A'] },
          departmentId: { $ifNull: ['$deptInfo._id', 'N/A'] },
          departmentName: { $ifNull: ['$deptInfo.departmentName', 'N/A'] },
        },
      },
    );

    const data = await this.teamModel.aggregate(pipeline);

    return {
      success: true,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      data,
    };
  }

  async getTeamDetails(id: string) {
    const teamObjectId = new Types.ObjectId(id);

    const data = await this.teamModel.aggregate([
      // 1. تحديد التيم المطلوب
      { $match: { _id: teamObjectId } },

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

      // 3. ربط طلب الإشراف (عشان نجيب القسم والجامعة)
      {
        $lookup: {
          from: 'supervisionrequests',
          localField: 'projectInfo.supervision_request_id',
          foreignField: '_id',
          as: 'supRequest',
        },
      },
      { $unwind: { path: '$supRequest', preserveNullAndEmptyArrays: true } },

      // 4. ربط القسم والجامعة
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

      // 5. ربط أعضاء التيم
      {
        $lookup: {
          from: 'teammembers',
          localField: '_id',
          foreignField: 'team_id',
          as: 'members',
        },
      },

      // 6. ربط بيانات المستخدمين للأعضاء
      {
        $lookup: {
          from: 'users',
          localField: 'members.user_id',
          foreignField: '_id',
          as: 'memberDetails',
        },
      },

      // 7. التشكيل النهائي للبيانات (تم إضافة السنة هنا)
      {
        $project: {
          _id: 1,
          teamName: '$name',
          teamCode: '$code',
          projectTitle: '$projectInfo.title',
          projectDescription: '$projectInfo.description',
          projectStatus: '$projectInfo.status',
          projectYear: '$projectInfo.year', // 👈 أهي السنة نورت هنا
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
      throw new NotFoundException('Team not found');
    }

    return {
      success: true,
      data: data[0],
    };
  }
}
