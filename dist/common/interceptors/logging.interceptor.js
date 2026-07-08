"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
let LoggingInterceptor = class LoggingInterceptor {
    logger = new common_1.Logger('HTTP');
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, body } = request;
        const userAgent = request.get('user-agent') || '';
        const now = Date.now();
        this.logger.log(`Incoming Request: ${method} ${url} - IP: ${ip} - User Agent: ${userAgent}`);
        if (body && Object.keys(body).length > 0) {
            const sanitizedBody = this.sanitizeBody(body);
            this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: (data) => {
                const response = context.switchToHttp().getResponse();
                const { statusCode } = response;
                const delay = Date.now() - now;
                this.logger.log(`Response: ${method} ${url} ${statusCode} - ${delay}ms`);
            },
            error: (error) => {
                const response = context.switchToHttp().getResponse();
                const statusCode = error.status || 500;
                const delay = Date.now() - now;
                this.logger.error(`Error Response: ${method} ${url} ${statusCode} - ${delay}ms`);
                this.logger.error(`Error: ${error.message}`);
            },
        }));
    }
    sanitizeBody(body) {
        const sensitiveFields = [
            'password',
            'confirmPassword',
            'token',
            'refreshToken',
            'accessToken',
            'secret',
            'apiKey',
        ];
        const sanitized = { ...body };
        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        }
        return sanitized;
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map