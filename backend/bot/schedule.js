import cron from 'node-cron'
import { createBackup, cleanupOldBackups } from './backupService.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.join(__dirname, '..')

export function scheduleBackups(bot, adminId) {
  console.log('⏰ Настраиваю расписание бекапов...')
  
  // Ежедневный бекап в 02:00 UTC
  cron.schedule('0 2 * * *', async () => {
    console.log('🔄 Запуск ежедневного бекапа...')
    
    try {
      // Отправляем уведомление о начале бекапа
      await bot.sendMessage(adminId, '🔄 Запуск ежедневного бекапа...')
      
      // Создаем бекап
      const backupPath = await createBackup()
      
      if (backupPath) {
        // Отправляем файл
        const fileStream = fs.createReadStream(backupPath)
        await bot.sendDocument(adminId, fileStream, {
          caption: `📦 Ежедневный бекап KissBlow\n📅 ${new Date().toLocaleString('ru-RU')}\n💾 ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`
        })
        
        // Удаляем временный файл
        fs.unlinkSync(backupPath)
        
        // Очищаем старые бекапы
        cleanupOldBackups(7) // Оставляем только 7 последних
        
        await bot.sendMessage(adminId, '✅ Ежедневный бекап завершен!')
        console.log('✅ Ежедневный бекап завершен')
      } else {
        await bot.sendMessage(adminId, '❌ Ошибка создания ежедневного бекапа')
        console.log('❌ Ошибка создания ежедневного бекапа')
      }
    } catch (error) {
      console.error('❌ Ошибка ежедневного бекапа:', error)
      await bot.sendMessage(adminId, `❌ Ошибка ежедневного бекапа: ${error.message}`)
    }
  }, {
    timezone: 'UTC'
  })
  
  // Еженедельный бекап в воскресенье в 03:00 UTC
  cron.schedule('0 3 * * 0', async () => {
    console.log('🔄 Запуск еженедельного бекапа...')
    
    try {
      await bot.sendMessage(adminId, '🔄 Запуск еженедельного бекапа...')
      
      const backupPath = await createBackup()
      
      if (backupPath) {
        const fileStream = fs.createReadStream(backupPath)
        await bot.sendDocument(adminId, fileStream, {
          caption: `📦 Еженедельный бекап KissBlow\n📅 ${new Date().toLocaleString('ru-RU')}\n💾 ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`
        })
        
        fs.unlinkSync(backupPath)
        cleanupOldBackups(14) // Для еженедельных оставляем больше
        
        await bot.sendMessage(adminId, '✅ Еженедельный бекап завершен!')
        console.log('✅ Еженедельный бекап завершен')
      }
    } catch (error) {
      console.error('❌ Ошибка еженедельного бекапа:', error)
      await bot.sendMessage(adminId, `❌ Ошибка еженедельного бекапа: ${error.message}`)
    }
  }, {
    timezone: 'UTC'
  })
  
  // Проверка статуса каждые 6 часов
  cron.schedule('0 */6 * * *', async () => {
    try {
      const dbPath = path.join(PROJECT_ROOT, 'database.sqlite')
      const dbExists = fs.existsSync(dbPath)
      
      if (!dbExists) {
        await bot.sendMessage(adminId, '⚠️ ВНИМАНИЕ: База данных не найдена!')
      }
    } catch (error) {
      console.error('❌ Ошибка проверки статуса:', error)
    }
  })
  
  console.log('✅ Расписание бекапов настроено:')
  console.log('  📅 Ежедневно в 02:00 UTC')
  console.log('  📅 Еженедельно в воскресенье в 03:00 UTC')
  console.log('  🔍 Проверка статуса каждые 6 часов')
}

// Функция для ручного запуска бекапа
export async function runManualBackup(bot, adminId) {
  try {
    console.log('🔄 Запуск ручного бекапа...')
    
    await bot.sendMessage(adminId, '🔄 Создаю ручной бекап...')
    
    const backupPath = await createBackup()
    
    if (backupPath) {
      const fileStream = fs.createReadStream(backupPath)
      await bot.sendDocument(adminId, fileStream, {
        caption: `📦 Ручной бекап KissBlow\n📅 ${new Date().toLocaleString('ru-RU')}\n💾 ${(fs.statSync(backupPath).size / 1024 / 1024).toFixed(2)} MB`
      })
      
      fs.unlinkSync(backupPath)
      
      await bot.sendMessage(adminId, '✅ Ручной бекап завершен!')
      console.log('✅ Ручной бекап завершен')
    } else {
      await bot.sendMessage(adminId, '❌ Ошибка создания ручного бекапа')
    }
  } catch (error) {
    console.error('❌ Ошибка ручного бекапа:', error)
    await bot.sendMessage(adminId, `❌ Ошибка ручного бекапа: ${error.message}`)
  }
}
