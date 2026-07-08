import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    response.status(404).json({
      success: false,
      errorCode: 404,
      message: exception.message || 'This route does not exist',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
