export default async function handler(req, res) {
  let db = null
  
  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    const JWT_SECRET = process.env.JWT_SECRET
    const ACTIVATION_COST = 1.0 // $1 for activation

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
    'SELECT id, is_active, boost_expires_at, city FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      if (profile.is_active) {
        return res.status(400).json({ error: 'Profile is already active' })
      }

      // Check if profile is still boosted (within 24 hours)
      if (profile.boost_expires_at) {
        const boostExpiry = new Date(profile.boost_expires_at)
        const now = new Date()
        if (boostExpiry > now) {
          // Profile is still boosted, activate without payment
          db.run(
            'UPDATE profiles SET is_active = 1 WHERE id = ? AND user_id = ?',
            [id, req.user.id],
            async (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }
              
              // Trigger revalidation for boosted profile activation
              try {
                // Clear profile lists cache first
                try {
                  const { cacheInvalidation } = await import('../../../../lib/cache/decorators.js')
                  cacheInvalidation.invalidateProfileLists()
                  console.log(`✅ Cleared profile lists cache for boosted activated profile ${id}`)
                } catch (cacheErr) {
                  console.error('❌ Cache invalidation error:', cacheErr)
                }
                
                const { revalidateProfileUpdates } = await import('../../../../lib/utils/revalidation.js')
                if (profile.city) {
                  const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  await revalidateProfileUpdates(id, citySlug)
                  console.log(`✅ Triggered revalidation for boosted activated profile ${id} in ${citySlug}`)
                } else {
                  const { revalidateHomepage } = await import('../../../../lib/utils/revalidation.js')
                  await revalidateHomepage()
                  console.log(`✅ Triggered homepage revalidation for boosted activated profile ${id}`)
                }
              } catch (revalidationError) {
                console.error('❌ Revalidation error:', revalidationError)
              }
              
              res.json({
                message: 'Profile activated successfully (boosted)'
              })
            }
          )
          return
        }
      }

      // Check user balance
      db.get(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (user.balance < ACTIVATION_COST) {
            return res.status(400).json({ 
              error: 'Insufficient balance',
              required: ACTIVATION_COST,
              current: user.balance,
              insufficient: true
            })
          }

          // Deduct balance and activate profile
          const newBalance = user.balance - ACTIVATION_COST
          const boostExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

          db.run(
            'UPDATE users SET balance = ? WHERE id = ?',
            [newBalance, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }

              // Add payment history record for activation
              db.run(
                'INSERT INTO payments (user_id, amount_to_pay, credit_amount, method, status) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, ACTIVATION_COST, -ACTIVATION_COST, 'profile_activation', 'completed'],
                (err) => {
                  if (err) {
                    console.error('Error recording activation payment:', err)
                  }
                }
              )

              // Update profile with boost
              db.run(
                'UPDATE profiles SET is_active = 1, boost_expires_at = ?, last_payment_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                [boostExpiry.toISOString(), id, req.user.id],
                async (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' })
                  }

                  // Trigger On-Demand Revalidation for profile pages
                  try {
                    // Clear profile lists cache first
                    if (typeof global.profileCache !== 'undefined') {
                      global.profileCache.clear()
                      console.log(`✅ Cleared profile lists cache for activated profile ${id}`)
                    }
                    
                    const { revalidateProfileUpdates } = await import('../../../../lib/utils/revalidation.js')
                    if (profile.city) {
                      const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                      await revalidateProfileUpdates(id, citySlug) // Правильный порядок: profileId, city
                      console.log(`✅ Triggered revalidation for activated profile ${id} in ${citySlug}`)
                    } else {
                      // Если city нет, ревалидируем только главную страницу
                      const { revalidateHomepage } = await import('../../../../lib/utils/revalidation.js')
                      await revalidateHomepage()
                      console.log(`✅ Triggered homepage revalidation for activated profile ${id}`)
                    }
                  } catch (revalidationError) {
                    console.error('❌ Revalidation error:', revalidationError)
                    // Don't fail the request if revalidation fails
                  }

                  res.json({
                    message: 'Profile activated successfully',
                    newBalance: newBalance,
                    boostExpiresAt: boostExpiry.toISOString()
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
    console.error('Activate profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}
