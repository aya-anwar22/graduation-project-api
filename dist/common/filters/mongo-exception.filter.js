"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const mongodb_1 = require("mongodb");
let MongoExceptionFilter = class MongoExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception.code === 11000) {
            response.status(409).json({
                success: false,
                errorCode: 409,
                message: 'User with this email already exists',
                timestamp: new Date().toISOString(),
            });
        }
        else {
            response.status(500).json({
                success: false,
                errorCode: 500,
                message: exception.message || 'Database error occurred',
                timestamp: new Date().toISOString(),
            });
        }
    }
};
exports.MongoExceptionFilter = MongoExceptionFilter;
exports.MongoExceptionFilter = MongoExceptionFilter = __decorate([
    (0, common_1.Catch)(mongodb_1.MongoServerError)
], MongoExceptionFilter);
//# sourceMappingURL=mongo-exception.filter.js.map