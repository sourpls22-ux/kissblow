// Import webhook verification utilities
const { verifyAtlosWebhook } = require('../../../lib/webhooks/verifyAtlos')
const getRawBody = require('../../../lib/webhooks/getRawBody')

// Disable body parser to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {
  // Direct file logging only in development
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const fs = await import('fs')
  const pathModule = await import('path')
  const logFile = pathModule.join(process.cwd(), 'logs', 'atlos-webhook-debug.log')
  const log = (msg, data = {}) => {
    if (!isDevelopment) return // Skip debug logs in production
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
    // WEBHOOK VERIFICATION - Must be done before processing
    const apiSecret = process.env.ATLOS_API_SECRET
    
    if (!apiSecret) {
      log('ATLOS_API_SECRET not configured')
      console.error('ATLOS_API_SECRET is not configured in environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Get raw body for signature verification
    const rawBody = await getRawBody(req)
    
    // Verify webhook signature
    const verification = verifyAtlosWebhook(
      { ...req, body: rawBody },
      apiSecret
    )

    if (!verification.valid) {
      log('Webhook verification failed', { 
        error: verification.error,
        hasSignature: !!(req.headers['signature'] || req.headers['Signature']),
        headers: Object.keys(req.headers)
      })
      console.warn('Webhook verification failed:', verification.error)
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid webhook signature'
      })
    }

    log('Webhook verified successfully')

    // Parse body after verification
    let body
    try {
      body = JSON.parse(rawBody)
    } catch (parseError) {
      log('Failed to parse webhook body', { error: parseError.message })
      return res.status(400).json({ error: 'Invalid JSON in request body' })
    }

    log('ATLOS WEBHOOK RECEIVED', { 
      orderId: body.OrderId || body.orderId,
      status: body.Status || body.status,
      headers: Object.keys(req.headers),
      method: req.method 
    })

    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)
    
    // Atlas sends OrderId (PascalCase) and Status as number
    const orderId = body.OrderId || body.orderId
    const statusCode = body.Status || body.status
    const amount = body.Amount || body.amount || body.PaidAmount
    
    // Convert status code to string (100 = completed/paid in Atlas)
    // Atlas status codes: 100 = completed/paid, 200 = confirmed, etc.
    let status = 'pending'
    if (statusCode === 100 || statusCode === '100') {
      status = 'completed'
    } else if (statusCode === 200 || statusCode === '200') {
      status = 'confirmed'
    } else if (statusCode === 300 || statusCode === '300') {
      status = 'success'
    } else if (typeof statusCode === 'string') {
      status = statusCode.toLowerCase()
    } else if (statusCode) {
      // If it's a number, try to map it
      status = String(statusCode)
    }
    
    log('Webhook data parsed', { 
      orderId, 
      statusCode, 
      status, 
      amount,
      transactionId: body.TransactionId,
      invoiceId: body.InvoiceId,
      rawBodyKeys: Object.keys(body)
    })
    // Логируем только в development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Received webhook for order: ${orderId}, status: ${status} (code: ${statusCode})`)
    }
    
    if (!orderId) {
      log('Order ID missing', { bodyKeys: Object.keys(body) })
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

      // Логируем только в development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`Added ${existingPayment.credit_amount} to user ${existingPayment.user_id} balance`)
      }
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