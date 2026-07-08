import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateProjectStatusDto {
  @IsNotEmpty({ message: 'حالة المشروع مطلوبة' })
  @IsIn(['in_progress', 'completed', 'start'], {
    message: 'الحالة يجب أن تكون إما start أو in_progress أو completed',
  })
  status: 'in_progress' | 'completed' | 'start';
}
