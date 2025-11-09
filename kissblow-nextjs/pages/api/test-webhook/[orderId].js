export default async function handler(req, res) {
  let db = null
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    const JWT_SECRET = process.env.JWT_SECRET

    // Auth middleware
    const authenticateToken = (req, res) => {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        return res.status(401).json({ error: 'Access token required' })
      }

      jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json({ error: 'Invalid token' })
        }
        req.user = user
        return null // Continue processing
      })
    }

    authenticateToken(req, res)

    const { orderId } = req.params
    const { status = 'completed', amount } = req.body
    
    // Логируем только в development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Simulating webhook for order: ${orderId}, status: ${status}`)
    }
    
    // Update payment status
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE payments SET status = ? WHERE payment_id = ?',
        [status, orderId],
        function(err) {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    // If payment is completed, add balance to user
    if (status === 'completed') {
      const payment = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM payments WHERE payment_id = ?',
          [orderId],
          (err, payment) => {
            if (err) reject(err)
            else resolve(payment)
          }
        )
      })

      if (payment) {
        // Add credit amount to user balance
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE users SET balance = balance + ? WHERE id = ?',
            [payment.credit_amount, payment.user_id],
            function(err) {
              if (err) reject(err)
              else resolve()
            }
          )
        })

        // Логируем только в development
        if (process.env.NODE_ENV !== 'production') {
          console.log(`Added ${payment.credit_amount} to user ${payment.user_id} balance`)
        }
      }
    }

    res.json({ 
      success: true, 
      message: 'Test webhook processed successfully',
      orderId,
      status
    })

  } catch (error) {
    console.error('Test webhook error:', error)
    res.status(500).json({ error: 'Test webhook processing failed' })
  } finally {
    if (db) {
      db.close()
    }
  }
}