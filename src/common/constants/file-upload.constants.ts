// src/common/constants/file-upload.constants.ts
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  ALLOWED_MIME_REGEX: /\/(jpg|jpeg|png|gif|webp)$/,
  FOLDERS: {
    USER_PROFILES: 'user-profiles',
    PROJECT_FILES: 'project-files',
  },
};

export const ERROR_MESSAGES = {
  AR: {
    INVALID_ID: 'معرف غير صحيح',
    USER_NOT_FOUND: 'المستخدم غير موجود',
    ACCOUNT_DELETED: 'تم حذف حساب المستخدم',
    CANNOT_UPDATE_DELETED: 'لا يمكن تحديث حساب محذوف',
    UPLOAD_FAILED: 'فشل رفع الصورة',
    INVALID_FILE_TYPE: 'يُسمح فقط بملفات الصور (JPG, PNG, GIF, WEBP)',
    PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  },
  EN: {
    INVALID_ID: 'Invalid ID',
    USER_NOT_FOUND: 'User not found',
    ACCOUNT_DELETED: 'Account has been deleted',
    CANNOT_UPDATE_DELETED: 'Cannot update deleted account',
    UPLOAD_FAILED: 'Failed to upload image',
    INVALID_FILE_TYPE: 'Only image files are allowed (JPG, PNG, GIF, WEBP)',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
};
