import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  UnauthorizedException,
} from '@nestjs/common';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    response.status(401).json({
      success: false,
      errorCode: 401,
      message: exception.message || 'Access denied. Please login again.',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
