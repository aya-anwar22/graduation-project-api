import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const logDir = 'logs';
const enableConsoleLog = process.env.ENABLE_CONSOLE_LOGS === 'true';

// Custom format for console
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('MyApp', {
    colors: true,
    prettyPrint: true,
  }),
);

// Custom format for files
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Transport for all logs
const allLogsTransport = new DailyRotateFile({
  filename: `${logDir}/application-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Transport for error logs
const errorLogsTransport = new DailyRotateFile({
  filename: `${logDir}/error-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: fileFormat,
});

// Transport for combined logs (info and above)
const combinedLogsTransport = new DailyRotateFile({
  filename: `${logDir}/combined-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info',
  format: fileFormat,
});

// Transport for HTTP requests
const httpLogsTransport = new DailyRotateFile({
  filename: `${logDir}/http-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  format: fileFormat,
});

// Transport for debug logs
const debugLogsTransport = new DailyRotateFile({
  filename: `${logDir}/debug-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '7d',
  level: 'debug',
  format: fileFormat,
});

// Build transports array
const transports: winston.transport[] = [
  allLogsTransport,
  errorLogsTransport,
  combinedLogsTransport,
  httpLogsTransport,
  debugLogsTransport,
];

// Add console transport only if enabled
if (enableConsoleLog) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),
  );
}

export const winstonConfig = {
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
