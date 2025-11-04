export default async function handler(req, res) {
  let db = null
  
  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    const JWT_SECRET = process.env.JWT_SECRET
    const ATLOS_MERCHANT_ID = process.env.ATLOS_MERCHANT_ID

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const user = jwt.verify(token, JWT_SECRET)
    req.user = user

    // Create Atlos payment function
    const createAtlosPayment = async (amount, userId) => {
      try {
        // Generate unique order ID
        const orderId = `kissblow_${userId}_${Date.now()}`
        
        // Create payment data for Atlos
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        const webhookUrl = process.env.BACKEND_URL || 'http://localhost:3000'
        
        const paymentData = {
          merchantId: ATLOS_MERCHANT_ID,
          orderId: orderId,
          orderAmount: amount,
          orderCurrency: 'USD',
          onSuccess: `${baseUrl}/dashboard?payment=success&orderId=${orderId}`,
          onCanceled: `${baseUrl}/topup?payment=canceled&orderId=${orderId}`,
          onCompleted: `${baseUrl}/dashboard?payment=completed&orderId=${orderId}`,
          webhookUrl: `${webhookUrl}/api/webhooks/atlos`,
          description: `Top up balance for user ${userId}`,
          customerEmail: 'user@example.com',
          paymentMethod: 'crypto',
          cryptoCurrency: 'USDT',
          network: 'TRON',
          showPaymentDetails: true,
          autoGenerateAddress: true
        }

        // Save payment to database with pending status
        return new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO payments (user_id, amount_to_pay, credit_amount, payment_id, status) VALUES (?, ?, ?, ?, ?)',
            [userId, amount, amount, orderId, 'pending'],
            function(err) {
              if (err) {
                reject(err)
              } else {
                // Create payment URL for Atlos
                const paymentUrl = `https://atlos.io/pay?merchantId=${ATLOS_MERCHANT_ID}&orderId=${orderId}&orderAmount=${amount}&orderCurrency=USD&onSuccess=${encodeURIComponent(paymentData.onSuccess)}&onCanceled=${encodeURIComponent(paymentData.onCanceled)}`
                
                resolve({
                  id: orderId,
                  payment_url: paymentUrl,
                  payment_data: paymentData
                })
              }
            }
          )
        })
      } catch (error) {
        console.error('Error creating Atlos payment:', error)
        throw error
      }
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { amount, creditAmount, method } = req.body

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    // Only crypto payments supported
    const payment = await createAtlosPayment(amount, req.user.id)
    
    // Payment data is already saved in createAtlosPayment
    
    res.json({
      message: 'Payment created successfully',
      payment_url: payment.payment_url,
      payment_id: payment.id,
      payment_data: payment.payment_data,
      amount: amount,
      credit_amount: creditAmount || amount
    })

  } catch (error) {
    console.error('Top up error:', error)
    res.status(500).json({ error: 'Payment creation failed' })
  } finally {
    if (db) {
      db.close()
    }
  }
}