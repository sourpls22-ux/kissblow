export default async function handler(req, res) {
  // Direct file logging
  const fs = await import('fs')
  const pathModule = await import('path')
  const logFile = pathModule.join(process.cwd(), 'logs', 'atlos-webhook-debug.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  let db = null
  
  if (req.method !== 'POST') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    log('ATLOS WEBHOOK RECEIVED', { 
      body: req.body, 
      headers: Object.keys(req.headers),
      method: req.method 
    })

    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)
    
    const { orderId, status, amount } = req.body
    
    log('Webhook data parsed', { orderId, status, amount })
    console.log(`Received webhook for order: ${orderId}, status: ${status}`)
    
    if (!orderId) {
      log('Order ID missing')
      return res.status(400).json({ error: 'Order ID is required' })
    }

    // Get payment record first to check current status
    const existingPayment = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM payments WHERE payment_id = ?',
        [orderId],
        (err, payment) => {
          if (err) {
            log('Database error fetching payment', { error: err.message })
            reject(err)
          } else {
            resolve(payment)
          }
        }
      )
    })

    if (!existingPayment) {
      log('Payment not found', { orderId })
      return res.status(404).json({ error: 'Payment not found' })
    }

    log('Payment found', { 
      paymentId: existingPayment.id,
      userId: existingPayment.user_id,
      currentStatus: existingPayment.status,
      creditAmount: existingPayment.credit_amount
    })

    // Update payment status
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE payments SET status = ? WHERE payment_id = ?',
        [status, orderId],
        function(err) {
          if (err) {
            log('Error updating payment status', { error: err.message })
            reject(err)
          } else {
            log('Payment status updated', { 
              status, 
              changes: this.changes 
            })
            resolve()
          }
        }
      )
    })

    // Check if payment should be processed (completed, paid, success, confirmed)
    const completedStatuses = ['completed', 'paid', 'success', 'confirmed', 'successful']
    const shouldProcess = completedStatuses.includes(status?.toLowerCase())
    
    log('Status check', { 
      status, 
      shouldProcess, 
      currentPaymentStatus: existingPayment.status 
    })

    // Only process if status indicates completion AND balance hasn't been added yet
    if (shouldProcess && existingPayment.status !== 'completed') {
      log('Processing payment completion', { 
        orderId, 
        userId: existingPayment.user_id,
        creditAmount: existingPayment.credit_amount 
      })

      // Get current user balance before update
      const userBefore = await new Promise((resolve, reject) => {
        db.get(
          'SELECT balance FROM users WHERE id = ?',
          [existingPayment.user_id],
          (err, user) => {
            if (err) {
              log('Error fetching user balance', { error: err.message })
              reject(err)
            } else {
              resolve(user)
            }
          }
        )
      })

      if (!userBefore) {
        log('User not found', { userId: existingPayment.user_id })
        return res.status(404).json({ error: 'User not found' })
      }

      log('User balance before update', { 
        userId: existingPayment.user_id,
        balanceBefore: userBefore.balance 
      })

      // Add credit amount to user balance
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET balance = balance + ? WHERE id = ?',
          [existingPayment.credit_amount, existingPayment.user_id],
          function(err) {
            if (err) {
              log('Error updating user balance', { error: err.message })
              reject(err)
            } else {
              log('User balance updated', { 
                userId: existingPayment.user_id,
                creditAmount: existingPayment.credit_amount,
                changes: this.changes 
              })
              resolve()
            }
          }
        )
      })

      // Get updated balance to verify
      const userAfter = await new Promise((resolve, reject) => {
        db.get(
          'SELECT balance FROM users WHERE id = ?',
          [existingPayment.user_id],
          (err, user) => {
            if (err) {
              log('Error fetching updated balance', { error: err.message })
              reject(err)
            } else {
              resolve(user)
            }
          }
        )
      })

      log('Balance update completed', {
        userId: existingPayment.user_id,
        balanceBefore: userBefore.balance,
        balanceAfter: userAfter.balance,
        creditAmount: existingPayment.credit_amount,
        expectedBalance: userBefore.balance + existingPayment.credit_amount
      })

      // Update payment status to completed to prevent duplicate processing
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE payments SET status = ? WHERE payment_id = ?',
          ['completed', orderId],
          function(err) {
            if (err) {
              log('Error setting payment to completed', { error: err.message })
              reject(err)
            } else {
              log('Payment marked as completed', { changes: this.changes })
              resolve()
            }
          }
        )
      })

      console.log(`Added ${existingPayment.credit_amount} to user ${existingPayment.user_id} balance`)
    } else {
      log('Payment not processed', { 
        reason: shouldProcess ? 'Already completed' : 'Status not completed',
        currentStatus: existingPayment.status,
        receivedStatus: status
      })
    }

    res.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      orderId,
      status
    })
  } catch (error) {
    log('WEBHOOK ERROR', { 
      error: error.message, 
      stack: error.stack,
      name: error.name 
    })
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  } finally {
    if (db) {
      log('Closing database connection')
      db.close()
    }
  }
}