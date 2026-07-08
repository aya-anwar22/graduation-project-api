"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidationHelper = void 0;
const common_1 = require("@nestjs/common");
const file_upload_constants_1 = require("../constants/file-upload.constants");
class FileValidationHelper {
    static validateImageFile(file) {
        if (!file)
            return;
        if (file.size > file_upload_constants_1.FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
            throw new common_1.BadRequestException(`File size exceeds ${file_upload_constants_1.FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        if (!file_upload_constants_1.FILE_UPLOAD_CONFIG.ALLOWED_MIME_REGEX.test(file.mimetype)) {
            throw new common_1.BadRequestException(file_upload_constants_1.ERROR_MESSAGES.AR.INVALID_FILE_TYPE);
        }
    }
    static getFileExtension(filename) {
        return filename.split('.').pop()?.toLowerCase() || '';
    }
}
exports.FileValidationHelper = FileValidationHelper;
//# sourceMappingURL=file-validation.helper.js.map