module.exports = {
  apps: [
    {
      name: 'kissblow-nextjs',
      script: 'npm',
      args: 'start',
      cwd: './kissblow-nextjs',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/nextjs-err.log',
      out_file: './logs/nextjs-out.log',
      log_file: './logs/nextjs-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        TURNSTILE_SECRET_KEY: '0x4AAAAAAB55qsf900xRE1LdFiiEjgACTqY',
        TURNSTILE_SITE_KEY: '0x4AAAAAAB55qr99duHk2JQk'
        // Все остальные переменные будут браться из .env.production
      }
    },
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
        TURNSTILE_SECRET_KEY: '0x4AAAAAAB55qsf900xRE1LdFiiEjgACTqY',
        TURNSTILE_SITE_KEY: '0x4AAAAAAB55qr99duHk2JQk',
        DB_PATH: './database.sqlite',
        TELEGRAM_BOT_TOKEN: '7762390260:AAHBTsEZXFl1VL200pZO54qicwuEKomhnYY',
        ADMIN_TELEGRAM_ID: '1119283257'
      }
    },
    {
      name: 'telegram-verification-bot',
      script: 'tgbots/verificationBot.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        TELEGRAM_BOT_TOKEN: '7762390260:AAHBTsEZXFl1VL200pZO54qicwuEKomhnYY',
        ADMIN_TELEGRAM_ID: '1119283257',
        BACKEND_URL: 'https://kissblow.me',
        ADMIN_API_KEY: 'kissblow-admin-2024-verification-bot-key-12345'
      },
      error_file: './logs/telegram-verification-bot-err.log',
      out_file: './logs/telegram-verification-bot-out.log',
      log_file: './logs/telegram-verification-bot-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'telegram-backup-bot',
      script: 'tgbots/telegramBot.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        TELEGRAM_BOT_TOKEN: '7760908645:AAEZEDxzE14WEXtQk8AtgFzjNIhy6BuUXEc',
        ADMIN_TELEGRAM_ID: '1119283257'
      },
      error_file: './logs/telegram-backup-bot-err.log',
      out_file: './logs/telegram-backup-bot-out.log',
      log_file: './logs/telegram-backup-bot-combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    }
  ]
}
