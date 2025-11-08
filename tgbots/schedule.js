import cron from 'node-cron'
import { createBackup, cleanupOldBackups } from './backupService.js'
import fs from 'fs'
import path from 'path'

/**
 * Планировщик автоматических бекапов
 * @param {TelegramBot} bot - Экземпляр Telegram бота
 * @param {string} adminId - ID администратора для отправки уведомлений
 */
export function scheduleBackups(bot, adminId) {
  console.log('📅 Настраиваю планировщик бекапов...')
  
  // Ежедневный бекап в 02:00 UTC
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🔄 Запуск автоматического бекапа...')
      
      // Отправляем уведомление о начале бекапа
      await bot.sendMessage(adminId, '🔄 Начинаю автоматический бекап...')
      
      // Создаем бекап
      const backupPath = await createBackup()
      
      if (backupPath && fs.existsSync(backupPath)) {
        const fileSize = fs.statSync(backupPath).size
        const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2)
        
        // Если файл меньше 50MB, отправляем в Telegram
        if (fileSize < 50 * 1024 * 1024) {
          const fileStream = fs.createReadStream(backupPath)
          await bot.sendDocument(adminId, fileStream, {
            caption: `📦 Автоматический бекап KissBlow\n📅 ${new Date().toLocaleString('ru-RU')}\n💾 ${fileSizeMB} MB`
          })
          
          // Удаляем файл после отправки
          fs.unlinkSync(backupPath)
          await bot.sendMessage(adminId, '✅ Бекап создан и отправлен! Временный файл удален.')
        } else {
          // Если файл большой, просто уведомляем
          await bot.sendMessage(
            adminId,
            `✅ Бекап создан!\n📁 Путь: ${backupPath}\n💾 Размер: ${fileSizeMB} MB\n⚠️ Файл слишком большой для отправки через Telegram.`
          )
        }
        
        // Очищаем старые бекапы (оставляем последние 7)
        cleanupOldBackups(7)
      } else {
        await bot.sendMessage(adminId, '❌ Ошибка: бекап не был создан')
      }
    } catch (error) {
      console.error('❌ Ошибка автоматического бекапа:', error)
      await bot.sendMessage(adminId, `❌ Ошибка создания бекапа: ${error.message}`)
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  })
  
  console.log('✅ Планировщик бекапов настроен: ежедневно в 02:00 UTC')
}

