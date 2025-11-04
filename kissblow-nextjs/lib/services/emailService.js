const transporter = require('../config/email')
const fs = require('fs')
const path = require('path')

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
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

module.exports = { sendPasswordResetEmail }