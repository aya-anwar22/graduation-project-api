// src/common/interceptors/image-file.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  FILE_UPLOAD_CONFIG,
  ERROR_MESSAGES,
} from '../constants/file-upload.constants';

export function ImageFileInterceptor(fieldName: string) {
  @Injectable()
  class ImageValidationInterceptor implements NestInterceptor {
    constructor() {}

    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const ctx = context.switchToHttp();
      const request = ctx.getRequest();
      const file = request.file;

      // If file is uploaded, validate it
      if (file) {
        // Validate file size
        if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
          throw new BadRequestException(
            `File size exceeds ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`,
          );
        }

        // Validate MIME type
        if (!FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
          throw new BadRequestException(ERROR_MESSAGES.AR.INVALID_FILE_TYPE);
        }

        // Additional validation: check file extension
        if (!FILE_UPLOAD_CONFIG.ALLOWED_MIME_REGEX.test(file.mimetype)) {
          throw new BadRequestException(ERROR_MESSAGES.AR.INVALID_FILE_TYPE);
        }
      }

      return next.handle();
    }
  }

  // Return the FileInterceptor with the custom validation interceptor
  return FileInterceptor(fieldName, {
    limits: {
      fileSize: FILE_UPLOAD_CONFIG.MAX_FILE_SIZE,
    },
    fileFilter: (req, file, callback) => {
      if (!FILE_UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return callback(
          new BadRequestException(ERROR_MESSAGES.AR.INVALID_FILE_TYPE),
          false,
        );
      }
      callback(null, true);
    },
  });
}
