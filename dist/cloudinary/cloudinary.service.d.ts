import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    uploadImage(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse>;
    uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse>;
    deleteFile(publicId: string, resourceType?: 'image' | 'raw' | 'auto'): Promise<any>;
    deleteImage(publicId: string): Promise<any>;
    extractPublicId(fileUrl: string): string;
}
