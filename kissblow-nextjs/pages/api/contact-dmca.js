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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Import Turnstile verification (CommonJS module)
  const { verifyTurnstileToken } = require('../../../lib/utils/turnstile.js')

  try {
    // Извлекаем данные из тела запроса
    const { name, email, category, message, urls, turnstileToken } = req.body

    // Валидация обязательных полей
    if (!name || !email || !message || !turnstileToken) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Name, email, message, and Turnstile token are required'
      })
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Валидация длины полей
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' })
    }

    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ error: 'Message must be between 10 and 5000 characters' })
    }

    // Верификация Turnstile токена
    const isHuman = await verifyTurnstileToken(turnstileToken)
    if (!isHuman) {
      return res.status(400).json({ error: 'Turnstile verification failed' })
    }

    // Отправка email
    await sendContactEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      category: category || 'other',
      message: message.trim(),
      urls: Array.isArray(urls) ? urls.filter(url => url.trim()) : []
    })

    // Логирование успешной отправки
    console.log(`Contact form submitted successfully: ${email} - ${category}`)

    return res.status(200).json({ 
      success: true,
      message: 'Message sent successfully'
    })

  } catch (error) {
    console.error('Contact API error:', error)
    
    // Логирование ошибки
    console.error(`Contact form error: ${error.message}`)
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to send message. Please try again later.'
    })
  }
}
