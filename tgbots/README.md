# Telegram Bots for KissBlow

## Verification Bot

Бот для модерации верификаций профилей через Telegram.

### Установка зависимостей

```bash
cd tgbots
npm install
```

**Важно:** После установки зависимостей, если были уязвимости, переустановите зависимости для применения `overrides`:

```bash
rm -rf node_modules package-lock.json
npm install
npm audit  # Проверьте, что уязвимости исправлены
```

### Настройка переменных окружения

Создайте файл `.env` в папке `tgbots` или установите переменные окружения:

```env
# Telegram Bot Configuration
# Получите токен бота у @BotFather в Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Telegram Admin User ID
# Ваш Telegram User ID (можно узнать у @userinfobot)
ADMIN_TELEGRAM_ID=your_telegram_user_id_here

# Backend API URL
# URL вашего Next.js API (для production используйте https://kissblow.me)
BACKEND_URL=http://localhost:3000
# Или используйте NEXT_PUBLIC_API_URL если он уже настроен
# NEXT_PUBLIC_API_URL=https://kissblow.me

# Admin API Key
# Секретный ключ для доступа к admin API endpoints
# Должен совпадать с ADMIN_API_KEY в kissblow-nextjs/.env
ADMIN_API_KEY=your_admin_api_key_here
```

**Как получить значения:**

1. **TELEGRAM_BOT_TOKEN**: 
   - Откройте Telegram и найдите бота @BotFather
   - Отправьте команду `/newbot` и следуйте инструкциям
   - Скопируйте полученный токен

2. **ADMIN_TELEGRAM_ID**:
   - Откройте Telegram и найдите бота @userinfobot
   - Отправьте команду `/start`
   - Скопируйте ваш User ID (число)

3. **BACKEND_URL**:
   - Для разработки: `http://localhost:3000`
   - Для production: `https://kissblow.me`

4. **ADMIN_API_KEY**:
   - Сгенерируйте случайный секретный ключ
   - Убедитесь, что он совпадает с `ADMIN_API_KEY` в `kissblow-nextjs/.env`

### Запуск

```bash
npm run start:verification
```

или

```bash
node verificationBot.js
```

### Команды бота

- `/start` - Приветствие и основная информация
- `/status` - Показать количество ожидающих верификаций
- `/verifications` - Показать ожидающие верификации
- `/help` - Справка по командам

### API Endpoints

Бот использует следующие API endpoints:
- `GET /api/admin/verifications` - Получить список верификаций
- `POST /api/admin/verifications/[id]/approve` - Одобрить верификацию
- `POST /api/admin/verifications/[id]/reject` - Отклонить верификацию

## Backup Service

Сервис для создания резервных копий базы данных и конфигурационных файлов.

### Использование

```javascript
import { createBackup, cleanupOldBackups } from './backupService.js'

// Создать бекап
const backupPath = await createBackup()

// Очистить старые бекапы (оставить последние 7)
cleanupOldBackups(7)
```

