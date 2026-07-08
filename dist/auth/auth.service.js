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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../user/schemas/user.schema");
const user_auth_schema_1 = require("./schemas/user-auth.schema");
const mail_service_1 = require("./mail/mail.service");
const jwt_util_1 = require("../common/utils/jwt.util");
const generate_code_util_1 = require("../common/utils/generate-code.util");
let AuthService = class AuthService {
    userModel;
    userAuthModel;
    universityModel;
    departmentModel;
    jwtUtil;
    mailService;
    constructor(userModel, userAuthModel, universityModel, departmentModel, jwtUtil, mailService) {
        this.userModel = userModel;
        this.userAuthModel = userAuthModel;
        this.universityModel = universityModel;
        this.departmentModel = departmentModel;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
    }
    async executeWithSession(operation) {
        const session = await this.userModel.db.startSession();
        try {
            session.startTransaction();
            const result = await operation(session);
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async findOrCreateUserAuth(userId, session) {
        let userAuth = await this.userAuthModel
            .findOne({ userId })
            .session(session || null);
        if (!userAuth) {
            userAuth = new this.userAuthModel({ userId });
            if (session) {
                await userAuth.save({ session });
            }
        }
        return userAuth;
    }
    async signUp(signupDto) {
        const { fullName, email, password, departmentId, universityId, universityCode, phoneNumber, } = signupDto;
        let verificationCode = '';
        await this.executeWithSession(async (session) => {
            const existingUser = await this.userModel
                .findOne({ email })
                .session(session)
                .lean()
                .exec();
            if (existingUser) {
                if (existingUser.isVerified) {
                    throw new common_1.BadRequestException('البريد الإلكتروني مسجل بالفعل');
                }
                if (departmentId) {
                    const department = await this.departmentModel
                        .findOne({ _id: departmentId, is_deleted: false })
                        .session(session)
                        .lean()
                        .exec();
                    if (!department)
                        throw new common_1.NotFoundException('القسم غير موجود');
                    if (universityId &&
                        department.universityId?.toString() !== universityId) {
                        throw new common_1.BadRequestException('القسم لا ينتمي للجامعة المحددة');
                    }
                }
                if (universityId) {
                    const university = await this.universityModel
                        .findOne({ _id: universityId, is_deleted: false })
                        .session(session)
                        .lean()
                        .exec();
                    if (!university)
                        throw new common_1.NotFoundException('الجامعة غير موجودة');
                }
                if (universityCode && existingUser.universityCode !== universityCode) {
                    const exists = await this.userModel
                        .exists({ universityCode, _id: { $ne: existingUser._id } })
                        .session(session);
                    if (exists)
                        throw new common_1.BadRequestException('كود الجامعة مستخدم بالفعل');
                }
                if (phoneNumber && existingUser.phoneNumber !== phoneNumber) {
                    const exists = await this.userModel
                        .exists({ phoneNumber, _id: { $ne: existingUser._id } })
                        .session(session);
                    if (exists)
                        throw new common_1.BadRequestException('رقم الهاتف مستخدم بالفعل');
                }
                const hashedPassword = await bcrypt.hash(password, 12);
                const { code, expiry } = (0, generate_code_util_1.generateSixDigitCode)(10);
                verificationCode = code;
                const hashedCode = await bcrypt.hash(code, 10);
                const updateData = {
                    fullName,
                    password: hashedPassword,
                };
                if (departmentId)
                    updateData.departmentId = new mongoose_2.Types.ObjectId(departmentId);
                if (universityId)
                    updateData.universityId = new mongoose_2.Types.ObjectId(universityId);
                if (universityCode)
                    updateData.universityCode = universityCode;
                if (phoneNumber)
                    updateData.phoneNumber = phoneNumber;
                await this.userModel
                    .updateOne({ _id: existingUser._id }, { $set: updateData })
                    .session(session)
                    .exec();
                await this.userAuthModel
                    .findOneAndUpdate({ userId: existingUser._id }, {
                    emailVerificationCode: hashedCode,
                    verificationCodeExpiry: expiry,
                }, { upsert: true, session })
                    .exec();
                return;
            }
            if (departmentId) {
                const department = await this.departmentModel
                    .findOne({ _id: departmentId, is_deleted: false })
                    .session(session)
                    .lean()
                    .exec();
                if (!department)
                    throw new common_1.NotFoundException('القسم غير موجود');
                if (universityId &&
                    department.universityId?.toString() !== universityId) {
                    throw new common_1.BadRequestException('القسم لا ينتمي للجامعة المحددة');
                }
            }
            if (universityId) {
                const university = await this.universityModel
                    .findOne({ _id: universityId, is_deleted: false })
                    .session(session)
                    .lean()
                    .exec();
                if (!university)
                    throw new common_1.NotFoundException('الجامعة غير موجودة');
            }
            if (universityCode) {
                const exists = await this.userModel
                    .exists({ universityCode })
                    .session(session);
                if (exists)
                    throw new common_1.BadRequestException('كود الجامعة مستخدم بالفعل');
            }
            if (phoneNumber) {
                const exists = await this.userModel
                    .exists({ phoneNumber })
                    .session(session);
                if (exists)
                    throw new common_1.BadRequestException('رقم الهاتف مستخدم بالفعل');
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const { code, expiry } = (0, generate_code_util_1.generateSixDigitCode)(10);
            verificationCode = code;
            const hashedCode = await bcrypt.hash(code, 10);
            const userData = {
                fullName,
                email,
                password: hashedPassword,
                role: 'student',
                phoneNumber,
            };
            if (departmentId)
                userData.departmentId = new mongoose_2.Types.ObjectId(departmentId);
            if (universityId)
                userData.universityId = new mongoose_2.Types.ObjectId(universityId);
            if (universityCode)
                userData.universityCode = universityCode;
            const user = new this.userModel(userData);
            const savedUser = await user.save({ session });
            const userAuth = new this.userAuthModel({
                userId: savedUser._id,
                emailVerificationCode: hashedCode,
                verificationCodeExpiry: expiry,
            });
            await userAuth.save({ session });
        });
        await this.mailService.sendVerificationEmail(email, verificationCode);
        return {
            message: 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني',
        };
    }
    async verifyEmail(verifyDto) {
        const { email, code } = verifyDto;
        const user = await this.userModel.findOne({ email }).lean().exec();
        if (!user || user.isVerified) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        const userAuth = await this.userAuthModel
            .findOne({ userId: user._id })
            .lean()
            .exec();
        if (!userAuth?.emailVerificationCode || !userAuth.verificationCodeExpiry) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        const isValid = await bcrypt.compare(code, userAuth.emailVerificationCode);
        const isExpired = userAuth.verificationCodeExpiry < new Date();
        if (!isValid || isExpired) {
            throw new common_1.BadRequestException('كود التحقق غير صحيح أو منتهي الصلاحية');
        }
        await Promise.all([
            this.userModel.updateOne({ _id: user._id }, { isVerified: true }).exec(),
            this.userAuthModel
                .updateOne({ userId: user._id }, { $unset: { emailVerificationCode: 1, verificationCodeExpiry: 1 } })
                .exec(),
        ]);
        return { message: 'تم التحقق من البريد الإلكتروني بنجاح' };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email }).lean().exec();
        if (!user || !user.isVerified) {
            throw new common_1.BadRequestException('بيانات الدخول غير صحيحة');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('بيانات الدخول غير صحيحة');
        }
        const payload = { id: user._id, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtUtil.generateAccessToken(payload),
            this.jwtUtil.generateRefreshToken(payload),
        ]);
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await Promise.all([
            this.userModel
                .updateOne({ _id: user._id }, { lastLogin: new Date() })
                .exec(),
            this.userAuthModel
                .findOneAndUpdate({ userId: user._id }, { refreshToken, refreshTokenExpiry }, { upsert: true })
                .exec(),
        ]);
        return { accessToken, refreshToken };
    }
    async logout(logoutDto) {
        const { refreshToken } = logoutDto;
        if (!refreshToken) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        const result = await this.userAuthModel
            .updateOne({ refreshToken }, { $unset: { refreshToken: 1, refreshTokenExpiry: 1 } })
            .exec();
        if (result.matchedCount === 0) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        return { message: 'تم تسجيل الخروج بنجاح' };
    }
    async refreshToken(refreshDto) {
        const { refreshToken } = refreshDto;
        if (!refreshToken) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        const userAuth = await this.userAuthModel
            .findOne({ refreshToken })
            .lean()
            .exec();
        if (!userAuth ||
            !userAuth.refreshTokenExpiry ||
            userAuth.refreshTokenExpiry < new Date()) {
            throw new common_1.BadRequestException('الرمز غير صحيح أو منتهي الصلاحية');
        }
        const user = await this.userModel.findById(userAuth.userId).lean().exec();
        if (!user) {
            throw new common_1.BadRequestException('المستخدم غير موجود');
        }
        const newAccessToken = await this.jwtUtil.generateAccessToken({
            id: user._id,
            role: user.role,
        });
        return { accessToken: newAccessToken, refreshToken };
    }
    async forgetPassword(forgetDto) {
        const { email } = forgetDto;
        const user = await this.userModel.findOne({ email }).lean().exec();
        if (!user) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        const { code, expiry } = (0, generate_code_util_1.generateSixDigitCode)(10);
        const hashedCode = await bcrypt.hash(code, 10);
        await Promise.all([
            this.userAuthModel
                .findOneAndUpdate({ userId: user._id }, { resetPasswordCode: hashedCode, resetPasswordExpiry: expiry }, { upsert: true })
                .exec(),
            this.mailService.sendResetPasswordEmail(email, code),
        ]);
        return {
            message: 'تم إرسال كود إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
        };
    }
    async resetPassword(resetDto) {
        const { email, code, newPassword, confirmNewPassword } = resetDto;
        if (newPassword !== confirmNewPassword) {
            throw new common_1.BadRequestException('كلمات المرور غير متطابقة');
        }
        return await this.executeWithSession(async (session) => {
            const user = await this.userModel
                .findOne({ email })
                .session(session)
                .lean()
                .exec();
            if (!user) {
                throw new common_1.BadRequestException('بيانات غير صحيحة');
            }
            const userAuth = await this.userAuthModel
                .findOne({ userId: user._id })
                .session(session)
                .lean()
                .exec();
            if (!userAuth?.resetPasswordCode || !userAuth.resetPasswordExpiry) {
                throw new common_1.BadRequestException('بيانات غير صحيحة');
            }
            const isValid = await bcrypt.compare(code, userAuth.resetPasswordCode);
            if (!isValid || userAuth.resetPasswordExpiry < new Date()) {
                throw new common_1.BadRequestException('كود إعادة التعيين غير صحيح أو منتهي الصلاحية');
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await Promise.all([
                this.userModel
                    .updateOne({ _id: user._id }, { password: hashedPassword })
                    .session(session)
                    .exec(),
                this.userAuthModel
                    .updateOne({ userId: user._id }, { $unset: { resetPasswordCode: 1, resetPasswordExpiry: 1 } })
                    .session(session)
                    .exec(),
            ]);
            return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
        });
    }
    catch(err) {
        if (err instanceof common_1.HttpException)
            throw err;
        throw new common_1.InternalServerErrorException('فشل إعادة تعيين كلمة المرور');
    }
    async loginV2(loginDto, res) {
        const { email, password } = loginDto;
        const user = await this.userModel.findOne({ email }).lean().exec();
        if (!user || !user.isVerified) {
            throw new common_1.BadRequestException('بيانات الدخول غير صحيحة');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('بيانات الدخول غير صحيحة');
        }
        const payload = { id: user._id, role: user.role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtUtil.generateAccessToken(payload),
            this.jwtUtil.generateRefreshToken(payload),
        ]);
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await Promise.all([
            this.userModel
                .updateOne({ _id: user._id }, { lastLogin: new Date() })
                .exec(),
            this.userAuthModel
                .findOneAndUpdate({ userId: user._id }, { refreshToken, refreshTokenExpiry }, { upsert: true })
                .exec(),
        ]);
        this.jwtUtil.setRefreshTokenCookie(res, refreshToken);
        return { accessToken };
    }
    async logoutV2(req, res) {
        const refreshToken = this.jwtUtil.getRefreshTokenFromCookie(req);
        if (!refreshToken) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        const result = await this.userAuthModel
            .updateOne({ refreshToken }, { $unset: { refreshToken: 1, refreshTokenExpiry: 1 } })
            .exec();
        if (result.matchedCount === 0) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        this.jwtUtil.clearRefreshTokenCookie(res);
        return { message: 'تم تسجيل الخروج بنجاح' };
    }
    async refreshTokenV2(req, res) {
        const refreshToken = this.jwtUtil.getRefreshTokenFromCookie(req);
        if (!refreshToken) {
            throw new common_1.BadRequestException('بيانات غير صحيحة');
        }
        const userAuth = await this.userAuthModel
            .findOne({ refreshToken })
            .lean()
            .exec();
        if (!userAuth ||
            !userAuth.refreshTokenExpiry ||
            userAuth.refreshTokenExpiry < new Date()) {
            this.jwtUtil.clearRefreshTokenCookie(res);
            throw new common_1.BadRequestException('الرمز غير صحيح أو منتهي الصلاحية');
        }
        const user = await this.userModel.findById(userAuth.userId).lean().exec();
        if (!user) {
            throw new common_1.BadRequestException('المستخدم غير موجود');
        }
        const newAccessToken = await this.jwtUtil.generateAccessToken({
            id: user._id,
            role: user.role,
        });
        return { accessToken: newAccessToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_auth_schema_1.UserAuth.name)),
    __param(2, (0, mongoose_1.InjectModel)('University')),
    __param(3, (0, mongoose_1.InjectModel)('Department')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        jwt_util_1.JwtUtil,
        mail_service_1.MailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map