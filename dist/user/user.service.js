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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const file_upload_constants_1 = require("../common/constants/file-upload.constants");
const department_doctor_schema_1 = require("../department-doctors/schemas/department-doctor.schema");
const department_schema_1 = require("../departments/schemas/department.schema");
const bcrypt = require("bcrypt");
let UserService = class UserService {
    userModel;
    cloudinaryService;
    departmentDoctorModel;
    departmentModel;
    constructor(userModel, cloudinaryService, departmentDoctorModel, departmentModel) {
        this.userModel = userModel;
        this.cloudinaryService = cloudinaryService;
        this.departmentDoctorModel = departmentDoctorModel;
        this.departmentModel = departmentModel;
    }
    validateObjectId(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id)) {
            throw new common_1.BadRequestException(file_upload_constants_1.ERROR_MESSAGES.AR.INVALID_ID);
        }
    }
    async findUserById(userId) {
        const user = await this.userModel
            .findById(userId)
            .populate('departmentId', 'departmentName')
            .populate('universityId', 'universityName')
            .select('-password -lastLogin')
            .lean()
            .exec();
        if (!user) {
            throw new common_1.NotFoundException(file_upload_constants_1.ERROR_MESSAGES.AR.USER_NOT_FOUND);
        }
        return user;
    }
    async findUserByIdNullable(userId) {
        return this.userModel
            .findById(userId)
            .populate('departmentId', 'departmentName')
            .populate('universityId', 'universityName')
            .select('-password -lastLogin')
            .lean()
            .exec();
    }
    mapToUserProfileResponse(user) {
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
    async handleImageUpload(oldImageUrl, newImage) {
        try {
            if (oldImageUrl) {
                const publicId = this.cloudinaryService.extractPublicId(oldImageUrl);
                this.cloudinaryService.deleteImage(publicId).catch(() => {
                });
            }
            const uploadResult = await this.cloudinaryService.uploadImage(newImage, file_upload_constants_1.FILE_UPLOAD_CONFIG.FOLDERS.USER_PROFILES);
            if (!uploadResult?.secure_url) {
                throw new Error('Upload result missing secure_url');
            }
            return uploadResult.secure_url;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(file_upload_constants_1.ERROR_MESSAGES.AR.UPLOAD_FAILED);
        }
    }
    async updateUser(userId, updateFields) {
        if (Object.keys(updateFields).length === 0) {
            throw new common_1.BadRequestException('لا توجد بيانات للتحديث');
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(userId, { $set: updateFields }, {
            new: true,
            runValidators: true,
            select: '-password -isDeleted',
            lean: true,
        })
            .exec();
        if (!updatedUser) {
            throw new common_1.NotFoundException(file_upload_constants_1.ERROR_MESSAGES.AR.USER_NOT_FOUND);
        }
        return updatedUser;
    }
    async getMyProfile(userId) {
        this.validateObjectId(userId);
        const user = await this.findUserById(userId);
        if (user.isDeleted) {
            throw new common_1.NotFoundException(file_upload_constants_1.ERROR_MESSAGES.AR.ACCOUNT_DELETED);
        }
        return this.mapToUserProfileResponse(user);
    }
    async updateMyProfile(userId, updateData, profileImage) {
        this.validateObjectId(userId);
        const user = await this.findUserByIdNullable(userId);
        if (!user) {
            throw new common_1.NotFoundException(file_upload_constants_1.ERROR_MESSAGES.AR.USER_NOT_FOUND);
        }
        if (user.isDeleted) {
            throw new common_1.BadRequestException(file_upload_constants_1.ERROR_MESSAGES.AR.CANNOT_UPDATE_DELETED);
        }
        const { fullName, phoneNumber, bio } = updateData;
        const allowedUpdates = {
            ...(fullName && { fullName }),
            ...(phoneNumber && { phoneNumber }),
            ...(bio && { bio }),
        };
        if (Object.keys(allowedUpdates).length > 0) {
            await this.updateUser(userId, allowedUpdates);
        }
        if (profileImage) {
            this.handleImageUploadAsync(userId, user.profileImage, profileImage).catch((error) => {
                console.error('Background upload failed:', error);
            });
        }
        const updatedUser = await this.userModel
            .findById(userId)
            .select('fullName phoneNumber bio profileImage email')
            .lean()
            .exec();
        return {
            message: file_upload_constants_1.ERROR_MESSAGES.AR.PROFILE_UPDATED,
            data: updatedUser,
        };
    }
    async handleImageUploadAsync(userId, oldImageUrl, newImage) {
        const imageUrl = await this.handleImageUpload(oldImageUrl, newImage);
        await this.userModel
            .updateOne({ _id: userId }, { $set: { profileImage: imageUrl } })
            .exec();
    }
    async findDoctorsByDepartment(departmentId) {
        if (!mongoose_2.Types.ObjectId.isValid(departmentId)) {
            throw new common_1.BadRequestException('Invalid departmentId');
        }
        const departmentExists = await this.departmentModel.exists({
            _id: new mongoose_2.Types.ObjectId(departmentId),
        });
        if (!departmentExists) {
            throw new common_1.NotFoundException('Department not found');
        }
        const departmentDoctors = await this.departmentDoctorModel
            .find({ departmentId: new mongoose_2.Types.ObjectId(departmentId) })
            .populate({
            path: 'doctorId',
            match: {
                isDeleted: false,
            },
            select: 'fullName email profileImage',
        })
            .lean();
        const doctors = departmentDoctors
            .filter((d) => d.doctorId)
            .map((d) => ({
            ...d.doctorId,
            isHead: d.isHead,
        }));
        if (!doctors.length) {
            throw new common_1.NotFoundException('لا يوجد دكاترة في هذا القسم');
        }
        return {
            success: true,
            results: doctors.length,
            data: doctors,
        };
    }
    async makeDoctor(userId, departmentId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId) ||
            !mongoose_2.Types.ObjectId.isValid(departmentId)) {
            throw new common_1.BadRequestException('معرف غير صحيح');
        }
        const [user, department, existingAssignment] = await Promise.all([
            this.userModel.findById(userId).lean().exec(),
            this.departmentModel.findById(departmentId).lean().exec(),
            this.departmentDoctorModel
                .findOne({
                doctorId: userId,
                departmentId: departmentId,
            })
                .lean()
                .exec(),
        ]);
        if (!user) {
            throw new common_1.NotFoundException('المستخدم غير موجود');
        }
        if (user.isDeleted) {
            throw new common_1.BadRequestException('لا يمكن تعيين مستخدم محذوف كطبيب');
        }
        if (!department) {
            throw new common_1.NotFoundException('القسم غير موجود');
        }
        if (existingAssignment) {
            throw new common_1.BadRequestException('الطبيب مسجل بالفعل في هذا القسم');
        }
        const updates = [];
        if (user.role !== user_schema_1.UserRole.DOCTOR) {
            updates.push(this.userModel
                .updateOne({ _id: userId }, { $set: { role: user_schema_1.UserRole.DOCTOR } })
                .exec());
        }
        const departmentDoctor = new this.departmentDoctorModel({
            doctorId: new mongoose_2.Types.ObjectId(userId),
            departmentId: new mongoose_2.Types.ObjectId(departmentId),
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
    async createUserByAdmin(createUserDto) {
        const { email, password } = createUserDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.BadRequestException('هذا البريد الإلكتروني مسجل بالفعل');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
            isVerified: true,
        });
        return await newUser.save();
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(department_doctor_schema_1.DepartmentDoctor.name)),
    __param(3, (0, mongoose_1.InjectModel)(department_schema_1.Department.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cloudinary_service_1.CloudinaryService,
        mongoose_2.Model,
        mongoose_2.Model])
], UserService);
//# sourceMappingURL=user.service.js.map