import fs from 'fs-extra'
import archiver from 'archiver'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Путь к корню проекта (на уровень выше tgbots)
const PROJECT_ROOT = path.join(__dirname, '..')
// Путь к kissblow-nextjs
const NEXTJS_ROOT = path.join(PROJECT_ROOT, 'kissblow-nextjs')
const BACKUP_DIR = path.join(PROJECT_ROOT, 'backups')

// Создаем папку для бекапов если её нет
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

export async function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupFileName = `kissblow-backup-${timestamp}.zip`
  const backupPath = path.join(BACKUP_DIR, backupFileName)
  
  console.log(`🔄 Создаю бекап: ${backupFileName}`)
  
  try {
    // Создаем ZIP архив
    const output = fs.createWriteStream(backupPath)
    const archive = archiver('zip', { zlib: { level: 9 } })
    
    return new Promise((resolve, reject) => {
      output.on('close', () => {
        console.log(`✅ Бекап создан: ${backupPath} (${archive.pointer()} bytes)`)
        resolve(backupPath)
      })
      
      archive.on('error', (err) => {
        console.error('❌ Ошибка архивирования:', err)
        reject(err)
      })
      
      archive.pipe(output)
      
      // Добавляем файлы в архив
      addFilesToArchive(archive)
      
      // Завершаем архивирование
      archive.finalize()
    })
  } catch (error) {
    console.error('❌ Ошибка создания бекапа:', error)
    throw error
  }
}

function addFilesToArchive(archive) {
  console.log('📁 Добавляю файлы в архив...')
  
  // База данных SQLite - содержит ВСЕ данные:
  //    - users (аккаунты, балансы)
  //    - profiles (профили и их информация)
  //    - reviews (отзывы)
  //    - payments (payment history - история платежей)
  //    - media (ссылки на медиафайлы)
  //    - profile_verifications (верификации)
  //    - likes, messages и другие таблицы
  const dbPath = path.join(NEXTJS_ROOT, 'database.sqlite')
  if (fs.existsSync(dbPath)) {
    console.log('  📄 database.sqlite (аккаунты, профили, отзывы, payment history, балансы)')
    archive.file(dbPath, { name: 'database.sqlite' })
  } else {
    console.log('  ⚠️ database.sqlite не найден')
  }
  
  // Медиафайлы (фото и видео) не бекапятся для уменьшения размера архива
  // Они могут быть восстановлены из других источников или перезагружены пользователями
  
  console.log('✅ Все файлы добавлены в архив')
}

// Функция для очистки старых бекапов
export function cleanupOldBackups(maxBackups = 7) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('kissblow-backup-') && file.endsWith('.zip'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_DIR, file),
        stats: fs.statSync(path.join(BACKUP_DIR, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime)
    
    if (files.length > maxBackups) {
      const filesToDelete = files.slice(maxBackups)
      console.log(`🗑️ Удаляю ${filesToDelete.length} старых бекапов...`)
      
      filesToDelete.forEach(file => {
        fs.unlinkSync(file.path)
        console.log(`  🗑️ Удален: ${file.name}`)
      })
    }
  } catch (error) {
    console.error('❌ Ошибка очистки старых бекапов:', error)
  }
}

// Функция для получения размера папки
export function getBackupDirSize() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return 0
    }
    
    const files = fs.readdirSync(BACKUP_DIR)
    let totalSize = 0
    
    files.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file)
      const stats = fs.statSync(filePath)
      totalSize += stats.size
    })
    
    return totalSize
  } catch (error) {
    console.error('❌ Ошибка получения размера папки бекапов:', error)
    return 0
  }
}
