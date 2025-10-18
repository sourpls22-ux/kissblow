import TelegramBot from 'node-telegram-bot-api'
import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import { adminCommands } from './adminCommands.js'
import { adminDatabase } from './adminDatabase.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Конфигурация
const BOT_TOKEN = process.env.ADMIN_BOT_TOKEN || '8121854368:AAHa8qYZd69sMAPNOsWxgdeNasIdobUDyWI'
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '1119283257'
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'database.sqlite')

// Создаем бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true })

// Подключаемся к базе данных
const db = new sqlite3.Database(DB_PATH)

// Проверяем, что бот запущен
console.log('🔧 Admin Bot starting...')
console.log(`📱 Admin ID: ${ADMIN_ID}`)

// Проверка прав доступа
const isAdmin = (userId) => {
  return userId.toString() === ADMIN_ID.toString()
}

// Главное меню
const showMainMenu = (chatId) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '👥 Пользователи', callback_data: 'admin_users' },
          { text: '📋 Анкеты', callback_data: 'admin_profiles' }
        ],
        [
          { text: '⭐ Ревью', callback_data: 'admin_reviews' },
          { text: '❤️ Лайки', callback_data: 'admin_likes' }
        ],
        [
          { text: '📊 Статистика', callback_data: 'admin_stats' },
          { text: '❓ Помощь', callback_data: 'admin_help' }
        ]
      ]
    }
  }
  
  bot.sendMessage(chatId, '🔧 *Админ-панель KissBlow*\n\nВыберите раздел для управления:', {
    parse_mode: 'Markdown',
    ...keyboard
  })
}

// Обработка команд
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ У вас нет прав доступа к админ-панели.')
    return
  }
  
  showMainMenu(chatId)
})

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id
  
  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ У вас нет прав доступа к админ-панели.')
    return
  }
  
  const helpText = `
🔧 *Админ-панель KissBlow*

*Основные команды:*
/start - Главное меню
/help - Эта справка

*Управление пользователями:*
• Просмотр списка пользователей
• Удаление аккаунтов
• Изменение баланса
• Блокировка/разблокировка

*Управление анкетами:*
• Просмотр всех анкет
• Удаление анкет
• Активация/деактивация
• Верификация/отмена верификации

*Управление ревью:*
• Просмотр ревью по анкетам
• Удаление ревью

*Управление лайками:*
• Изменение количества лайков
• Просмотр статистики

*Статистика:*
• Общая статистика системы
• Статистика пользователей
• Статистика анкет
  `
  
  bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' })
})

// Обработка callback запросов
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id
  const userId = callbackQuery.from.id
  const data = callbackQuery.data
  
  if (!isAdmin(userId)) {
    bot.answerCallbackQuery(callbackQuery.id, '❌ Нет прав доступа')
    return
  }
  
  try {
    await bot.answerCallbackQuery(callbackQuery.id)
    
    switch (data) {
      case 'admin_users':
        await adminCommands.showUsersMenu(bot, chatId, db)
        break
      case 'admin_profiles':
        await adminCommands.showProfilesMenu(bot, chatId, db)
        break
      case 'admin_reviews':
        await adminCommands.showReviewsMenu(bot, chatId, db)
        break
      case 'admin_likes':
        await adminCommands.showLikesMenu(bot, chatId, db)
        break
      case 'admin_stats':
        await adminCommands.showStats(bot, chatId, db)
        break
      case 'admin_help':
        await adminCommands.showHelp(bot, chatId)
        break
      case 'back_to_main':
        showMainMenu(chatId)
        break
      default:
        // Обработка других callback данных
        if (data.startsWith('user_')) {
          await adminCommands.handleUserAction(bot, chatId, data, db)
        } else if (data.startsWith('profile_')) {
          await adminCommands.handleProfileAction(bot, chatId, data, db)
        } else if (data.startsWith('review_')) {
          await adminCommands.handleReviewAction(bot, chatId, data, db)
        } else if (data.startsWith('like_')) {
          await adminCommands.handleLikeAction(bot, chatId, data, db)
        }
        break
    }
  } catch (error) {
    console.error('Error handling callback:', error)
    bot.sendMessage(chatId, '❌ Произошла ошибка при обработке запроса.')
  }
})

// Обработка текстовых сообщений (для ввода данных)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const userId = msg.from.id
  const text = msg.text
  
  if (!isAdmin(userId)) {
    return
  }
  
  // Пропускаем команды
  if (text.startsWith('/')) {
    return
  }
  
  // Здесь можно добавить обработку ввода данных для различных операций
  // Например, ввод ID пользователя, суммы баланса и т.д.
})

// Обработка ошибок
bot.on('error', (error) => {
  console.error('Bot error:', error)
})

bot.on('polling_error', (error) => {
  console.error('Polling error:', error)
})

console.log('✅ Admin Bot started successfully!')
