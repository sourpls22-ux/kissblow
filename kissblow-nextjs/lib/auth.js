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
  const expectedKey = process.env.ADMIN_API_KEY || 'a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f'
  
  if (adminKey !== expectedKey) {
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