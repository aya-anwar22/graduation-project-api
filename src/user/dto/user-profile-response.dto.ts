export class UserProfileResponseDto {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  bio?: string;
  universityCode?: string;
  departmentId?: {
    _id: string;
    departmentName: string;
  };
  universityId?: {
    _id: string;
    universityName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class UpdateProfileResponseDto {
  message: string;
  data?: UserProfileResponseDto;
}
