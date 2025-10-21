/**
 * Winston Logger Configuration
 * Professional logging system for production
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define which transports to use
const transports = [];

// Console transport (always enabled in development)
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Daily rotate file for all logs
transports.push(
  new DailyRotateFile({
    filename: path.join(__dirname, '../logs', 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat
  })
);

// Daily rotate file for error logs only
transports.push(
  new DailyRotateFile({
    level: 'error',
    filename: path.join(__dirname, '../logs', 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: logFormat
  })
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: logFormat,
  transports,
  exitOnError: false
});

// Create a stream for Morgan HTTP logger
logger.stream = {
  write: (message) => logger.http(message.trim())
};

// Helper functions for structured logging
export const logError = (error, context = {}) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context
  });
};

export const logInfo = (message, metadata = {}) => {
  logger.info({
    message,
    ...metadata
  });
};

export const logWarning = (message, metadata = {}) => {
  logger.warn({
    message,
    ...metadata
  });
};

export const logDebug = (message, metadata = {}) => {
  logger.debug({
    message,
    ...metadata
  });
};

export const logHttp = (req, res, responseTime) => {
  logger.http({
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

// Security logger for suspicious activities
export const securityLogger = winston.createLogger({
  level: 'warn',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(__dirname, '../logs', 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '90d',
      format: logFormat
    })
  ]
});

export const logSecurityEvent = (event, metadata = {}) => {
  securityLogger.warn({
    event,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};

// API logger for request/response tracking
export const apiLogger = winston.createLogger({
  level: 'http',
  format: logFormat,
  transports: [
    new DailyRotateFile({
      filename: path.join(__dirname, '../logs', 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '7d',
      format: logFormat
    })
  ]
});

export const logApiRequest = (req) => {
  apiLogger.http({
    type: 'request',
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: {
      'user-agent': req.get('user-agent'),
      'content-type': req.get('content-type')
    },
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
};

export const logApiResponse = (req, res, body, responseTime) => {
  apiLogger.http({
    type: 'response',
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    responseTime: `${responseTime}ms`,
    bodySize: JSON.stringify(body).length,
    timestamp: new Date().toISOString()
  });
};

export default logger;

