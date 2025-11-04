export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    const db = new sqlite3.Database(dbPath)

    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
        if (err) reject(err)
        else resolve(user)
      })
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    // Generate new tokens
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, accountType: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const newRefreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    db.close()

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        accountType: user.account_type
      }
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({ error: 'Invalid refresh token' })
  }
}