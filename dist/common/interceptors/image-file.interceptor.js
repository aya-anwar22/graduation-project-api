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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageFileInterceptor = ImageFileInterceptor;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const file_upload_constants_1 = require("../constants/file-upload.constants");
function ImageFileInterceptor(fieldName) {
    let ImageValidationInterceptor = class ImageValidationInterceptor {
        constructor() { }
        async intercept(context, next) {
            const ctx = context.switchToHttp();
            const request = ctx.getRequest();
            const file = request.file;
            if (file) {
                if (file.size > file_upload_constants_1.FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
                    throw new common_1.BadRequestException(`File size exceeds ${file_upload_constants_1.FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
                }
                if (!file_upload_constants_1.FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                    throw new common_1.BadRequestException(file_upload_constants_1.ERROR_MESSAGES.AR.INVALID_FILE_TYPE);
                }
                if (!file_upload_constants_1.FILE_UPLOAD_CONFIG.ALLOWED_MIME_REGEX.test(file.mimetype)) {
                    throw new common_1.BadRequestException(file_upload_constants_1.ERROR_MESSAGES.AR.INVALID_FILE_TYPE);
                }
            }
            return next.handle();
        }
    };
    ImageValidationInterceptor = __decorate([
        (0, common_1.Injectable)(),
        __metadata("design:paramtypes", [])
    ], ImageValidationInterceptor);
    return (0, platform_express_1.FileInterceptor)(fieldName, {
        limits: {
            fileSize: file_upload_constants_1.FILE_UPLOAD_CONFIG.MAX_FILE_SIZE,
        },
        fileFilter: (req, file, callback) => {
            if (!file_upload_constants_1.FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
                return callback(new common_1.BadRequestException(file_upload_constants_1.ERROR_MESSAGES.AR.INVALID_FILE_TYPE), false);
            }
            callback(null, true);
        },
    });
}
//# sourceMappingURL=image-file.interceptor.js.map