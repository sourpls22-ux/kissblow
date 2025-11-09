const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
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
});

// Проверка соединения (только в development)
if (process.env.NODE_ENV !== 'production') {
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ SMTP Error:', error);
    } else {
      console.log('✅ SMTP Server is ready to take our messages');
    }
  });
}

module.exports = transporter
