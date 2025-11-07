const sqlite3 = require('sqlite3')
const path = require('path')

// Promisify database methods
function dbRun(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

function dbGet(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

async function addBalance(email, amount, description = 'Manual balance addition') {
  const dbPath = path.join(__dirname, '..', 'database.sqlite')
  const db = new sqlite3.Database(dbPath)

  try {
    console.log(`\n💰 Пополнение баланса`)
    console.log(`   Email: ${email}`)
    console.log(`   Сумма: ${amount}`)
    console.log(`   Описание: ${description}\n`)

    // Find user by email
    const user = await dbGet(db, 'SELECT id, email, name, balance FROM users WHERE email = ?', [email])
    
    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`)
      process.exit(1)
    }

    console.log(`✅ Пользователь найден:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Имя: ${user.name || 'N/A'}`)
    console.log(`   Текущий баланс: ${user.balance}`)

    // Update balance
    const newBalance = user.balance + parseFloat(amount)
    await dbRun(
      db,
      'UPDATE users SET balance = ? WHERE id = ?',
      [newBalance, user.id]
    )

    // Add payment history record
    await dbRun(
      db,
      'INSERT INTO payments (user_id, amount_to_pay, credit_amount, method, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, 0, parseFloat(amount), 'manual_addition', 'completed', new Date().toISOString()]
    )

    console.log(`\n✅ Баланс успешно пополнен!`)
    console.log(`   Старый баланс: ${user.balance}`)
    console.log(`   Добавлено: ${amount}`)
    console.log(`   Новый баланс: ${newBalance}\n`)

  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    process.exit(1)
  } finally {
    db.close()
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('Использование: node scripts/add-balance.js <email> <amount> [description]')
  console.log('Пример: node scripts/add-balance.js info@kissblow.me 100 "Admin top-up"')
  process.exit(1)
}

const email = args[0]
const amount = args[1]
const description = args[2] || 'Manual balance addition'

addBalance(email, amount, description)
  .then(() => {
    console.log('✅ Готово!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  })

