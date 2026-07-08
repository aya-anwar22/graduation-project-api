import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Unexpected error occurred';

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || 'Unexpected error occurred';

    const isDev = process.env.NODE_ENV !== 'production';

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      ...(isDev && {
        stack:
          exception instanceof Error ? exception.stack : 'No stack available',
      }),
    };

    // if (status >= 500) {
    //   this.logger.error(
    //     `Error ${status} on [${request.method}] ${request.url}: ${message}`,
    //     exception instanceof Error ? exception.stack : '',
    //   );
    // } else {
    //   this.logger.warn(
    //     `[${request.method}] ${request.url} - Status: ${status} - ${message}`,
    //   );
    // }

    response.status(status).json(errorResponse);
  }
}
