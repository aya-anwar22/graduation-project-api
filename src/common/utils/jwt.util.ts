import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtUtil {
  private jwtService = new JwtService({});

  generateAccessToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: '100d',
    });
  }

  generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: '100d',
    });
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });
  }

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  getRefreshTokenFromCookie(req: any): string | null {
    return req.cookies?.refreshToken || null;
  }
}
