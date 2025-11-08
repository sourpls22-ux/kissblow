export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null

  try {
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    // Проверка админского ключа
    const adminKey = req.headers['x-admin-key']
    const expectedAdminKey = process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345'
    
    if (adminKey !== expectedAdminKey) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.query

    // Проверяем, что верификация существует и в статусе pending
    const verification = await new Promise((resolve, reject) => {
      db.get(
        `SELECT pv.*, p.user_id, p.is_verified 
         FROM profile_verifications pv
         JOIN profiles p ON pv.profile_id = p.id
         WHERE pv.id = ? AND pv.status = 'pending'`,
        [id],
        (err, row) => {
          if (err) reject(err)
          else resolve(row)
        }
      )
    })

    if (!verification) {
      return res.status(404).json({ error: 'Verification not found or already processed' })
    }

    // Обновляем статус верификации
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE profile_verifications 
         SET status = 'approved', reviewed_at = datetime('now')
         WHERE id = ?`,
        [id],
        function(err) {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    // Обновляем статус профиля на verified
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE profiles SET is_verified = 1 WHERE id = ?`,
        [verification.profile_id],
        function(err) {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    res.json({ 
      message: 'Verification approved successfully',
      verificationId: id,
      profileId: verification.profile_id
    })

  } catch (error) {
    console.error('Approve verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}

