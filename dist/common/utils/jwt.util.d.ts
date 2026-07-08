import { Response } from 'express';
export declare class JwtUtil {
    private jwtService;
    generateAccessToken(payload: any): string;
    generateRefreshToken(payload: any): string;
    verifyAccessToken(token: string): any;
    verifyRefreshToken(token: string): any;
    setRefreshTokenCookie(res: Response, refreshToken: string): void;
    clearRefreshTokenCookie(res: Response): void;
    getRefreshTokenFromCookie(req: any): string | null;
}
