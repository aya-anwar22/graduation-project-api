import { LoggerService } from '@nestjs/common';
import { Logger as WinstonLogger } from 'winston';
export declare class CustomLogger implements LoggerService {
    private readonly logger;
    constructor(logger: WinstonLogger);
    log(message: string, context?: string): void;
    error(message: string, trace?: string, context?: string): void;
    warn(message: string, context?: string): void;
    debug(message: string, context?: string): void;
    verbose(message: string, context?: string): void;
    logRequest(method: string, url: string, userId?: string): void;
    logDatabaseQuery(query: string, duration: number): void;
    logAuthEvent(event: string, userId: string, details?: any): void;
    logBusinessLogic(action: string, data?: any): void;
}
