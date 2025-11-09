export default async function handler(req, res) {
  let db = null
  
  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    const JWT_SECRET = process.env.JWT_SECRET
    const BOOST_COST = 1.0 // $1 for boost

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const user = jwt.verify(token, JWT_SECRET)
    req.user = user

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query

  // Check if profile exists and belongs to user
  db.get(
    'SELECT id, is_active FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      if (!profile.is_active) {
        return res.status(400).json({ error: 'Profile must be active to boost' })
      }

      // Check user balance
      db.get(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (user.balance < BOOST_COST) {
            return res.status(400).json({ 
              error: 'Insufficient balance',
              required: BOOST_COST,
              current: user.balance,
              insufficient: true
            })
          }

          // Deduct balance and boost profile
          const newBalance = user.balance - BOOST_COST
          const boostExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

          db.run(
            'UPDATE users SET balance = ? WHERE id = ?',
            [newBalance, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }

              // Add payment history record for boost
              db.run(
                'INSERT INTO payments (user_id, amount_to_pay, credit_amount, method, status) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, BOOST_COST, -BOOST_COST, 'profile_boost', 'completed'],
                (err) => {
                  if (err) {
                    console.error('Error recording boost payment:', err)
                  }
                }
              )

              // Update profile with boost
              db.run(
                'UPDATE profiles SET boost_expires_at = ?, last_payment_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                [boostExpiry.toISOString(), id, req.user.id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' })
                  }

                  // Clear profile lists cache first
                  if (typeof global.profileCache !== 'undefined') {
                    global.profileCache.clear()
                    console.log(`✅ Cleared profile lists cache for boosted profile ${id}`)
                  }

                  res.json({
                    message: 'Profile boosted successfully',
                    newBalance: newBalance,
                    boostExpiresAt: boostExpiry.toISOString()
                  })

                  // Trigger On-Demand Revalidation after response (non-blocking)
                  db.get('SELECT city FROM profiles WHERE id = ?', [id], async (err, profile) => {
                    if (!err && profile) {
                      try {
                        if (profile.city) {
                          const { revalidateProfileUpdates } = await import('../../../../lib/utils/revalidation.js')
                          const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                          await revalidateProfileUpdates(parseInt(id), citySlug)
                          console.log(`✅ Triggered revalidation for boosted profile ${id} in ${citySlug}`)
                        } else {
                          const { revalidateHomepage } = await import('../../../../lib/utils/revalidation.js')
                          await revalidateHomepage()
                          console.log(`✅ Triggered homepage revalidation for boosted profile ${id}`)
                        }
                      } catch (revalidationError) {
                        console.error('❌ Revalidation error (non-critical):', revalidationError)
                      }
                    }
                  })
                }
              )
            }
          )
        }
      )
    }
  )

  } catch (error) {
    console.error('Boost profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}
