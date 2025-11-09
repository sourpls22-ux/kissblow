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
        PORT: 3000,
        TURNSTILE_SECRET_KEY: '0x4AAAAAAB55qsaYXMTML0UBUxGnVJv-DrQ',
        TURNSTILE_SITE_KEY: '0x4AAAAAAB55qr99duHk2JQk',
        ADMIN_API_KEY: 'a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f'
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
        TURNSTILE_SECRET_KEY: '0x4AAAAAAB55qsaYXMTML0UBUxGnVJv-DrQ',
        TURNSTILE_SITE_KEY: '0x4AAAAAAB55qr99duHk2JQk',
        ADMIN_API_KEY: 'a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f'
        FRONTEND_URL: 'https://kissblow.me',
        BACKEND_URL: 'https://kissblow.me',
        FROM_NAME: 'KissBlow',
        FROM_EMAIL: 'info@kissblow.me',
        SMTP_HOST: 'smtp.maileroo.com',
        SMTP_PORT: '587',
        SMTP_USER: 'info@kissblow.me',
        SMTP_PASS: 'fc2a921dc5121aa28db22736'
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
        ADMIN_API_KEY: 'a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f'
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
