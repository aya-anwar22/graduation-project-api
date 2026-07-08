import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const exceptionResponse: any = exception.getResponse();
    const validationErrors =
      Array.isArray(exceptionResponse.message) &&
      exceptionResponse.message.length > 0
        ? exceptionResponse.message
        : ['Invalid input data'];

    response.status(400).json({
      success: false,
      errorCode: 400,
      message: validationErrors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
