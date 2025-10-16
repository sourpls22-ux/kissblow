module.exports = {
  apps: [{
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
  }]
}
