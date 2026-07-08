"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
let CloudinaryService = class CloudinaryService {
    async uploadImage(file, folder = 'user-profiles') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' },
                    { quality: 'auto' },
                    { fetch_format: 'auto' },
                ],
            }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result);
            });
            stream_1.Readable.from(file.buffer).pipe(uploadStream);
        });
    }
    async uploadFile(file, folder = 'project-documents') {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                folder: folder,
                resource_type: 'auto',
                access_mode: 'public',
            }, (error, result) => {
                if (error)
                    return reject(error);
                if (!result) {
                    return reject(new Error('Cloudinary upload failed: result is undefined'));
                }
                resolve(result);
            });
            uploadStream.end(file.buffer);
        });
    }
    async deleteFile(publicId, resourceType = 'raw') {
        return await cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    }
    async deleteImage(publicId) {
        return this.deleteFile(publicId, 'image');
    }
    extractPublicId(fileUrl) {
        try {
            const parts = fileUrl.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex === -1)
                return '';
            const pathParts = parts.slice(uploadIndex + 2);
            const fileNameWithExtension = pathParts.join('/');
            return fileNameWithExtension.replace(/\.[^/.]+$/, '');
        }
        catch (error) {
            console.error('Error extracting public_id:', error);
            return '';
        }
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map