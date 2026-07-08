// src/user/user.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import {
  UserProfileResponseDto,
  UpdateProfileResponseDto,
} from './dto/user-profile-response.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import {
  ERROR_MESSAGES,
  FILE_UPLOAD_CONFIG,
} from '../common/constants/file-upload.constants';
import { DepartmentDoctor } from 'src/department-doctors/schemas/department-doctor.schema';
import { Department } from 'src/departments/schemas/department.schema';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(DepartmentDoctor.name)
    private readonly departmentDoctorModel: Model<DepartmentDoctor>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<Department>,
  ) {}

  // ==================== Private Helper Methods ====================

  /**
   * Validate MongoDB ObjectId
   */
  private validateObjectId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(ERROR_MESSAGES.AR.INVALID_ID);
    }
  }

  /**
   * Find user by ID - throws if not found (non-null return)
   */
  private async findUserById(userId: string): Promise<any> {
    const user = await this.userModel
      .findById(userId)
      .populate('departmentId', 'departmentName')
      .populate('universityId', 'universityName')
      .select('-password -lastLogin')
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.AR.USER_NOT_FOUND);
    }

    return user;
  }

  /**
   * Find user by ID - returns null if not found
   */
  private async findUserByIdNullable(userId: string): Promise<any | null> {
    return this.userModel
      .findById(userId)
      .populate('departmentId', 'departmentName')
      .populate('universityId', 'universityName')
      .select('-password -lastLogin')
      .lean()
      .exec();
  }

  /**
   * Map user document to UserProfileResponseDto
   */
  private mapToUserProfileResponse(user: any): UserProfileResponseDto {
    return {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      bio: user.bio,
      universityCode: user.universityCode,
      departmentId: user.departmentId
        ? {
            _id: user.departmentId._id.toString(),
            departmentName: user.departmentId.departmentName,
          }
        : undefined,
      universityId: user.universityId
        ? {
            _id: user.universityId._id.toString(),
            universityName: user.universityId.universityName,
          }
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Handle image upload: delete old & upload new
   */
  private async handleImageUpload(
    oldImageUrl: string | undefined,
    newImage: Express.Multer.File,
  ): Promise<string> {
    try {
      // Delete old image if exists (non-blocking)
      if (oldImageUrl) {
        const publicId = this.cloudinaryService.extractPublicId(oldImageUrl);
        this.cloudinaryService.deleteImage(publicId).catch(() => {
          // Log error but don't block the upload
        });
      }

      // Upload new image
      const uploadResult = await this.cloudinaryService.uploadImage(
        newImage,
        FILE_UPLOAD_CONFIG.FOLDERS.USER_PROFILES,
      );

      if (!uploadResult?.secure_url) {
        throw new Error('Upload result missing secure_url');
      }

      return uploadResult.secure_url;
    } catch (error) {
      throw new InternalServerErrorException(ERROR_MESSAGES.AR.UPLOAD_FAILED);
    }
  }

  /**
   * Update user document
   */
  private async updateUser(userId: string, updateFields: any): Promise<any> {
    if (Object.keys(updateFields).length === 0) {
      throw new BadRequestException('لا توجد بيانات للتحديث');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateFields },
        {
          new: true,
          runValidators: true,
          select: '-password -isDeleted', // ✅ حط الـ select هنا
          lean: true, // ✅ خليه true عشان أسرع
        },
      )
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(ERROR_MESSAGES.AR.USER_NOT_FOUND);
    }

    return updatedUser;
  }

  // Get user profile by token
  async getMyProfile(userId: string): Promise<UserProfileResponseDto> {
    this.validateObjectId(userId);

    const user = await this.findUserById(userId);

    // Check isDeleted from raw document before mapping
    if (user.isDeleted) {
      throw new NotFoundException(ERROR_MESSAGES.AR.ACCOUNT_DELETED);
    }

    return this.mapToUserProfileResponse(user);
  }

  // Update user profile with optional image upload by token

  // في user.service.ts
  async updateMyProfile(
    userId: string,
    updateData: UpdateStudentProfileDto,
    profileImage?: Express.Multer.File,
  ): Promise<UpdateProfileResponseDto> {
    this.validateObjectId(userId);

    const user = await this.findUserByIdNullable(userId);

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.AR.USER_NOT_FOUND);
    }

    if (user.isDeleted) {
      throw new BadRequestException(ERROR_MESSAGES.AR.CANNOT_UPDATE_DELETED);
    }

    // ✅ تحديد الحقول المسموح بتعديلها فقط (fullName, phoneNumber, bio)
    const { fullName, phoneNumber, bio } = updateData;

    // نضعهم في كائن جديد لضمان عدم إرسال أي حقول أخرى للداتابيز
    const allowedUpdates = {
      ...(fullName && { fullName }),
      ...(phoneNumber && { phoneNumber }),
      ...(bio && { bio }),
    };

    // ✅ تحديث البيانات النصية فوراً
    if (Object.keys(allowedUpdates).length > 0) {
      await this.updateUser(userId, allowedUpdates);
    }

    // ✅ التعامل مع الصورة (profileImage) في الخلفية كما طلبتِ
    if (profileImage) {
      this.handleImageUploadAsync(
        userId,
        user.profileImage,
        profileImage,
      ).catch((error) => {
        console.error('Background upload failed:', error);
      });
    }

    // ✅ جلب البيانات المحدثة لإرجاعها (اختياري، لو حابة ترجعي الـ data)
    const updatedUser = await this.userModel
      .findById(userId)
      .select('fullName phoneNumber bio profileImage email') // جلب الحقول المسموحة فقط
      .lean()
      .exec();

    return {
      message: ERROR_MESSAGES.AR.PROFILE_UPDATED,
      data: updatedUser as any, // إرجاع البيانات المحدثة للمستخدم
    };
  }

  // ✅ Background image upload method
private async handleImageUploadAsync(
  userId: string,
  oldImageUrl: string | undefined,
  newImage: Express.Multer.File,
): Promise<void> {
  // Upload new image
  const imageUrl = await this.handleImageUpload(oldImageUrl, newImage);

  // Update user with new image URL
  await this.userModel
    .updateOne({ _id: userId }, { $set: { profileImage: imageUrl } })
    .exec();
}
  async findDoctorsByDepartment(departmentId: string) {
    // 🟢 validation
    if (!Types.ObjectId.isValid(departmentId)) {
      throw new BadRequestException('Invalid departmentId');
    }

    // 🟢 check department exists
    const departmentExists = await this.departmentModel.exists({
      _id: new Types.ObjectId(departmentId),
    });

    if (!departmentExists) {
      throw new NotFoundException('Department not found');
    }

    // 🟢 get all doctors in department
    const departmentDoctors = await this.departmentDoctorModel
      .find({ departmentId: new Types.ObjectId(departmentId) })
      .populate({
        path: 'doctorId',
        // ❌ مهم: شلنا role filter عشان ما يفلترش دكاترة بالغلط
        match: {
          isDeleted: false,
        },
        select: 'fullName email profileImage',
      })
      .lean();

    // 🟢 extract doctors safely
    const doctors = departmentDoctors
      .filter((d) => d.doctorId) // remove nulls (لو user مش موجود)
      .map((d) => ({
        ...d.doctorId,
        isHead: d.isHead,
      }));

    if (!doctors.length) {
      throw new NotFoundException('لا يوجد دكاترة في هذا القسم');
    }

    return {
      success: true,
      results: doctors.length,
      data: doctors,
    };
  }
  async makeDoctor(userId: string, departmentId: string) {
    if (
      !Types.ObjectId.isValid(userId) ||
      !Types.ObjectId.isValid(departmentId)
    ) {
      throw new BadRequestException('معرف غير صحيح');
    }

    const [user, department, existingAssignment] = await Promise.all([
      this.userModel.findById(userId).lean().exec(),
      this.departmentModel.findById(departmentId).lean().exec(), // ✅ هنا التصحيح
      this.departmentDoctorModel
        .findOne({
          doctorId: userId,
          departmentId: departmentId,
        })
        .lean()
        .exec(),
    ]);

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    if (user.isDeleted) {
      throw new BadRequestException('لا يمكن تعيين مستخدم محذوف كطبيب');
    }

    if (!department) {
      throw new NotFoundException('القسم غير موجود');
    }

    if (existingAssignment) {
      throw new BadRequestException('الطبيب مسجل بالفعل في هذا القسم');
    }

    const updates: Promise<any>[] = [];

    if (user.role !== UserRole.DOCTOR) {
      updates.push(
        this.userModel
          .updateOne({ _id: userId }, { $set: { role: UserRole.DOCTOR } })
          .exec(),
      );
    }

    const departmentDoctor = new this.departmentDoctorModel({
      doctorId: new Types.ObjectId(userId),
      departmentId: new Types.ObjectId(departmentId),
      isHead: false,
    });

    updates.push(departmentDoctor.save());

    await Promise.all(updates);

    return {
      message: 'تم تعيين الطبيب بنجاح',
      doctorId: userId,
      departmentId: departmentId,
    };
  }

  async createUserByAdmin(
    createUserDto: CreateUserAdminDto,
  ): Promise<UserDocument> {
    const { email, password } = createUserDto;

    // 1. التأكد إن الإيميل مش مستخدم قبل كدة
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('هذا البريد الإلكتروني مسجل بالفعل');
    }

    // 2. تشفير الباسورد
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. إنشاء المستخدم
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      isVerified: true, // الأدمن بيضيفه فيعتبر موثق تلقائياً أو حسب رغبتك
    });

    return await newUser.save();
  }
}
