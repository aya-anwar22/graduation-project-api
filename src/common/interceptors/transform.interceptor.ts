import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // إذا كانت البيانات تحتوي بالفعل على meta أو stats، نرجعها كما هي مع إضافة success و message
        if (data && (data.meta || data.stats)) {
          return {
            success: data.success ?? true,
            message: data.message || 'Request successful',
            stats: data.stats, // تظهر في المستوى الأول
            meta: data.meta, // تظهر في المستوى الأول
            data: data.data, // البيانات الفعلية
            timestamp: new Date().toISOString(),
          };
        }

        // للـ APIs العادية اللي بترجع array أو object بسيط
        return {
          success: data?.success ?? true,
          message: data?.message || 'Request successful',
          data: data?.data ?? data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
