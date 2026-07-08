import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserDocument } from '../user/schemas/user.schema';
import { UserAuthDocument } from './schemas/user-auth.schema';
import { MailService } from './mail/mail.service';
import { VerifiyDto } from './dto/verifiy-email.dto';
import { JwtUtil } from "../common/utils/jwt.util";
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { DepartmentDocument } from "../departments/schemas/department.schema";
import { UniversityDocument } from "../universities/schemas/university.schema";
export declare class AuthService {
    private userModel;
    private userAuthModel;
    private universityModel;
    private departmentModel;
    private jwtUtil;
    private mailService;
    constructor(userModel: Model<UserDocument>, userAuthModel: Model<UserAuthDocument>, universityModel: Model<UniversityDocument>, departmentModel: Model<DepartmentDocument>, jwtUtil: JwtUtil, mailService: MailService);
    private executeWithSession;
    private findOrCreateUserAuth;
    signUp(signupDto: SignupDto): Promise<{
        message: string;
    }>;
    verifyEmail(verifyDto: VerifiyDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(logoutDto: LogoutDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgetPassword(forgetDto: ForgetPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    catch(err: any): void;
    loginV2(loginDto: LoginDto, res: Response): Promise<{
        accessToken: string;
    }>;
    logoutV2(req: Request, res: Response): Promise<{
        message: string;
    }>;
    refreshTokenV2(req: Request, res: Response): Promise<{
        accessToken: string;
    }>;
}
