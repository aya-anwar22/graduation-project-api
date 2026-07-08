import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifiyDto } from './dto/verifiy-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(signupDto: SignupDto): Promise<{
        message: string;
    }>;
    verifyEmail(verifiyDto: VerifiyDto): Promise<{
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    forgetPassword(forgetDto: ForgetPasswordDto): Promise<{
        message: string;
    }>;
    logout(logoutDto: LogoutDto): Promise<{
        message: string;
    }>;
    resetPassword(resetDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    refreshToken(refreshDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
export declare class AuthV2Controller {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, res: any): Promise<{
        accessToken: string;
    }>;
    logout(req: any, res: any): Promise<{
        message: string;
    }>;
    refreshToken(req: any, res: any): Promise<{
        accessToken: string;
    }>;
}
