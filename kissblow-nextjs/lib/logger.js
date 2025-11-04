const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const path = require('path')

// Create logs directory if it doesn't exist
const logDir = path.join(process.cwd(), 'logs')
const fs = require('fs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`
    }
    return msg
  })
)

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'kissblow-api' },
  transports: [
    // Error logs
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Combined logs
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    
    // API request logs
    new DailyRotateFile({
      filename: path.join(logDir, 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    })
  ]
})

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }))
}

// Create specialized loggers
const apiLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'kissblow-api', type: 'api' },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'api-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    })
  ]
})

const errorLogger = winston.createLogger({
  level: 'error',
  format: logFormat,
  defaultMeta: { service: 'kissblow-api', type: 'error' },
  transports: [
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    })
  ]
})

// Helper functions
const logApiRequest = (req, res, responseTime) => {
  apiLogger.info('API Request', {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id || null
  })
}

const logApiError = (req, error, additionalInfo = {}) => {
  errorLogger.error('API Error', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    userId: req.user?.id || null,
    ...additionalInfo
  })
}

const logDatabaseError = (operation, error, query = null) => {
  errorLogger.error('Database Error', {
    operation,
    error: error.message,
    stack: error.stack,
    query: query ? query.substring(0, 200) + '...' : null
  })
}

const logFileOperation = (operation, filePath, success, error = null) => {
  const level = success ? 'info' : 'error'
  logger[level]('File Operation', {
    operation,
    filePath,
    success,
    error: error?.message || null
  })
}

module.exports = {
  logger,
  apiLogger,
  errorLogger,
  logApiRequest,
  logApiError,
  logDatabaseError,
  logFileOperation
}