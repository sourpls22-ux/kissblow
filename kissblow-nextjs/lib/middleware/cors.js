// CORS middleware for Next.js API routes
export function applyCors(handler) {
  return async (req, res) => {
    // Получаем разрешенные домены из переменных окружения
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['https://kissblow.me']
    
    const origin = req.headers.origin
    const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0]
    
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    // Call the actual handler
    return handler(req, res)
  }
}