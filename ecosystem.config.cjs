module.exports = {
  apps: [
    {
      name: 'kissblow-backend',
      script: './backend/server.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      // Автоматический перезапуск при сбоях
      autorestart: true,
      // Максимальное количество перезапусков
      max_restarts: 10,
      // Время ожидания перед перезапуском
      min_uptime: '10s',
      // Максимальное использование памяти (в МБ)
      max_memory_restart: '1G',
      // Переменные окружения для production
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        FRONTEND_URL: 'https://kissblow.me',
        BACKEND_URL: 'https://kissblow.me',
        JWT_SECRET: '97bb471b4bfcf5d6aa352e11b506793b490be3bfc86fdabd9ebf561e324be2f9',
        ATLOS_MERCHANT_ID: 'OAK1D092DB',
        ATLOS_API_SECRET: '4VWilRiqpcJugiHmAZw22hNtTrPyFpCR',
        FROM_NAME: 'KissBlow',
        FROM_EMAIL: 'info@kissblow.me',
        SMTP_HOST: 'smtp.maileroo.com',
        SMTP_PORT: '587',
        SMTP_USER: 'info@kissblow.me',
        SMTP_PASS: 'fc2a921dc5121aa28db22736',
        TURNSTILE_SECRET_KEY: '0x4AAAAAAB55qsf9O0xRE1LdFIiEjgACTqY',
        TURNSTILE_SITE_KEY: '0x4AAAAAAB55qr99duHk2JQk',
        DB_PATH: './database.sqlite'
      }
    },
    {
      name: 'kissblow-backup-bot',
      script: './backend/bot/telegramBot.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/backup-bot-err.log',
      out_file: './logs/backup-bot-out.log',
      log_file: './logs/backup-bot-combined.log',
      time: true,
      // Автоматический перезапуск при сбоях
      autorestart: true,
      // Максимальное количество перезапусков
      max_restarts: 10,
      // Время ожидания перед перезапуском
      min_uptime: '10s',
      // Максимальное использование памяти (в МБ)
      max_memory_restart: '512M',
      // Переменные окружения для бота бекапов
      env_production: {
        NODE_ENV: 'production',
        TELEGRAM_BOT_TOKEN: '7760908645:AAEZEDxzE14WEXtQk8AtgFzjNIhy6BuUXEc',
        ADMIN_TELEGRAM_ID: '1119283257'
      }
    },
    {
      name: 'kissblow-verification-bot',
      script: './backend/bot/verificationBot.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/verification-bot-err.log',
      out_file: './logs/verification-bot-out.log',
      log_file: './logs/verification-bot-combined.log',
      time: true,
      // Автоматический перезапуск при сбоях
      autorestart: true,
      // Максимальное количество перезапусков
      max_restarts: 10,
      // Время ожидания перед перезапуском
      min_uptime: '10s',
      // Максимальное использование памяти (в МБ)
      max_memory_restart: '512M',
      // Переменные окружения для бота верификации
      env_production: {
        NODE_ENV: 'production',
        TELEGRAM_BOT_TOKEN: '7762390260:AAHBTsEZXFl1VL200pZO54qicwuEKomhnYY',
        ADMIN_TELEGRAM_ID: '1119283257',
        BACKEND_URL: 'https://kissblow.me'
      }
    }
  ]
}
