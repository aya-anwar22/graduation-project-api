import * as winston from 'winston';
export declare const winstonConfig: {
    transports: winston.transport[];
    exceptionHandlers: winston.transports.FileTransportInstance[];
    rejectionHandlers: winston.transports.FileTransportInstance[];
};
