export default async function handler(req, res) {
  let db = null
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)
    
    const { orderId, status, amount } = req.body
    
    console.log(`Received webhook for order: ${orderId}, status: ${status}`)
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' })
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

        console.log(`Added ${payment.credit_amount} to user ${payment.user_id} balance`)
      }
    }

    res.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      orderId,
      status
    })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  } finally {
    if (db) {
      db.close()
    }
  }
}