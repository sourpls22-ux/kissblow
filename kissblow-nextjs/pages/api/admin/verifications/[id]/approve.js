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
    // Node.js/Next.js нормализует заголовки к нижнему регистру автоматически
    const headerKeys = Object.keys(req.headers)
    const adminKeyHeaderName = headerKeys.find(key => key.toLowerCase() === 'x-admin-key')
    const adminKey = adminKeyHeaderName ? req.headers[adminKeyHeaderName] : null
    
    const expectedAdminKey = process.env.ADMIN_API_KEY || 'a7f3b9c2d8e1f4a6b5c9d2e7f1a4b8c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3d6e9f'
    
    if (!adminKey || adminKey !== expectedAdminKey) {
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

