const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, '..', 'database.sqlite')
const db = new sqlite3.Database(dbPath)

// Проверяем наличие поля conversion_progress
db.all("PRAGMA table_info(media)", (err, columns) => {
  if (err) {
    console.error('Error checking table structure:', err)
    db.close()
    process.exit(1)
  }

  const hasConversionProgress = columns.some(col => col.name === 'conversion_progress')
  
  if (hasConversionProgress) {
    console.log('✅ Field conversion_progress already exists')
    db.close()
    process.exit(0)
  } else {
    console.log('⚠️  Field conversion_progress not found, adding it...')
    
    db.run('ALTER TABLE media ADD COLUMN conversion_progress REAL DEFAULT 0', (err) => {
      if (err) {
        console.error('❌ Error adding conversion_progress column:', err.message)
        db.close()
        process.exit(1)
      } else {
        console.log('✅ Field conversion_progress added successfully')
        db.close()
        process.exit(0)
      }
    })
  }
})

