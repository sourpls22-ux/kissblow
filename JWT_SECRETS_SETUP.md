# Инструкция по настройке JWT секретов

## ✅ Что уже сделано

1. **Для разработки (`kissblow-nextjs/env.local`):**
   - ✅ Сгенерированы и добавлены `JWT_SECRET` и `JWT_REFRESH_SECRET`
   - ✅ Секреты для разработки: 
     - `JWT_SECRET=de2kA1aRXsLKVriCFv1Y1iHfBVJbcGi8wJ13WJ0Vzuw=`
     - `JWT_REFRESH_SECRET=9nJwF/q8aqr8+F4qRSy3IcacfoqxtH8KQDtoefPvbjw=`

2. **Для production (`ecosystem.config.cjs`):**
   - ✅ Сгенерированы и добавлены `JWT_SECRET` и `JWT_REFRESH_SECRET` в секцию `env_production`
   - ✅ Production секреты:
     - `JWT_SECRET=JuaRzPvS56O1al+hPRKRBBFL2Yveh8aXKu1HV0VvpWs=`
     - `JWT_REFRESH_SECRET=sud3i3zoMO5l06/6LD/iUQvNiAH32C69gfKLUczJnrw=`

## 📝 Что нужно сделать на продакшене

Если у вас используется файл `.env.production` на продакшене, добавьте туда следующие строки:

```env
# JWT секреты для production
JWT_SECRET=JuaRzPvS56O1al+hPRKRBBFL2Yveh8aXKu1HV0VvpWs=
JWT_REFRESH_SECRET=sud3i3zoMO5l06/6LD/iUQvNiAH32C69gfKLUczJnrw=
```

### Шаги для добавления в .env.production:

1. **Подключитесь к серверу продакшена:**
   ```bash
   ssh user@your-server
   ```

2. **Перейдите в директорию проекта:**
   ```bash
   cd /path/to/kissblow/kissblow-nextjs
   ```

3. **Откройте или создайте файл `.env.production`:**
   ```bash
   nano .env.production
   # или
   vi .env.production
   ```

4. **Добавьте следующие строки:**
   ```env
   # JWT секреты для production (ОБЯЗАТЕЛЬНО)
   JWT_SECRET=JuaRzPvS56O1al+hPRKRBBFL2Yveh8aXKu1HV0VvpWs=
   JWT_REFRESH_SECRET=sud3i3zoMO5l06/6LD/iUQvNiAH32C69gfKLUczJnrw=
   ```

5. **Сохраните файл** (в nano: `Ctrl+O`, затем `Enter`, затем `Ctrl+X`)

6. **Перезапустите приложение:**
   ```bash
   # Если используете PM2:
   pm2 restart kissblow-nextjs
   
   # Или если используете другой процесс-менеджер:
   # Перезапустите приложение соответствующим способом
   ```

## ⚠️ Важные замечания

1. **Безопасность:**
   - ❌ НЕ коммитьте `.env.production` в Git
   - ✅ Убедитесь, что файл `.env.production` находится в `.gitignore`
   - ✅ Используйте разные секреты для разработки и production

2. **Проверка:**
   После добавления секретов проверьте, что они загружаются:
   ```bash
   # В Node.js консоли или временном API endpoint
   console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✓' : 'NOT SET ✗')
   console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? 'SET ✓' : 'NOT SET ✗')
   ```

3. **Если используется PM2:**
   - Секреты уже добавлены в `ecosystem.config.cjs` в секцию `env_production`
   - PM2 автоматически загрузит их при перезапуске
   - Но если вы используете `.env.production`, убедитесь, что PM2 настроен на его загрузку

4. **Если используется другой способ загрузки переменных:**
   - Убедитесь, что `.env.production` загружается вашим процесс-менеджером
   - Или используйте переменные окружения системы напрямую

## 🔄 После применения изменений

1. **Перезапустите приложение** на продакшене
2. **Проверьте логи** на наличие ошибок:
   ```bash
   pm2 logs kissblow-nextjs
   ```
3. **Протестируйте:**
   - Вход в систему
   - Обновление токенов (refresh)
   - Проверьте, что нет предупреждений о отсутствующих секретах

## 📋 Резюме секретов

### Development (env.local):
- `JWT_SECRET=de2kA1aRXsLKVriCFv1Y1iHfBVJbcGi8wJ13WJ0Vzuw=`
- `JWT_REFRESH_SECRET=9nJwF/q8aqr8+F4qRSy3IcacfoqxtH8KQDtoefPvbjw=`

### Production:
- `JWT_SECRET=JuaRzPvS56O1al+hPRKRBBFL2Yveh8aXKu1HV0VvpWs=`
- `JWT_REFRESH_SECRET=sud3i3zoMO5l06/6LD/iUQvNiAH32C69gfKLUczJnrw=`

---

**Готово!** Теперь ваше приложение использует отдельные секреты для access и refresh токенов, что повышает безопасность.

