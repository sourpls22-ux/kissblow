import fs from 'fs-extra'
import archiver from 'archiver'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PROJECT_ROOT = path.join(__dirname, '..')
const BACKUP_DIR = path.join(PROJECT_ROOT, '..', 'backups')

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
  
  // 1. База данных SQLite
  const dbPath = path.join(PROJECT_ROOT, 'database.sqlite')
  if (fs.existsSync(dbPath)) {
    console.log('  📄 database.sqlite')
    archive.file(dbPath, { name: 'database.sqlite' })
  } else {
    console.log('  ⚠️ database.sqlite не найден')
  }
  
  // 2. Конфигурационные файлы
  const configDir = path.join(PROJECT_ROOT, 'config')
  if (fs.existsSync(configDir)) {
    console.log('  📁 config/')
    archive.directory(configDir, 'config')
  }
  
  // 3. Переменные окружения (только примеры, не реальные)
  const envExample = path.join(PROJECT_ROOT, 'env.example')
  if (fs.existsSync(envExample)) {
    console.log('  📄 env.example')
    archive.file(envExample, { name: 'env.example' })
  }
  
  const envProdExample = path.join(PROJECT_ROOT, 'env.production.example')
  if (fs.existsSync(envProdExample)) {
    console.log('  📄 env.production.example')
    archive.file(envProdExample, { name: 'env.production.example' })
  }
  
  // 4. Основные конфигурационные файлы
  const packageJson = path.join(PROJECT_ROOT, 'package.json')
  if (fs.existsSync(packageJson)) {
    console.log('  📄 package.json')
    archive.file(packageJson, { name: 'package.json' })
  }
  
  const ecosystemConfig = path.join(PROJECT_ROOT, '..', 'ecosystem.config.cjs')
  if (fs.existsSync(ecosystemConfig)) {
    console.log('  📄 ecosystem.config.cjs')
    archive.file(ecosystemConfig, { name: 'ecosystem.config.cjs' })
  }
  
  // 5. Логи (если есть)
  const logsDir = path.join(PROJECT_ROOT, '..', 'logs')
  if (fs.existsSync(logsDir)) {
    console.log('  📁 logs/')
    archive.directory(logsDir, 'logs')
  }
  
  // 6. Скрипты
  const scriptsDir = path.join(PROJECT_ROOT, 'scripts')
  if (fs.existsSync(scriptsDir)) {
    console.log('  📁 scripts/')
    archive.directory(scriptsDir, 'scripts')
  }
  
  // 7. Сервисы
  const servicesDir = path.join(PROJECT_ROOT, 'services')
  if (fs.existsSync(servicesDir)) {
    console.log('  📁 services/')
    archive.directory(servicesDir, 'services')
  }
  
  // 8. Маршруты
  const routesDir = path.join(PROJECT_ROOT, 'routes')
  if (fs.existsSync(routesDir)) {
    console.log('  📁 routes/')
    archive.directory(routesDir, 'routes')
  }
  
  // 9. Информация о системе
  const systemInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development'
  }
  
  console.log('  📄 system-info.json')
  archive.append(JSON.stringify(systemInfo, null, 2), { name: 'system-info.json' })
  
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
