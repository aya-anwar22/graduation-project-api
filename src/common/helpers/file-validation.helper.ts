// src/common/helpers/file-validation.helper.ts
import { BadRequestException } from '@nestjs/common';
import {
  FILE_UPLOAD_CONFIG,
  ERROR_MESSAGES,
} from '../constants/file-upload.constants';

export class FileValidationHelper {
  static validateImageFile(file: Express.Multer.File): void {
    if (!file) return;

    // Check file size
    if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      );
    }

    // Check mime type
    if (!FILE_UPLOAD_CONFIG.ALLOWED_MIME_REGEX.test(file.mimetype)) {
      throw new BadRequestException(ERROR_MESSAGES.AR.INVALID_FILE_TYPE);
    }
  }

  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }
}
