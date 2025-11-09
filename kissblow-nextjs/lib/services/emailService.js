// Dynamic import to avoid webpack issues in Next.js
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Dynamic import for nodemailer
    const nodemailer = await import('nodemailer')
    
    // Create transporter dynamically
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true для порта 465, false для 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    })
    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    
    // Максимально простое письмо - только текст с эмодзи
    const htmlTemplate = `🔐To reset your password, click this link: ${resetUrl}`
    
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: 'Reset Your Password - KissBlow',
      text: htmlTemplate,
      html: htmlTemplate,
      encoding: 'utf8'
    }
    
    const result = await transporter.sendMail(mailOptions)
    console.log('✅ Password reset email sent:', result.messageId)
    return result
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    throw error
  }
}

export { sendPasswordResetEmail }