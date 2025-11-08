# Telegram Bots for KissBlow

## Verification Bot

Бот для модерации верификаций профилей через Telegram.

### Установка зависимостей

```bash
cd tgbots
npm install
```

### Настройка переменных окружения

Создайте файл `.env` в корне проекта или установите переменные:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_TELEGRAM_ID=your_telegram_id
BACKEND_URL=http://localhost:3000
ADMIN_API_KEY=kissblow-admin-2024-verification-bot-key-12345
```

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

