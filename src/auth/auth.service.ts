import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model, Types, ClientSession } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { UserAuth, UserAuthDocument } from './schemas/user-auth.schema';
import { MailService } from './mail/mail.service';
import { VerifiyDto } from './dto/verifiy-email.dto';
import { JwtUtil } from 'src/common/utils/jwt.util';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { generateSixDigitCode } from 'src/common/utils/generate-code.util';
import { DepartmentDocument } from 'src/departments/schemas/department.schema';
import { UniversityDocument } from 'src/universities/schemas/university.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(UserAuth.name) private userAuthModel: Model<UserAuthDocument>,
    @InjectModel('University')
    private universityModel: Model<UniversityDocument>,
    @InjectModel('Department')
    private departmentModel: Model<DepartmentDocument>,
    private jwtUtil: JwtUtil,
    private mailService: MailService,
  ) {}

  private async executeWithSession<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.userModel.db.startSession();
    try {
      session.startTransaction();
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async findOrCreateUserAuth(
    userId: Types.ObjectId,
    session?: ClientSession,
  ): Promise<UserAuthDocument> {
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

  async signUp(signupDto: SignupDto) {
    const {
      fullName,
      email,
      password,
      departmentId,
      universityId,
      universityCode,
      phoneNumber,
    } = signupDto;

    let verificationCode: string = '';

    await this.executeWithSession(async (session) => {
      const existingUser = await this.userModel
        .findOne({ email })
        .session(session)
        .lean()
        .exec();

      if (existingUser) {
        if (existingUser.isVerified) {
          throw new BadRequestException('البريد الإلكتروني مسجل بالفعل');
        }

        // validations
        if (departmentId) {
          const department = await this.departmentModel
            .findOne({ _id: departmentId, is_deleted: false })
            .session(session)
            .lean()
            .exec();

          if (!department) throw new NotFoundException('القسم غير موجود');

          if (
            universityId &&
            department.universityId?.toString() !== universityId
          ) {
            throw new BadRequestException('القسم لا ينتمي للجامعة المحددة');
          }
        }

        if (universityId) {
          const university = await this.universityModel
            .findOne({ _id: universityId, is_deleted: false })
            .session(session)
            .lean()
            .exec();

          if (!university) throw new NotFoundException('الجامعة غير موجودة');
        }

        if (universityCode && existingUser.universityCode !== universityCode) {
          const exists = await this.userModel
            .exists({ universityCode, _id: { $ne: existingUser._id } })
            .session(session);

          if (exists)
            throw new BadRequestException('كود الجامعة مستخدم بالفعل');
        }

        if (phoneNumber && existingUser.phoneNumber !== phoneNumber) {
          const exists = await this.userModel
            .exists({ phoneNumber, _id: { $ne: existingUser._id } })
            .session(session);

          if (exists) throw new BadRequestException('رقم الهاتف مستخدم بالفعل');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const { code, expiry } = generateSixDigitCode(10);
        verificationCode = code;

        const hashedCode = await bcrypt.hash(code, 10);

        const updateData: any = {
          fullName,
          password: hashedPassword,
        };

        if (departmentId)
          updateData.departmentId = new Types.ObjectId(departmentId);
        if (universityId)
          updateData.universityId = new Types.ObjectId(universityId);
        if (universityCode) updateData.universityCode = universityCode;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        await this.userModel
          .updateOne({ _id: existingUser._id }, { $set: updateData })
          .session(session)
          .exec();

        await this.userAuthModel
          .findOneAndUpdate(
            { userId: existingUser._id },
            {
              emailVerificationCode: hashedCode,
              verificationCodeExpiry: expiry,
            },
            { upsert: true, session },
          )
          .exec();

        return;
      }

      // ===== New User =====

      if (departmentId) {
        const department = await this.departmentModel
          .findOne({ _id: departmentId, is_deleted: false })
          .session(session)
          .lean()
          .exec();

        if (!department) throw new NotFoundException('القسم غير موجود');

        if (
          universityId &&
          department.universityId?.toString() !== universityId
        ) {
          throw new BadRequestException('القسم لا ينتمي للجامعة المحددة');
        }
      }

      if (universityId) {
        const university = await this.universityModel
          .findOne({ _id: universityId, is_deleted: false })
          .session(session)
          .lean()
          .exec();

        if (!university) throw new NotFoundException('الجامعة غير موجودة');
      }

      if (universityCode) {
        const exists = await this.userModel
          .exists({ universityCode })
          .session(session);

        if (exists) throw new BadRequestException('كود الجامعة مستخدم بالفعل');
      }

      if (phoneNumber) {
        const exists = await this.userModel
          .exists({ phoneNumber })
          .session(session);

        if (exists) throw new BadRequestException('رقم الهاتف مستخدم بالفعل');
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const { code, expiry } = generateSixDigitCode(10);
      verificationCode = code;

      const hashedCode = await bcrypt.hash(code, 10);

      const userData: any = {
        fullName,
        email,
        password: hashedPassword,
        role: 'student',
        phoneNumber,
      };

      if (departmentId)
        userData.departmentId = new Types.ObjectId(departmentId);
      if (universityId)
        userData.universityId = new Types.ObjectId(universityId);
      if (universityCode) userData.universityCode = universityCode;

      const user = new this.userModel(userData);
      const savedUser = await user.save({ session });

      const userAuth = new this.userAuthModel({
        userId: savedUser._id,
        emailVerificationCode: hashedCode,
        verificationCodeExpiry: expiry,
      });

      await userAuth.save({ session });
    });

    // إرسال الإيميل بعد نجاح الـ transaction
    await this.mailService.sendVerificationEmail(email, verificationCode);

    return {
      message: 'تم التسجيل بنجاح. يرجى التحقق من بريدك الإلكتروني',
    };
  }
  async verifyEmail(verifyDto: VerifiyDto) {
    const { email, code } = verifyDto;

    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user || user.isVerified) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    const userAuth = await this.userAuthModel
      .findOne({ userId: user._id })
      .lean()
      .exec();
    if (!userAuth?.emailVerificationCode || !userAuth.verificationCodeExpiry) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    const isValid = await bcrypt.compare(code, userAuth.emailVerificationCode);
    const isExpired = userAuth.verificationCodeExpiry < new Date();

    if (!isValid || isExpired) {
      throw new BadRequestException('كود التحقق غير صحيح أو منتهي الصلاحية');
    }

    await Promise.all([
      this.userModel.updateOne({ _id: user._id }, { isVerified: true }).exec(),
      this.userAuthModel
        .updateOne(
          { userId: user._id },
          { $unset: { emailVerificationCode: 1, verificationCodeExpiry: 1 } },
        )
        .exec(),
    ]);

    return { message: 'تم التحقق من البريد الإلكتروني بنجاح' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user || !user.isVerified) {
      throw new BadRequestException('بيانات الدخول غير صحيحة');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('بيانات الدخول غير صحيحة');
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
        .findOneAndUpdate(
          { userId: user._id },
          { refreshToken, refreshTokenExpiry },
          { upsert: true },
        )
        .exec(),
    ]);

    return { accessToken, refreshToken };
  }

  async logout(logoutDto: LogoutDto) {
    const { refreshToken } = logoutDto;

    if (!refreshToken) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    const result = await this.userAuthModel
      .updateOne(
        { refreshToken },
        { $unset: { refreshToken: 1, refreshTokenExpiry: 1 } },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  async refreshToken(refreshDto: RefreshTokenDto) {
    const { refreshToken } = refreshDto;

    if (!refreshToken) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    const userAuth = await this.userAuthModel
      .findOne({ refreshToken })
      .lean()
      .exec();
    if (
      !userAuth ||
      !userAuth.refreshTokenExpiry ||
      userAuth.refreshTokenExpiry < new Date()
    ) {
      throw new BadRequestException('الرمز غير صحيح أو منتهي الصلاحية');
    }

    const user = await this.userModel.findById(userAuth.userId).lean().exec();
    if (!user) {
      throw new BadRequestException('المستخدم غير موجود');
    }

    const newAccessToken = await this.jwtUtil.generateAccessToken({
      id: user._id,
      role: user.role,
    });

    return { accessToken: newAccessToken, refreshToken };
  }

  async forgetPassword(forgetDto: ForgetPasswordDto) {
    const { email } = forgetDto;

    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    const { code, expiry } = generateSixDigitCode(10);
    const hashedCode = await bcrypt.hash(code, 10);

    await Promise.all([
      this.userAuthModel
        .findOneAndUpdate(
          { userId: user._id },
          { resetPasswordCode: hashedCode, resetPasswordExpiry: expiry },
          { upsert: true },
        )
        .exec(),
      this.mailService.sendResetPasswordEmail(email, code),
    ]);

    return {
      message: 'تم إرسال كود إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
    };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const { email, code, newPassword, confirmNewPassword } = resetDto;

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('كلمات المرور غير متطابقة');
    }

    return await this.executeWithSession(async (session) => {
      const user = await this.userModel
        .findOne({ email })
        .session(session)
        .lean()
        .exec();
      if (!user) {
        throw new BadRequestException('بيانات غير صحيحة');
      }

      const userAuth = await this.userAuthModel
        .findOne({ userId: user._id })
        .session(session)
        .lean()
        .exec();
      if (!userAuth?.resetPasswordCode || !userAuth.resetPasswordExpiry) {
        throw new BadRequestException('بيانات غير صحيحة');
      }

      const isValid = await bcrypt.compare(code, userAuth.resetPasswordCode);
      if (!isValid || userAuth.resetPasswordExpiry < new Date()) {
        throw new BadRequestException(
          'كود إعادة التعيين غير صحيح أو منتهي الصلاحية',
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await Promise.all([
        this.userModel
          .updateOne({ _id: user._id }, { password: hashedPassword })
          .session(session)
          .exec(),
        this.userAuthModel
          .updateOne(
            { userId: user._id },
            { $unset: { resetPasswordCode: 1, resetPasswordExpiry: 1 } },
          )
          .session(session)
          .exec(),
      ]);

      return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
    });
  }
  catch(err) {
    if (err instanceof HttpException) throw err;
    throw new InternalServerErrorException('فشل إعادة تعيين كلمة المرور');
  }

  // ========================================
  // V2 Methods - Cookie-based
  // ========================================

  async loginV2(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }).lean().exec();
    if (!user || !user.isVerified) {
      throw new BadRequestException('بيانات الدخول غير صحيحة');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('بيانات الدخول غير صحيحة');
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
        .findOneAndUpdate(
          { userId: user._id },
          { refreshToken, refreshTokenExpiry },
          { upsert: true },
        )
        .exec(),
    ]);

    this.jwtUtil.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  async logoutV2(req: Request, res: Response) {
    const refreshToken = this.jwtUtil.getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    const result = await this.userAuthModel
      .updateOne(
        { refreshToken },
        { $unset: { refreshToken: 1, refreshTokenExpiry: 1 } },
      )
      .exec();

    if (result.matchedCount === 0) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    this.jwtUtil.clearRefreshTokenCookie(res);

    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  async refreshTokenV2(req: Request, res: Response) {
    const refreshToken = this.jwtUtil.getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      throw new BadRequestException('بيانات غير صحيحة');
    }

    const userAuth = await this.userAuthModel
      .findOne({ refreshToken })
      .lean()
      .exec();
    if (
      !userAuth ||
      !userAuth.refreshTokenExpiry ||
      userAuth.refreshTokenExpiry < new Date()
    ) {
      this.jwtUtil.clearRefreshTokenCookie(res);
      throw new BadRequestException('الرمز غير صحيح أو منتهي الصلاحية');
    }

    const user = await this.userModel.findById(userAuth.userId).lean().exec();
    if (!user) {
      throw new BadRequestException('المستخدم غير موجود');
    }

    const newAccessToken = await this.jwtUtil.generateAccessToken({
      id: user._id,
      role: user.role,
    });

    return { accessToken: newAccessToken };
  }
}
