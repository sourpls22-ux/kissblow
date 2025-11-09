import { verifyTurnstileToken } from '../../lib/utils/turnstile.js'

// Отправка email
async function sendContactEmail({ name, email, category, message, urls }) {
  // Dynamic import to avoid webpack issues
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true для 465, false для других портов
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const categoryLabels = {
    copyright: 'Copyright Infringement',
    privacy: 'Privacy Concern', 
    impersonation: 'Impersonation',
    underage: 'Underage Content',
    other: 'Other'
  }

  const emailSubject = `Contact/DMCA Form: ${categoryLabels[category] || category}`
  
  const emailText = `
New contact form submission:

Name: ${name}
Email: ${email}
Category: ${categoryLabels[category] || category}
Message: ${message}
${urls && urls.length > 0 ? `URLs: ${urls.join('\n')}` : ''}

Submitted at: ${new Date().toISOString()}
  `.trim()

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        New Contact/DMCA Form Submission
      </h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Category:</strong> ${categoryLabels[category] || category}</p>
        <p><strong>Message:</strong></p>
        <div style="background: white; padding: 15px; border-radius: 3px; border-left: 4px solid #007bff;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        ${urls && urls.length > 0 ? `
          <p><strong>URLs:</strong></p>
          <ul>
            ${urls.map(url => `<li><a href="${url}" target="_blank">${url}</a></li>`).join('')}
          </ul>
        ` : ''}
      </div>
      
      <div style="color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 10px;">
        Submitted at: ${new Date().toLocaleString()}
      </div>
    </div>
  `

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: process.env.FROM_EMAIL, // Отправляем на тот же email
    subject: emailSubject,
    text: emailText,
    html: emailHtml,
  }

  await transporter.sendMail(mailOptions)
}

export default async function handler(req, res) {
  // Direct file logging
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'contact-dmca-debug.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  log('CONTACT/DMCA API CALLED', { method: req.method, url: req.url })

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Извлекаем данные из тела запроса
    const { name, email, category, message, urls, turnstileToken } = req.body

    log('Received request body', {
      hasName: !!name,
      hasEmail: !!email,
      emailPrefix: email ? email.substring(0, 20) + '...' : 'missing',
      category: category || 'missing',
      hasMessage: !!message,
      messageLength: message ? message.length : 0,
      urlsCount: Array.isArray(urls) ? urls.length : 0,
      hasTurnstileToken: !!turnstileToken,
      turnstileTokenLength: turnstileToken ? turnstileToken.length : 0
    })

    // Валидация обязательных полей
    if (!name || !email || !message || !turnstileToken) {
      log('Missing required fields', { hasName: !!name, hasEmail: !!email, hasMessage: !!message, hasTurnstileToken: !!turnstileToken })
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Name, email, message, and Turnstile token are required'
      })
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      log('Invalid email format', { email: email.substring(0, 20) })
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Валидация длины полей
    if (name.length < 2 || name.length > 100) {
      log('Invalid name length', { nameLength: name.length })
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' })
    }

    if (message.length < 10 || message.length > 5000) {
      log('Invalid message length', { messageLength: message.length })
      return res.status(400).json({ error: 'Message must be between 10 and 5000 characters' })
    }

    // Верификация Turnstile токена
    log('Verifying Turnstile token', {
      tokenLength: turnstileToken.length,
      tokenPrefix: turnstileToken.substring(0, 30) + '...',
      hasSecretKey: !!process.env.TURNSTILE_SECRET_KEY
    })
    
    const turnstileResult = await verifyTurnstileToken(turnstileToken)
    
    log('Turnstile verification result', {
      success: turnstileResult.success,
      errorCodes: turnstileResult.errorCodes || [],
      error: turnstileResult.error || null
    })
    
    if (!turnstileResult.success) {
      log('Turnstile verification failed', {
        errorCodes: turnstileResult.errorCodes,
        error: turnstileResult.error
      })
      return res.status(400).json({ 
        error: 'Turnstile verification failed',
        details: turnstileResult.errorCodes || [turnstileResult.error]
      })
    }

    log('Turnstile verified successfully')

    // Отправка email
    log('Sending contact email', {
      email: email.substring(0, 20) + '...',
      category: category || 'other',
      toEmail: process.env.FROM_EMAIL,
      hasSMTPConfig: !!(process.env.SMTP_HOST && process.env.SMTP_USER)
    })
    
    try {
      await sendContactEmail({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        category: category || 'other',
        message: message.trim(),
        urls: Array.isArray(urls) ? urls.filter(url => url.trim()) : []
      })
      log('Contact email sent successfully', { email: email.substring(0, 20) + '...', toEmail: process.env.FROM_EMAIL })
    } catch (emailError) {
      log('Error sending contact email', {
        error: emailError.message,
        stack: emailError.stack,
        email: email.substring(0, 20) + '...'
      })
      throw emailError
    }

    // Логирование успешной отправки
    console.log(`Contact form submitted successfully: ${email} - ${category}`)
    log('Contact form submitted successfully', { email: email.substring(0, 20) + '...', category })

    return res.status(200).json({ 
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    log('ERROR in contact handler', {
      error: error.message,
      stack: error.stack,
      name: error.name
    })
    
    console.error('Contact API error:', error)
    console.error(`Contact form error: ${error.message}`)
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to send message. Please try again later.'
    })
  }
}
