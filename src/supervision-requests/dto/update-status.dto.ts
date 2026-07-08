import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateRequestStatusDto {
  @IsNotEmpty()
  @IsEnum(['approved', 'rejected', 'under_review'])
  status: 'approved' | 'rejected' | 'under_review';
}
