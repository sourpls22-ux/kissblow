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
} else {
  // Add console transport for production errors only
  logger.add(new winston.transports.Console({
    level: 'error', // Only log errors to console in production
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`
        if (meta.error) {
          msg += `\nError: ${meta.error}`
        }
        if (meta.stack) {
          msg += `\nStack: ${meta.stack}`
        }
        if (Object.keys(meta).length > 0) {
          msg += `\nMeta: ${JSON.stringify(meta, null, 2)}`
        }
        return msg
      })
    )
  }))
  
  // Also add console transport for errorLogger
  errorLogger.add(new winston.transports.Console({
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`
        if (meta.error) {
          msg += `\nError: ${meta.error}`
        }
        if (meta.stack) {
          msg += `\nStack: ${meta.stack}`
        }
        if (Object.keys(meta).length > 0) {
          msg += `\nMeta: ${JSON.stringify(meta, null, 2)}`
        }
        return msg
      })
    )
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
  const errorData = {
    method: req?.method || 'UNKNOWN',
    url: req?.url || 'UNKNOWN',
    error: error?.message || String(error),
    stack: error?.stack || (error instanceof Error ? error.stack : 'No stack trace'),
    userId: req?.user?.id || null,
    ip: req?.ip || req?.connection?.remoteAddress || null,
    ...additionalInfo
  }
  
  errorLogger.error('API Error', errorData)
  
  // Дополнительно логируем в основной logger для консоли в продакшн
  logger.error('API Error', errorData)
}

const logDatabaseError = (operation, error, query = null) => {
  const errorData = {
    operation,
    error: error?.message || String(error),
    stack: error?.stack || (error instanceof Error ? error.stack : 'No stack trace'),
    query: query ? query.substring(0, 200) + '...' : null
  }
  
  errorLogger.error('Database Error', errorData)
  
  // Дополнительно логируем в основной logger для консоли в продакшн
  logger.error('Database Error', errorData)
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