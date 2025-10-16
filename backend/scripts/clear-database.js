import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const db = new sqlite3.Database(path.join(__dirname, '../database.sqlite'))

console.log('🗑️  Начинаем очистку базы данных...')

db.serialize(() => {
  // Удаляем все данные из таблиц
  db.run('DELETE FROM media', (err) => {
    if (err) console.error('Error clearing media:', err)
    else console.log('✅ Таблица media очищена')
  })
  
  db.run('DELETE FROM reviews', (err) => {
    if (err) console.error('Error clearing reviews:', err)
    else console.log('✅ Таблица reviews очищена')
  })
  
  db.run('DELETE FROM likes', (err) => {
    if (err) console.error('Error clearing likes:', err)
    else console.log('✅ Таблица likes очищена')
  })
  
  db.run('DELETE FROM messages', (err) => {
    if (err) console.error('Error clearing messages:', err)
    else console.log('✅ Таблица messages очищена')
  })
  
  db.run('DELETE FROM payments', (err) => {
    if (err) console.error('Error clearing payments:', err)
    else console.log('✅ Таблица payments очищена')
  })
  
  db.run('DELETE FROM profiles', (err) => {
    if (err) console.error('Error clearing profiles:', err)
    else console.log('✅ Таблица profiles очищена')
  })
  
  db.run('DELETE FROM users', (err) => {
    if (err) console.error('Error clearing users:', err)
    else console.log('✅ Таблица users очищена')
  })
  
  // Сбрасываем счетчики автоинкремента
  db.run("DELETE FROM sqlite_sequence WHERE name='media'")
  db.run("DELETE FROM sqlite_sequence WHERE name='reviews'")
  db.run("DELETE FROM sqlite_sequence WHERE name='likes'")
  db.run("DELETE FROM sqlite_sequence WHERE name='messages'")
  db.run("DELETE FROM sqlite_sequence WHERE name='payments'")
  db.run("DELETE FROM sqlite_sequence WHERE name='profiles'")
  db.run("DELETE FROM sqlite_sequence WHERE name='users'", (err) => {
    if (err) console.error('Error resetting sequences:', err)
    else console.log('✅ Счетчики автоинкремента сброшены')
    
    console.log('\n🎉 База данных полностью очищена!')
    console.log('📝 Теперь можно безопасно деплоить на VPS')
    db.close()
  })
})