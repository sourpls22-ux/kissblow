import TelegramBot from 'node-telegram-bot-api'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Конфигурация
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7762390260:AAHBTsEZXFl1VL200pZO54qicwuEKomhnYY'
const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || '1119283257'
const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Создаем бота
const bot = new TelegramBot(BOT_TOKEN, { polling: true })

// Проверяем, что бот запущен
console.log('🔍 Verification Bot starting...')
console.log(`📱 Admin ID: ${ADMIN_ID}`)

// Обработка ошибок
bot.on('error', (error) => {
  console.error('❌ Verification Bot error:', error)
})

bot.on('polling_error', (error) => {
  console.error('❌ Verification Bot polling error:', error)
})

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.')
    return
  }
  
  const welcomeMessage = `
🔍 *KissBlow Verification Bot*

Добро пожаловать! Этот бот предназначен для модерации верификаций профилей.

*Доступные команды:*
/verifications - Показать ожидающие верификации
/help - Помощь

*Функции:*
• Просмотр заявок на верификацию
• Одобрение/отклонение через кнопки
• Просмотр фото профиля и фото с кодом
  `
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' })
})

// Функция для отправки одной верификации
const sendSingleVerification = async (chatId, verification) => {
  const message = `
🔍 *VERIFICATION REQUEST #${verification.id}*
👤 ${verification.name}, ${verification.age}, ${verification.city}
📅 ${new Date(verification.created_at).toLocaleString('ru-RU')}
🔢 Код: *${verification.verification_code}*

👤 Пользователь: ${verification.user_email}
💰 Баланс: $${verification.balance || 0}
📸 Фото профиля: ${verification.profile_media ? verification.profile_media.length : 0}
📸 Фото верификации: ${verification.verification_photo_filename ? 'Да' : 'Нет'}
  `
  
  // Собираем все фото для отправки одним сообщением
  const photos = []
  
  // Добавляем все фото профиля
  if (verification.profile_media && verification.profile_media.length > 0) {
    for (const media of verification.profile_media) {
      try {
        const photoPath = path.join(__dirname, '..', media.filename)
        if (fs.existsSync(photoPath)) {
          photos.push({
            type: 'photo',
            media: fs.createReadStream(photoPath),
            caption: photos.length === 0 ? `📸 Profile Photos` : undefined
          })
        }
      } catch (error) {
        console.error('Error adding profile photo:', error)
      }
    }
  }
  
  // Добавляем основное фото профиля, если есть
  if (verification.main_photo_filename) {
    try {
      const mainPhotoPath = path.join(__dirname, '..', verification.main_photo_filename)
      if (fs.existsSync(mainPhotoPath)) {
        photos.push({
          type: 'photo',
          media: fs.createReadStream(mainPhotoPath),
          caption: photos.length === 0 ? `📸 Main Profile Photo` : undefined
        })
      }
    } catch (error) {
      console.error('Error adding main profile photo:', error)
    }
  }
  
  // Добавляем фото верификации
  if (verification.verification_photo_filename) {
    try {
      const verificationPhotoPath = path.join(__dirname, '..', 'uploads', 'verifications', verification.verification_photo_filename)
      if (fs.existsSync(verificationPhotoPath)) {
        photos.push({
          type: 'photo',
          media: fs.createReadStream(verificationPhotoPath),
          caption: photos.length === 0 ? `📸 Verification Photo` : undefined
        })
      }
    } catch (error) {
      console.error('Error adding verification photo:', error)
    }
  }
  
  // Отправляем кнопки
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `verify_approve_${verification.id}` },
        { text: '❌ Reject', callback_data: `verify_reject_${verification.id}` }
      ]
    ]
  }
  
  if (photos.length > 0) {
    // Отправляем все фото одним сообщением
    try {
      await bot.sendMediaGroup(chatId, photos)
      
      // Отправляем кнопки отдельным сообщением
      bot.sendMessage(chatId, 'Выберите действие:', { 
        reply_markup: keyboard 
      })
    } catch (error) {
      console.error('Error sending media group:', error)
      // Fallback: отправляем текстовое сообщение с кнопками
      bot.sendMessage(chatId, message, { 
        parse_mode: 'Markdown',
        reply_markup: keyboard
      })
    }
  } else {
    // Если нет фото, отправляем только текстовое сообщение с кнопками
    bot.sendMessage(chatId, message, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard
    })
  }
}

// Команда /verifications
bot.onText(/\/verifications/, async (msg) => {
  const chatId = msg.chat.id
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.')
    return
  }
  
  try {
    // Получаем список ожидающих верификаций
    const response = await axios.get(`${API_BASE_URL}/api/admin/verifications`, {
      headers: {
        'X-Admin-Key': process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345'
      }
    })
    const verifications = response.data
    
    if (verifications.length === 0) {
      bot.sendMessage(chatId, '✅ Нет ожидающих верификаций')
      return
    }
    
    // Показываем только первую верификацию
    const verification = verifications[0]
    await sendSingleVerification(chatId, verification)
    
  } catch (error) {
    console.error('Verifications error:', error)
    bot.sendMessage(chatId, `❌ Ошибка получения верификаций: ${error.message}`)
  }
})

// Обработка callback кнопок верификации
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id
  const data = callbackQuery.data
  
  if (chatId.toString() !== ADMIN_ID) {
    bot.answerCallbackQuery(callbackQuery.id, { text: '❌ У вас нет доступа' })
    return
  }
  
  try {
    if (data === 'view_verifications') {
      // Обработка кнопки "Посмотреть"
      const chatId = callbackQuery.message.chat.id
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/verifications`, {
          headers: {
            'X-Admin-Key': process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345'
          }
        })
        const verifications = response.data
        
        if (verifications.length === 0) {
          bot.sendMessage(chatId, '✅ Нет ожидающих верификаций')
        } else {
          // Показываем первую верификацию
          await sendSingleVerification(chatId, verifications[0])
        }
      } catch (error) {
        console.error('Verifications error:', error)
        bot.sendMessage(chatId, `❌ Ошибка получения верификаций: ${error.message}`)
      }
      
      bot.answerCallbackQuery(callbackQuery.id, { text: '📋 Загружаю верификации...' })
      return
    }
    
    if (data.startsWith('verify_approve_')) {
      const verificationId = data.replace('verify_approve_', '')
      
      await axios.post(`${API_BASE_URL}/api/admin/verifications/${verificationId}/approve`, {}, {
        headers: {
          'X-Admin-Key': process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345'
        }
      })
      
      bot.answerCallbackQuery(callbackQuery.id, { text: '✅ Верификация одобрена!' })
      
      // Показываем следующую верификацию или сообщение об отсутствии
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/verifications`, {
          headers: { 'X-Admin-Key': process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345' }
        })
        
        if (response.data.length === 0) {
          bot.sendMessage(chatId, '✅ Нет ожидающих верификаций')
        } else {
          // Показываем следующую верификацию
          await sendSingleVerification(chatId, response.data[0])
        }
      } catch (error) {
        console.error('Error checking remaining verifications:', error)
      }
      
      bot.editMessageText(
        `✅ Верификация #${verificationId} одобрена!`,
        { 
          chat_id: chatId, 
          message_id: callbackQuery.message.message_id 
        }
      )
      
    } else if (data.startsWith('verify_reject_')) {
      const verificationId = data.replace('verify_reject_', '')
      
      await axios.post(`${API_BASE_URL}/api/admin/verifications/${verificationId}/reject`, {}, {
        headers: {
          'X-Admin-Key': process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345'
        }
      })
      
      bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Верификация отклонена!' })
      
      // Показываем следующую верификацию или сообщение об отсутствии
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/verifications`, {
          headers: { 'X-Admin-Key': process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345' }
        })
        
        if (response.data.length === 0) {
          bot.sendMessage(chatId, '✅ Нет ожидающих верификаций')
        } else {
          // Показываем следующую верификацию
          await sendSingleVerification(chatId, response.data[0])
        }
      } catch (error) {
        console.error('Error checking remaining verifications:', error)
      }
      
      bot.editMessageText(
        `❌ Верификация #${verificationId} отклонена!`,
        { 
          chat_id: chatId, 
          message_id: callbackQuery.message.message_id 
        }
      )
    }
  } catch (error) {
    console.error('Callback error:', error)
    bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Ошибка обработки' })
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
🆘 *Помощь по командам верификации*

/start - Приветствие и основная информация
/verifications - Показать ожидающие верификации
/help - Эта справка

*Процесс модерации:*
• Просмотр заявки с фото профиля и фото с кодом
• Сравнение кода на фото с кодом в заявке
• Одобрение или отклонение через кнопки
• Автоматическое обновление статуса профиля

*Безопасность:*
• Доступ только для администратора
• Все действия логируются
• Фото верификации хранятся на сервере
  `
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' })
})

// Уведомление о запуске
bot.sendMessage(ADMIN_ID, '🔍 KissBlow Verification Bot запущен! Используйте /help для справки.')

console.log('✅ Verification Bot started successfully!')
