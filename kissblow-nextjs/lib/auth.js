const jwt = require('jsonwebtoken')

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

const authenticateToken = (handler) => async (req, res) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }
  
  try {
    const user = verifyToken(token)
    req.user = user
    return handler(req, res)
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

const authenticateAdmin = (handler) => async (req, res) => {
  const adminKey = req.headers['x-admin-key']
  const expectedKey = process.env.ADMIN_API_KEY
  
  if (!expectedKey) {
    console.error('ADMIN_API_KEY is not configured in environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }
  
  if (!adminKey || adminKey !== expectedKey) {
    return res.status(403).json({ error: 'Access denied. Invalid admin key.' })
  }
  
  return handler(req, res)
}

// Helper function to run middleware in Next.js API routes
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

// Configuration to disable body parser for specific routes (webhooks)
const disableBodyParser = {
  api: {
    bodyParser: false
  }
}

module.exports = { verifyToken, authenticateToken, authenticateAdmin, runMiddleware, disableBodyParser }