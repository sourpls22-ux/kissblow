#!/usr/bin/env node

import { createBackup, cleanupOldBackups, getBackupDirSize } from '../bot/backupService.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔄 KissBlow Backup Script')
console.log('========================')

async function main() {
  try {
    console.log('📅 Время:', new Date().toLocaleString('ru-RU'))
    console.log('📁 Рабочая директория:', process.cwd())
    
    // Создаем бекап
    console.log('\n🔄 Создаю бекап...')
    const backupPath = await createBackup()
    
    if (backupPath) {
      const stats = fs.statSync(backupPath)
      console.log(`✅ Бекап создан: ${backupPath}`)
      console.log(`💾 Размер: ${(stats.size / 1024 / 1024).toFixed(2)} MB`)
      
      // Очищаем старые бекапы
      console.log('\n🗑️ Очищаю старые бекапы...')
      cleanupOldBackups(7)
      
      // Показываем статистику
      const totalSize = getBackupDirSize()
      console.log(`📊 Общий размер бекапов: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
      
      console.log('\n✅ Скрипт завершен успешно!')
    } else {
      console.log('❌ Ошибка создания бекапа')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    process.exit(1)
  }
}

// Запускаем скрипт
main()
