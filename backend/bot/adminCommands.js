import { adminDatabase } from './adminDatabase.js'

export const adminCommands = {
  // Показать меню пользователей
  async showUsersMenu(bot, chatId, db) {
    const users = await adminDatabase.getAllUsers(db)
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          ...users.slice(0, 10).map(user => [
            {
              text: `👤 ${user.name} (${user.email})`,
              callback_data: `user_details_${user.id}`
            }
          ]),
          [
            { text: '🔍 Поиск по email', callback_data: 'user_search_email' },
            { text: '🔍 Поиск по ID', callback_data: 'user_search_id' }
          ],
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
    
    const text = `👥 *Управление пользователями*\n\nВсего пользователей: ${users.length}\n\nВыберите пользователя:`
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Показать меню анкет
  async showProfilesMenu(bot, chatId, db) {
    const profiles = await adminDatabase.getAllProfiles(db)
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          ...profiles.slice(0, 10).map(profile => [
            {
              text: `📋 ${profile.name} (${profile.city}) ${profile.is_verified ? '✅' : '❌'}`,
              callback_data: `profile_details_${profile.id}`
            }
          ]),
          [
            { text: '🔍 Поиск по имени', callback_data: 'profile_search_name' },
            { text: '🔍 Поиск по городу', callback_data: 'profile_search_city' }
          ],
          [
            { text: '✅ Верифицированные', callback_data: 'profiles_verified' },
            { text: '❌ Неверифицированные', callback_data: 'profiles_unverified' }
          ],
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
    
    const verifiedCount = profiles.filter(p => p.is_verified).length
    const activeCount = profiles.filter(p => p.is_active).length
    
    const text = `📋 *Управление анкетами*\n\nВсего анкет: ${profiles.length}\nВерифицированных: ${verifiedCount}\nАктивных: ${activeCount}\n\nВыберите анкету:`
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Показать меню ревью
  async showReviewsMenu(bot, chatId, db) {
    const reviews = await adminDatabase.getAllReviews(db)
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          ...reviews.slice(0, 10).map(review => [
            {
              text: `⭐ ${review.profile_name} - ${review.user_name}`,
              callback_data: `review_details_${review.id}`
            }
          ]),
          [
            { text: '🔍 Поиск по анкете', callback_data: 'review_search_profile' },
            { text: '🔍 Поиск по пользователю', callback_data: 'review_search_user' }
          ],
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
    
    const text = `⭐ *Управление ревью*\n\nВсего ревью: ${reviews.length}\n\nВыберите ревью:`
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Показать меню лайков
  async showLikesMenu(bot, chatId, db) {
    const likes = await adminDatabase.getLikesStats(db)
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          ...likes.slice(0, 10).map(like => [
            {
              text: `❤️ ${like.profile_name} - ${like.likes_count} лайков`,
              callback_data: `like_details_${like.profile_id}`
            }
          ]),
          [
            { text: '🔍 Поиск по анкете', callback_data: 'like_search_profile' },
            { text: '📊 Общая статистика', callback_data: 'likes_overall_stats' }
          ],
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
    
    const totalLikes = likes.reduce((sum, like) => sum + like.likes_count, 0)
    
    const text = `❤️ *Управление лайками*\n\nВсего лайков: ${totalLikes}\nАнкет с лайками: ${likes.length}\n\nВыберите анкету:`
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Показать статистику
  async showStats(bot, chatId, db) {
    const stats = await adminDatabase.getOverallStats(db)
    
    const text = `📊 *Статистика системы*\n\n` +
      `👥 *Пользователи:*\n` +
      `• Всего: ${stats.totalUsers}\n` +
      `• Модели: ${stats.modelUsers}\n` +
      `• Участники: ${stats.memberUsers}\n` +
      `• Общий баланс: $${stats.totalBalance.toFixed(2)}\n\n` +
      `📋 *Анкеты:*\n` +
      `• Всего: ${stats.totalProfiles}\n` +
      `• Активных: ${stats.activeProfiles}\n` +
      `• Верифицированных: ${stats.verifiedProfiles}\n` +
      `• С бустом: ${stats.boostedProfiles}\n\n` +
      `⭐ *Ревью:*\n` +
      `• Всего: ${stats.totalReviews}\n\n` +
      `❤️ *Лайки:*\n` +
      `• Всего: ${stats.totalLikes}\n\n` +
      `💰 *Доходы:*\n` +
      `• Общий доход: $${stats.totalRevenue.toFixed(2)}\n` +
      `• За сегодня: $${stats.todayRevenue.toFixed(2)}`
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Обновить', callback_data: 'admin_stats' }],
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Показать справку
  async showHelp(bot, chatId) {
    const text = `❓ *Справка по админ-панели*\n\n` +
      `*Управление пользователями:*\n` +
      `• Просмотр списка всех пользователей\n` +
      `• Поиск по email или ID\n` +
      `• Удаление аккаунтов\n` +
      `• Изменение баланса\n` +
      `• Блокировка/разблокировка\n\n` +
      `*Управление анкетами:*\n` +
      `• Просмотр всех анкет\n` +
      `• Поиск по имени или городу\n` +
      `• Удаление анкет\n` +
      `• Активация/деактивация\n` +
      `• Верификация/отмена верификации\n\n` +
      `*Управление ревью:*\n` +
      `• Просмотр всех ревью\n` +
      `• Поиск по анкете или пользователю\n` +
      `• Удаление ревью\n\n` +
      `*Управление лайками:*\n` +
      `• Просмотр статистики лайков\n` +
      `• Изменение количества лайков\n` +
      `• Поиск по анкете\n\n` +
      `*Статистика:*\n` +
      `• Общая статистика системы\n` +
      `• Статистика пользователей\n` +
      `• Статистика анкет\n` +
      `• Статистика доходов`
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '⬅️ Назад', callback_data: 'back_to_main' }]
        ]
      }
    }
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Обработка действий с пользователями
  async handleUserAction(bot, chatId, data, db) {
    const [action, type, id] = data.split('_')
    
    switch (type) {
      case 'details':
        await this.showUserDetails(bot, chatId, id, db)
        break
      case 'delete':
        await this.deleteUser(bot, chatId, id, db)
        break
      case 'balance':
        await this.showBalanceMenu(bot, chatId, id, db)
        break
      case 'block':
        await this.blockUser(bot, chatId, id, db)
        break
      case 'unblock':
        await this.unblockUser(bot, chatId, id, db)
        break
    }
  },

  // Показать детали пользователя
  async showUserDetails(bot, chatId, userId, db) {
    const user = await adminDatabase.getUserById(db, userId)
    const profiles = await adminDatabase.getUserProfiles(db, userId)
    
    if (!user) {
      bot.sendMessage(chatId, '❌ Пользователь не найден')
      return
    }
    
    const text = `👤 *Детали пользователя*\n\n` +
      `ID: ${user.id}\n` +
      `Имя: ${user.name}\n` +
      `Email: ${user.email}\n` +
      `Тип: ${user.account_type === 'model' ? 'Модель' : 'Участник'}\n` +
      `Баланс: $${user.balance}\n` +
      `Создан: ${new Date(user.created_at).toLocaleDateString('ru-RU')}\n` +
      `Анкет: ${profiles.length}`
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💰 Изменить баланс', callback_data: `user_balance_${userId}` },
            { text: '🚫 Заблокировать', callback_data: `user_block_${userId}` }
          ],
          [
            { text: '🗑️ Удалить аккаунт', callback_data: `user_delete_${userId}` },
            { text: '📋 Анкеты', callback_data: `user_profiles_${userId}` }
          ],
          [{ text: '⬅️ Назад', callback_data: 'admin_users' }]
        ]
      }
    }
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Удалить пользователя
  async deleteUser(bot, chatId, userId, db) {
    try {
      await adminDatabase.deleteUser(db, userId)
      bot.sendMessage(chatId, '✅ Пользователь успешно удален')
    } catch (error) {
      bot.sendMessage(chatId, '❌ Ошибка при удалении пользователя')
    }
  },

  // Показать меню баланса
  async showBalanceMenu(bot, chatId, userId, db) {
    const user = await adminDatabase.getUserById(db, userId)
    
    if (!user) {
      bot.sendMessage(chatId, '❌ Пользователь не найден')
      return
    }
    
    const text = `💰 *Управление балансом*\n\n` +
      `Пользователь: ${user.name}\n` +
      `Текущий баланс: $${user.balance}\n\n` +
      `Выберите действие:`
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Добавить $10', callback_data: `balance_add_${userId}_10` },
            { text: '➕ Добавить $50', callback_data: `balance_add_${userId}_50` }
          ],
          [
            { text: '➕ Добавить $100', callback_data: `balance_add_${userId}_100` },
            { text: '➖ Уменьшить $10', callback_data: `balance_sub_${userId}_10` }
          ],
          [
            { text: '🔢 Установить сумму', callback_data: `balance_set_${userId}` },
            { text: '⬅️ Назад', callback_data: `user_details_${userId}` }
          ]
        ]
      }
    }
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Обработка действий с анкетами
  async handleProfileAction(bot, chatId, data, db) {
    const [action, type, id] = data.split('_')
    
    switch (type) {
      case 'details':
        await this.showProfileDetails(bot, chatId, id, db)
        break
      case 'delete':
        await this.deleteProfile(bot, chatId, id, db)
        break
      case 'verify':
        await this.verifyProfile(bot, chatId, id, db)
        break
      case 'unverify':
        await this.unverifyProfile(bot, chatId, id, db)
        break
      case 'activate':
        await this.activateProfile(bot, chatId, id, db)
        break
      case 'deactivate':
        await this.deactivateProfile(bot, chatId, id, db)
        break
    }
  },

  // Показать детали анкеты
  async showProfileDetails(bot, chatId, profileId, db) {
    const profile = await adminDatabase.getProfileById(db, profileId)
    
    if (!profile) {
      bot.sendMessage(chatId, '❌ Анкета не найдена')
      return
    }
    
    const text = `📋 *Детали анкеты*\n\n` +
      `ID: ${profile.id}\n` +
      `Имя: ${profile.name}\n` +
      `Возраст: ${profile.age}\n` +
      `Город: ${profile.city}\n` +
      `Статус: ${profile.is_active ? 'Активна' : 'Неактивна'}\n` +
      `Верификация: ${profile.is_verified ? '✅ Верифицирована' : '❌ Не верифицирована'}\n` +
      `Создана: ${new Date(profile.created_at).toLocaleDateString('ru-RU')}`
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: profile.is_verified ? '❌ Отменить верификацию' : '✅ Верифицировать', 
              callback_data: `profile_${profile.is_verified ? 'unverify' : 'verify'}_${profileId}` },
            { text: profile.is_active ? '🚫 Деактивировать' : '✅ Активировать', 
              callback_data: `profile_${profile.is_active ? 'deactivate' : 'activate'}_${profileId}` }
          ],
          [
            { text: '🗑️ Удалить анкету', callback_data: `profile_delete_${profileId}` },
            { text: '📊 Статистика', callback_data: `profile_stats_${profileId}` }
          ],
          [{ text: '⬅️ Назад', callback_data: 'admin_profiles' }]
        ]
      }
    }
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Удалить анкету
  async deleteProfile(bot, chatId, profileId, db) {
    try {
      await adminDatabase.deleteProfile(db, profileId)
      bot.sendMessage(chatId, '✅ Анкета успешно удалена')
    } catch (error) {
      bot.sendMessage(chatId, '❌ Ошибка при удалении анкеты')
    }
  },

  // Верифицировать анкету
  async verifyProfile(bot, chatId, profileId, db) {
    try {
      await adminDatabase.verifyProfile(db, profileId)
      bot.sendMessage(chatId, '✅ Анкета успешно верифицирована')
    } catch (error) {
      bot.sendMessage(chatId, '❌ Ошибка при верификации анкеты')
    }
  },

  // Отменить верификацию анкеты
  async unverifyProfile(bot, chatId, profileId, db) {
    try {
      await adminDatabase.unverifyProfile(db, profileId)
      bot.sendMessage(chatId, '✅ Верификация анкеты отменена')
    } catch (error) {
      bot.sendMessage(chatId, '❌ Ошибка при отмене верификации')
    }
  },

  // Активировать анкету
  async activateProfile(bot, chatId, profileId, db) {
    try {
      await adminDatabase.activateProfile(db, profileId)
      bot.sendMessage(chatId, '✅ Анкета активирована')
    } catch (error) {
      bot.sendMessage(chatId, '❌ Ошибка при активации анкеты')
    }
  },

  // Деактивировать анкету
  async deactivateProfile(bot, chatId, profileId, db) {
    try {
      await adminDatabase.deactivateProfile(db, profileId)
      bot.sendMessage(chatId, '✅ Анкета деактивирована')
    } catch (error) {
      bot.sendMessage(chatId, '❌ Ошибка при деактивации анкеты')
    }
  },

  // Обработка действий с ревью
  async handleReviewAction(bot, chatId, data, db) {
    const [action, type, id] = data.split('_')
    
    switch (type) {
      case 'details':
        await this.showReviewDetails(bot, chatId, id, db)
        break
      case 'delete':
        await this.deleteReview(bot, chatId, id, db)
        break
    }
  },

  // Показать детали ревью
  async showReviewDetails(bot, chatId, reviewId, db) {
    const review = await adminDatabase.getReviewById(db, reviewId)
    
    if (!review) {
      bot.sendMessage(chatId, '❌ Ревью не найдено')
      return
    }
    
    const text = `⭐ *Детали ревью*\n\n` +
      `ID: ${review.id}\n` +
      `Анкета: ${review.profile_name}\n` +
      `Пользователь: ${review.user_name}\n` +
      `Рейтинг: ${review.rating}/5\n` +
      `Комментарий: ${review.comment || 'Нет комментария'}\n` +
      `Дата: ${new Date(review.created_at).toLocaleDateString('ru-RU')}`
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🗑️ Удалить ревью', callback_data: `review_delete_${reviewId}` }
          ],
          [{ text: '⬅️ Назад', callback_data: 'admin_reviews' }]
        ]
      }
    }
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  },

  // Удалить ревью
  async deleteReview(bot, chatId, reviewId, db) {
    try {
      await adminDatabase.deleteReview(db, reviewId)
      bot.sendMessage(chatId, '✅ Ревью успешно удалено')
    } catch (error) {
      bot.sendMessage(chatId, '❌ Ошибка при удалении ревью')
    }
  },

  // Обработка действий с лайками
  async handleLikeAction(bot, chatId, data, db) {
    const [action, type, id] = data.split('_')
    
    switch (type) {
      case 'details':
        await this.showLikeDetails(bot, chatId, id, db)
        break
      case 'add':
        await this.addLikes(bot, chatId, id, db)
        break
      case 'remove':
        await this.removeLikes(bot, chatId, id, db)
        break
    }
  },

  // Показать детали лайков
  async showLikeDetails(bot, chatId, profileId, db) {
    const likes = await adminDatabase.getProfileLikes(db, profileId)
    const profile = await adminDatabase.getProfileById(db, profileId)
    
    if (!profile) {
      bot.sendMessage(chatId, '❌ Анкета не найдена')
      return
    }
    
    const text = `❤️ *Лайки анкеты*\n\n` +
      `Анкета: ${profile.name}\n` +
      `Всего лайков: ${likes.length}\n\n` +
      `Последние лайки:\n` +
      likes.slice(0, 5).map(like => 
        `• ${like.user_name} (${new Date(like.created_at).toLocaleDateString('ru-RU')})`
      ).join('\n')
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Добавить лайки', callback_data: `like_add_${profileId}` },
            { text: '➖ Убрать лайки', callback_data: `like_remove_${profileId}` }
          ],
          [{ text: '⬅️ Назад', callback_data: 'admin_likes' }]
        ]
      }
    }
    
    bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...keyboard
    })
  }
}
