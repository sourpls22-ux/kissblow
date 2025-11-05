const { logger, logApiError } = require('../logger')

/**
 * Обработчик ошибок для API роутов
 * В продакшн логирует полную информацию, но возвращает безопасный ответ
 */
const handleApiError = (error, req, res, operation = 'API operation') => {
  // Логируем полную информацию об ошибке
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    operation,
    url: req?.url,
    method: req?.method,
    body: req?.body ? JSON.stringify(req.body).substring(0, 500) : null,
    query: req?.query,
    params: req?.params
  }

  // Логируем в файлы и консоль
  logApiError(req, error, errorDetails)
  logger.error(`${operation} failed:`, errorDetails)

  // В продакшн возвращаем безопасный ответ, но с ID ошибки для отслеживания
  const errorId = Date.now().toString(36)
  logger.error(`Error ID: ${errorId}`, errorDetails)

  // В зависимости от типа ошибки возвращаем соответствующий статус
  const statusCode = error.statusCode || error.status || 500

  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    errorId: process.env.NODE_ENV === 'production' ? errorId : undefined,
    ...(process.env.NODE_ENV !== 'production' && {
      stack: error.stack,
      details: errorDetails
    })
  })
}

module.exports = { handleApiError }

