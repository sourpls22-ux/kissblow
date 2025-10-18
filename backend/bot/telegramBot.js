import TelegramBot from 'node-telegram-bot-api'
import cron from 'node-cron'
import { createBackup } from './backupService.js'
import { scheduleBackups } from './schedule.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Конфигурация
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7760908645:AAEZEDxzE14WEXtQk8AtgFzjNIhy6BuUXEc'
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '1119283257'
const PROJECT_ROOT = path.join(__dirname, '..')

// Создаем бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true })

// Проверяем, что бот запущен
console.log('🤖 Telegram Bot starting...')
console.log(`📱 Admin ID: ${ADMIN_ID}`)

// Обработка ошибок
bot.on('error', (error) => {
  console.error('❌ Bot error:', error)
})

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error)
})

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.')
    return
  }
  
  const welcomeMessage = `
🤖 *KissBlow Backup Bot*

Добро пожаловать! Этот бот создает автоматические бекапы вашего проекта.

*Доступные команды:*
/backup - Создать бекап сейчас
/status - Статус системы
/logs - Последние логи
/help - Помощь

*Автоматические бекапы:*
• Ежедневно в 02:00 UTC
• База данных + конфигурация
• Сжатие и отправка в Telegram
  `
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' })
})

// Команда /backup
bot.onText(/\/backup/, async (msg) => {
  const chatId = msg.chat.id
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.')
    return
  }
  
  try {
    bot.sendMessage(chatId, '🔄 Создаю бекап...')
    
    const backupPath = await createBackup()
    
    if (backupPath) {
      bot.sendMessage(chatId, '✅ Бекап создан! Отправляю файл...')
      
      // Отправляем файл
      const fileStream = fs.createReadStream(backupPath)
      await bot.sendDocument(chatId, fileStream, {
        caption: `📦 Бекап KissBlow\n📅 ${new Date().toLocaleString('ru-RU')}\n💾 ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`
      })
      
      // Удаляем временный файл
      fs.unlinkSync(backupPath)
      bot.sendMessage(chatId, '🗑️ Временный файл удален')
    } else {
      bot.sendMessage(chatId, '❌ Ошибка создания бекапа')
    }
  } catch (error) {
    console.error('Backup error:', error)
    bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`)
  }
})

// Команда /status
bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.')
    return
  }
  
  try {
    // Проверяем статус системы
    const dbPath = path.join(PROJECT_ROOT, 'database.sqlite')
    const dbExists = fs.existsSync(dbPath)
    const dbSize = dbExists ? (fs.statSync(dbPath).size / 1024 / 1024).toFixed(2) : 'N/A'
    
    const statusMessage = `
📊 *Статус системы KissBlow*

🗄️ База данных: ${dbExists ? '✅' : '❌'} (${dbSize} MB)
🤖 Бот: ✅ Работает
⏰ Последний бекап: ${getLastBackupTime()}
💾 Свободное место: ${getFreeSpace()}

*Сервисы:*
• Web Server: Проверьте PM2
• Database: ${dbExists ? 'OK' : 'Missing'}
• Bot: Running
    `
    
    bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' })
  } catch (error) {
    bot.sendMessage(chatId, `❌ Ошибка получения статуса: ${error.message}`)
  }
})

// Команда /logs
bot.onText(/\/logs/, async (msg) => {
  const chatId = msg.chat.id
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.')
    return
  }
  
  try {
    // Читаем последние логи
    const logPath = path.join(PROJECT_ROOT, '..', 'logs')
    const logFiles = fs.existsSync(logPath) ? fs.readdirSync(logPath) : []
    
    if (logFiles.length === 0) {
      bot.sendMessage(chatId, '📝 Логи не найдены')
      return
    }
    
    // Берем последний лог файл
    const latestLog = logFiles
      .filter(f => f.endsWith('.log'))
      .sort()
      .pop()
    
    if (latestLog) {
      const logContent = fs.readFileSync(path.join(logPath, latestLog), 'utf8')
      const lastLines = logContent.split('\n').slice(-20).join('\n')
      
      bot.sendMessage(chatId, `📝 *Последние логи:*\n\`\`\`\n${lastLines}\n\`\`\``, { 
        parse_mode: 'Markdown' 
      })
    } else {
      bot.sendMessage(chatId, '📝 Лог файлы не найдены')
    }
  } catch (error) {
    bot.sendMessage(chatId, `❌ Ошибка чтения логов: ${error.message}`)
  }
})

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.')
    return
  }
  
  const helpMessage = `
🆘 *Помощь по командам*

/start - Приветствие и основная информация
/backup - Создать бекап прямо сейчас
/status - Проверить статус системы
/logs - Показать последние логи
/help - Эта справка

*Автоматические бекапы:*
• Время: 02:00 UTC ежедневно
• Содержимое: База данных + конфигурация
• Формат: ZIP архив
• Отправка: В этот чат

*Безопасность:*
• Доступ только для администратора
• Бекапы отправляются только вам
• Временные файлы удаляются
  `
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' })
})

// Функции-помощники
function getLastBackupTime() {
  // Простая реализация - можно улучшить
  return 'Не отслеживается'
}

function getFreeSpace() {
  try {
    const stats = fs.statSync(PROJECT_ROOT)
    return 'Проверьте вручную'
  } catch {
    return 'N/A'
  }
}

// Запускаем планировщик бекапов
scheduleBackups(bot, ADMIN_ID)

// Уведомление о запуске
bot.sendMessage(ADMIN_ID, '🤖 KissBlow Backup Bot запущен! Используйте /help для справки.')

console.log('✅ Telegram Bot started successfully!')
