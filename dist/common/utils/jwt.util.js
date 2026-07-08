"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const dotenv = require("dotenv");
dotenv.config();
let JwtUtil = class JwtUtil {
    jwtService = new jwt_1.JwtService({});
    generateAccessToken(payload) {
        return this.jwtService.sign(payload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: '100d',
        });
    }
    generateRefreshToken(payload) {
        return this.jwtService.sign(payload, {
            secret: process.env.REFRESH_TOKEN_SECRET,
            expiresIn: '100d',
        });
    }
    verifyAccessToken(token) {
        return this.jwtService.verify(token, {
            secret: process.env.ACCESS_TOKEN_SECRET,
        });
    }
    verifyRefreshToken(token) {
        return this.jwtService.verify(token, {
            secret: process.env.REFRESH_TOKEN_SECRET,
        });
    }
    setRefreshTokenCookie(res, refreshToken) {
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }
    clearRefreshTokenCookie(res) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });
    }
    getRefreshTokenFromCookie(req) {
        return req.cookies?.refreshToken || null;
    }
};
exports.JwtUtil = JwtUtil;
exports.JwtUtil = JwtUtil = __decorate([
    (0, common_1.Injectable)()
], JwtUtil);
//# sourceMappingURL=jwt.util.js.map