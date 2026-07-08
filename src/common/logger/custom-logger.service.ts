import { Injectable, LoggerService, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger as WinstonLogger } from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  logRequest(method: string, url: string, userId?: string) {
    this.logger.info('HTTP Request', {
      method,
      url,
      userId,
      context: 'HTTPRequest',
    });
  }

  logDatabaseQuery(query: string, duration: number) {
    this.logger.debug('Database Query', {
      query,
      duration: `${duration}ms`,
      context: 'Database',
    });
  }

  logAuthEvent(event: string, userId: string, details?: any) {
    this.logger.info('Authentication Event', {
      event,
      userId,
      details,
      context: 'Auth',
    });
  }

  logBusinessLogic(action: string, data?: any) {
    this.logger.info('Business Logic', {
      action,
      data,
      context: 'BusinessLogic',
    });
  }
}
