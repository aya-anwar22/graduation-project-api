import { Injectable, BadRequestException } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'user-profiles',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'project-documents',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'auto',
          access_mode: 'public',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) {
            return reject(
              new Error('Cloudinary upload failed: result is undefined'),
            );
          }
          resolve(result);
        },
      );
      uploadStream.end(file.buffer);
    });
  }
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' | 'auto' = 'raw',
  ): Promise<any> {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return this.deleteFile(publicId, 'image'); // هنا المشكلة لو deleteFile بتاخد باراميتر واحد
  }

  extractPublicId(fileUrl: string): string {
    try {
      const parts = fileUrl.split('/');
      const uploadIndex = parts.indexOf('upload');

      if (uploadIndex === -1) return '';

      const pathParts = parts.slice(uploadIndex + 2);
      const fileNameWithExtension = pathParts.join('/');

      return fileNameWithExtension.replace(/\.[^/.]+$/, '');
    } catch (error) {
      console.error('Error extracting public_id:', error);
      return '';
    }
  }
}
