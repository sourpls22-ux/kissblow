export const adminDatabase = {
  // Получить всех пользователей
  async getAllUsers(db) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, email, balance, account_type, created_at
        FROM users 
        ORDER BY created_at DESC
      `, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Получить пользователя по ID
  async getUserById(db, userId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, email, balance, account_type, created_at
        FROM users 
        WHERE id = ?
      `, [userId], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  },

  // Получить анкеты пользователя
  async getUserProfiles(db, userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, city, is_active, is_verified, created_at
        FROM profiles 
        WHERE user_id = ?
        ORDER BY created_at DESC
      `, [userId], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Удалить пользователя
  async deleteUser(db, userId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Обновить баланс пользователя
  async updateUserBalance(db, userId, newBalance) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Добавить к балансу пользователя
  async addToUserBalance(db, userId, amount) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Получить все анкеты
  async getAllProfiles(db) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Получить анкету по ID
  async getProfileById(db, profileId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
      `, [profileId], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  },

  // Удалить анкету
  async deleteProfile(db, profileId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM profiles WHERE id = ?', [profileId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Верифицировать анкету
  async verifyProfile(db, profileId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE profiles SET is_verified = 1 WHERE id = ?', [profileId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Отменить верификацию анкеты
  async unverifyProfile(db, profileId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE profiles SET is_verified = 0 WHERE id = ?', [profileId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Активировать анкету
  async activateProfile(db, profileId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE profiles SET is_active = 1 WHERE id = ?', [profileId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Деактивировать анкету
  async deactivateProfile(db, profileId) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE profiles SET is_active = 0 WHERE id = ?', [profileId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Получить все ревью
  async getAllReviews(db) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT r.*, p.name as profile_name, u.name as user_name
        FROM reviews r
        LEFT JOIN profiles p ON r.profile_id = p.id
        LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Получить ревью по ID
  async getReviewById(db, reviewId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT r.*, p.name as profile_name, u.name as user_name
        FROM reviews r
        LEFT JOIN profiles p ON r.profile_id = p.id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.id = ?
      `, [reviewId], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  },

  // Удалить ревью
  async deleteReview(db, reviewId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM reviews WHERE id = ?', [reviewId], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Получить статистику лайков
  async getLikesStats(db) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.id as profile_id, p.name as profile_name, COUNT(l.id) as likes_count
        FROM profiles p
        LEFT JOIN likes l ON p.id = l.profile_id
        GROUP BY p.id, p.name
        HAVING likes_count > 0
        ORDER BY likes_count DESC
      `, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Получить лайки анкеты
  async getProfileLikes(db, profileId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT l.*, u.name as user_name
        FROM likes l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.profile_id = ?
        ORDER BY l.created_at DESC
      `, [profileId], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Добавить лайки к анкете
  async addLikesToProfile(db, profileId, count = 1) {
    return new Promise((resolve, reject) => {
      // Используем отрицательные user_id для админских лайков
      // Начинаем с -1, -2, -3 и т.д.
      const likes = Array(count).fill().map((_, index) => [
        profileId, 
        -(index + 1), // Отрицательные ID: -1, -2, -3...
        new Date().toISOString()
      ])
      const placeholders = likes.map(() => '(?, ?, ?)').join(', ')
      const values = likes.flat()
      
      db.run(`
        INSERT INTO likes (profile_id, user_id, created_at) 
        VALUES ${placeholders}
      `, values, function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Удалить лайки с анкеты
  async removeLikesFromProfile(db, profileId, count = 1) {
    return new Promise((resolve, reject) => {
      // Удаляем админские лайки (user_id < 0) сначала
      db.run(`
        DELETE FROM likes 
        WHERE profile_id = ? 
        AND user_id < 0
        AND id IN (
          SELECT id FROM likes 
          WHERE profile_id = ? 
          AND user_id < 0
          ORDER BY created_at ASC 
          LIMIT ?
        )
      `, [profileId, profileId, count], function(err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  },

  // Получить общую статистику
  async getOverallStats(db) {
    return new Promise((resolve, reject) => {
      const stats = {}
      
      // Статистика пользователей
      db.get(`
        SELECT 
          COUNT(*) as totalUsers,
          SUM(CASE WHEN account_type = 'model' THEN 1 ELSE 0 END) as modelUsers,
          SUM(CASE WHEN account_type = 'member' THEN 1 ELSE 0 END) as memberUsers,
          SUM(balance) as totalBalance
        FROM users
      `, (err, userStats) => {
        if (err) {
          reject(err)
          return
        }
        
        Object.assign(stats, userStats)
        
        // Статистика анкет
        db.get(`
          SELECT 
            COUNT(*) as totalProfiles,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeProfiles,
            SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verifiedProfiles,
            SUM(CASE WHEN boost_expires_at IS NOT NULL AND datetime(boost_expires_at) > datetime('now') THEN 1 ELSE 0 END) as boostedProfiles
          FROM profiles
        `, (err, profileStats) => {
          if (err) {
            reject(err)
            return
          }
          
          Object.assign(stats, profileStats)
          
          // Статистика ревью
          db.get('SELECT COUNT(*) as totalReviews FROM reviews', (err, reviewStats) => {
            if (err) {
              reject(err)
              return
            }
            
            Object.assign(stats, reviewStats)
            
            // Статистика лайков
            db.get('SELECT COUNT(*) as totalLikes FROM likes', (err, likeStats) => {
              if (err) {
                reject(err)
                return
              }
              
              Object.assign(stats, likeStats)
              
              // Статистика доходов (если есть таблица payments)
              db.get(`
                SELECT 
                  COALESCE(SUM(amount), 0) as totalRevenue,
                  COALESCE(SUM(CASE WHEN DATE(created_at) = DATE('now') THEN amount ELSE 0 END), 0) as todayRevenue
                FROM payments
              `, (err, revenueStats) => {
                if (err) {
                  // Если таблицы payments нет, устанавливаем нули
                  stats.totalRevenue = 0
                  stats.todayRevenue = 0
                  resolve(stats)
                } else {
                  Object.assign(stats, revenueStats)
                  resolve(stats)
                }
              })
            })
          })
        })
      })
    })
  },

  // Поиск пользователей по email
  async searchUsersByEmail(db, email) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, email, balance, account_type, created_at
        FROM users 
        WHERE email LIKE ?
        ORDER BY created_at DESC
      `, [`%${email}%`], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Поиск анкет по имени
  async searchProfilesByName(db, name) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.name LIKE ?
        ORDER BY p.created_at DESC
      `, [`%${name}%`], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Поиск анкет по городу
  async searchProfilesByCity(db, city) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.city LIKE ?
        ORDER BY p.created_at DESC
      `, [`%${city}%`], (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Получить верифицированные анкеты
  async getVerifiedProfiles(db) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.is_verified = 1
        ORDER BY p.created_at DESC
      `, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  },

  // Получить неверифицированные анкеты
  async getUnverifiedProfiles(db) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT p.*, u.name as user_name, u.email as user_email
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.is_verified = 0
        ORDER BY p.created_at DESC
      `, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }
}
