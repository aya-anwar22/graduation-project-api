"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonConfig = void 0;
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const nest_winston_1 = require("nest-winston");
const logDir = 'logs';
const enableConsoleLog = process.env.ENABLE_CONSOLE_LOGS === 'true';
const consoleFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.ms(), nest_winston_1.utilities.format.nestLike('MyApp', {
    colors: true,
    prettyPrint: true,
}));
const fileFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());
const allLogsTransport = new DailyRotateFile({
    filename: `${logDir}/application-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: fileFormat,
});
const errorLogsTransport = new DailyRotateFile({
    filename: `${logDir}/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: fileFormat,
});
const combinedLogsTransport = new DailyRotateFile({
    filename: `${logDir}/combined-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: fileFormat,
});
const httpLogsTransport = new DailyRotateFile({
    filename: `${logDir}/http-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    format: fileFormat,
});
const debugLogsTransport = new DailyRotateFile({
    filename: `${logDir}/debug-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
    level: 'debug',
    format: fileFormat,
});
const transports = [
    allLogsTransport,
    errorLogsTransport,
    combinedLogsTransport,
    httpLogsTransport,
    debugLogsTransport,
];
if (enableConsoleLog) {
    transports.push(new winston.transports.Console({
        format: consoleFormat,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }));
}
exports.winstonConfig = {
    transports,
    exceptionHandlers: [
        new winston.transports.File({
            filename: `${logDir}/exceptions.log`,
            format: fileFormat,
        }),
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: `${logDir}/rejections.log`,
            format: fileFormat,
        }),
    ],
};
//# sourceMappingURL=winston.config.js.map