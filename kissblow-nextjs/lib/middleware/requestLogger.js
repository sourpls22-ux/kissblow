const { logApiRequest, logApiError } = require('../logger')

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now()
  
  // Override res.end to capture response time
  const originalEnd = res.end
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime
    
    // Log the request
    logApiRequest(req, res, responseTime)
    
    // Call original end
    originalEnd.call(this, chunk, encoding)
  }
  
  // Override res.json to capture errors
  const originalJson = res.json
  res.json = function(obj) {
    // Log errors
    if (res.statusCode >= 400) {
      logApiError(req, new Error(`HTTP ${res.statusCode}: ${obj.error || obj.message || 'Unknown error'}`), {
        statusCode: res.statusCode,
        responseBody: obj
      })
    }
    
    return originalJson.call(this, obj)
  }
  
  next()
}

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logApiError(req, err, {
    statusCode: res.statusCode || 500
  })
  
  next(err)
}

module.exports = {
  requestLogger,
  errorLogger
}

