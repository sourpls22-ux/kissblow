export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  console.log('=== REGISTER API CALLED ===')
  console.log('Request method:', req.method)
  console.log('Request body keys:', Object.keys(req.body || {}))
  console.log('Turnstile token present:', !!req.body?.turnstileToken)

  let db = null
  try {
    // Dynamic import to avoid webpack issues
    const bcrypt = await import('bcryptjs')
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    const { validateEmail, validatePassword, validateName, validateTurnstileToken, sanitizeString } = await import('../../../lib/validation/schemas.js')
    const { verifyTurnstileToken } = await import('../../../lib/utils/turnstile.js')
    
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    const { email, password, name, accountType, turnstileToken } = req.body

    console.log('Register request body:', { email, password, name, accountType, turnstileToken: turnstileToken ? 'present' : 'missing' })

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be between 6 and 100 characters' })
    }

    if (!validateName(name)) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters' })
    }

    if (turnstileToken && !validateTurnstileToken(turnstileToken)) {
      return res.status(400).json({ error: 'Invalid security token' })
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email).toLowerCase()
    const sanitizedName = sanitizeString(name)

    // Verify Turnstile token
    if (turnstileToken) {
      console.log('=== Turnstile Verification Debug ===')
      console.log('Token (first 30 chars):', turnstileToken.substring(0, 30))
      console.log('TURNSTILE_SECRET_KEY exists:', !!process.env.TURNSTILE_SECRET_KEY)
      console.log('TURNSTILE_SECRET_KEY value:', process.env.TURNSTILE_SECRET_KEY ? process.env.TURNSTILE_SECRET_KEY.substring(0, 30) + '...' : 'NOT SET')
      console.log('NODE_ENV:', process.env.NODE_ENV)
      
      const turnstileResult = await verifyTurnstileToken(turnstileToken)
      console.log('Turnstile verification result:', turnstileResult)
      console.log('=== End Turnstile Debug ===')
      
      if (!turnstileResult) {
        console.log('Turnstile verification FAILED')
        return res.status(400).json({ 
          error: 'Security verification failed',
          details: 'Please complete the security challenge correctly'
        })
      }
      console.log('Turnstile verification SUCCESS')
    } else {
      console.log('No Turnstile token provided')
    }

    // Check if user already exists
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [sanitizedEmail], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }

    // Hash password
    const bcryptLib = bcrypt.default || bcrypt
    const hashedPassword = await bcryptLib.hash(password, 10)

    // Create user
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name, account_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [sanitizedEmail, hashedPassword, sanitizedName, accountType || 'member'],
        function(err) {
          if (err) reject(err)
          else resolve({ lastID: this.lastID, changes: this.changes })
        }
      )
    })

    // Generate tokens
    const jwtLib = jwt.default || jwt
    const accessToken = jwtLib.sign(
      { id: result.lastID, email: sanitizedEmail, accountType },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwtLib.sign(
      { id: result.lastID },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user: {
        id: result.lastID,
        email: sanitizedEmail,
        name: sanitizedName,
        accountType
      }
    })

  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    res.status(500).json({ 
      error: 'Internal server error',
      errorId: process.env.NODE_ENV === 'production' ? Date.now().toString(36) : undefined
    })
  } finally {
    if (db) {
      db.close()
    }
  }
}
