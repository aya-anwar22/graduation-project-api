import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { MongoServerError } from 'mongodb';

@Catch(MongoServerError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoServerError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.code === 11000) {
      response.status(409).json({
        success: false,
        errorCode: 409,
        message: 'User with this email already exists',
        timestamp: new Date().toISOString(),
      });
    } else {
      response.status(500).json({
        success: false,
        errorCode: 500,
        message: exception.message || 'Database error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
