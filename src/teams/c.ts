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

  async getMyTeam(user: any) {
    console.log('🔹 User object received:', JSON.stringify(user, null, 2));

    const userId = user?.userId || user?.sub || user?.id || user?._id;

    if (!userId) {
      console.error('❌ User object structure:', user);
      throw new BadRequestException(
        'Invalid token: userId missing. Please login again.',
      );
    }

    const userObjectId = new Types.ObjectId(userId);
    console.log('🔹 Looking for userId:', userId);
    console.log('🔹 Converted ObjectId:', userObjectId.toString());

    // Check if user exists in database
    const userInDb = await this.userModel.findById(userObjectId).lean();
    if (!userInDb) {
      throw new NotFoundException(
        `User with ID ${userId} not found in database`,
      );
    }
    console.log('✅ User found in DB:', {
      id: userInDb._id,
      name: (userInDb as any).fullName,
      email: (userInDb as any).email,
    });

    let team: any = null;

    // 1️⃣ Check if user is a team member
    console.log(
      '🔍 Searching in teamMemberModel with user_id:',
      userObjectId.toString(),
    );

    const member = await this.teamMemberModel
      .findOne({ user_id: userObjectId })
      .lean()
      .exec();

    console.log(
      '✅ Found member:',
      member ? JSON.stringify(member, null, 2) : 'NULL',
    );

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

    // 2️⃣ Check if user is team leader
    if (!team) {
      console.log(
        '🔍 Searching in teamModel as leader with lead_id:',
        userObjectId.toString(),
      );

      team = await this.teamModel
        .findOne({ lead_id: userObjectId })
        .populate('project_id', 'title description year status')
        .populate('doctorId', 'fullName email phoneNumber profileImage bio')
        .populate('lead_id', 'fullName email phoneNumber profileImage bio')
        .lean()
        .exec();
      console.log('✅ Team from leader:', team ? 'FOUND' : 'NULL');
    }

    // 3️⃣ Check if user is doctor
    if (!team && user.role === 'doctor') {
      console.log(
        '🔍 Searching in teamModel as doctor with doctorId:',
        userObjectId.toString(),
      );

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

      // Find all teams and check which users are in them
      const allTeamsWithMembers = await this.teamModel.find().lean().limit(3);
      for (const t of allTeamsWithMembers) {
        const teamMembers = await this.teamMemberModel
          .find({ team_id: t._id })
          .populate('user_id', 'fullName email')
          .lean();
        console.log(
          `📊 Team ${t.name} members:`,
          teamMembers.map((m: any) => ({
            userId: m.user_id._id.toString(),
            name: m.user_id.fullName,
            email: m.user_id.email,
          })),
        );
      }

      throw new NotFoundException(
        `You are not assigned to any team. Your user ID is: ${userId}. ` +
          `Please contact your supervisor to add you to a team.`,
      );
    }

    // 🔥 CRITICAL: Get ALL team members (this was missing before!)
    const members = await this.teamMemberModel
      .find({ team_id: team._id })
      .populate({
        path: 'user_id',
        select:
          'fullName email phoneNumber profileImage bio universityId departmentId',
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
        members: members.map((member: any) => ({
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

  async isUserInAnyTeam(userId: Types.ObjectId): Promise<boolean> {
    const member = await this.teamMemberModel.findOne({ user_id: userId });
    return !!member;
  }

  async getTeamMembers(teamId: Types.ObjectId) {
    return this.teamMemberModel
      .find({ team_id: teamId })
      .populate('user_id', 'fullName email profileImage bio');
  }

  async removeMemberFromTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    doctorId: Types.ObjectId,
  ) {
    const team = await this.teamModel.findById(teamId);

    if (!team) {
      throw new NotFoundException('الفريق غير موجود');
    }

    if (team.doctorId.toString() !== doctorId.toString()) {
      throw new BadRequestException('غير مسموح لك بحذف أعضاء من هذا الفريق');
    }

    if (team.lead_id.toString() === userId.toString()) {
      throw new BadRequestException('لا يمكن حذف قائد الفريق');
    }

    const result = await this.teamMemberModel.deleteOne({
      team_id: teamId,
      user_id: userId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('العضو غير موجود في الفريق');
    }

    return { message: 'تم حذف العضو بنجاح' };
  }

  async addMemberToTeam(
    teamId: Types.ObjectId,
    userId: Types.ObjectId,
    role: string,
    doctorId: Types.ObjectId,
  ) {
    const team = await this.teamModel.findById(teamId);

    if (!team) {
      throw new NotFoundException('الفريق غير موجود');
    }

    if (team.doctorId.toString() !== doctorId.toString()) {
      throw new BadRequestException('غير مسموح لك بإضافة أعضاء لهذا الفريق');
    }

    const isInTeam = await this.isUserInAnyTeam(userId);
    if (isInTeam) {
      throw new BadRequestException('هذا الطالب موجود في فريق آخر بالفعل');
    }

    const user = await this.userModel.findById(userId);
    if (!user || user.isDeleted) {
      throw new BadRequestException('الطالب غير موجود أو محذوف');
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
}
