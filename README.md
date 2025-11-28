# KissBlow - Escort Каталог

Современный escort каталог на Next.js 14 с поддержкой масштабирования до 100,000+ профилей.

## Технологический стек

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (optional)
- **Deployment**: VPS (Ubuntu/Debian)

## Архитектура

- **Рендеринг**: ISR (Incremental Static Regeneration) + On-Demand Revalidation
- **SEO**: Оптимизированные мета-теги и структурированные данные
- **Производительность**: Многоуровневое кэширование (Redis + Next.js кэш)

## Требования

- Node.js 20+
- PostgreSQL 14+ (required)
- Redis 6+ (optional, for caching)

## Установка

### 1. Клонирование и установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/kissblow?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Настройка базы данных

Убедитесь, что PostgreSQL установлен и запущен. Создайте базу данных:

```bash
# Вход в PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE kissblow;

# Выход
\q
```

После создания схемы в `prisma/schema.prisma`, выполните:

```bash
# Создание миграции
npx prisma migrate dev

# Генерация Prisma Client
npx prisma generate
```

### 4. Запуск Redis (опционально)

Redis используется для кэширования и rate limiting. Если не планируете использовать Redis, приложение будет работать с in-memory rate limiting.

```bash
# Ubuntu/Debian
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Или через Docker
docker run -d -p 6379:6379 redis:latest
```

### 5. Запуск проекта

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
kissblow/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Главный layout
│   └── page.tsx          # Главная страница
├── lib/                   # Утилиты и конфигурация
│   ├── db.ts             # Prisma client и функции БД
│   ├── redis.ts          # Redis клиент
│   └── cache.ts          # Функции кэширования
├── components/            # React компоненты
├── prisma/               # Prisma схема и миграции
│   └── schema.prisma     # Схема базы данных
└── public/               # Статические файлы
```

## Разработка

### Создание схемы базы данных

Схема создается в `prisma/schema.prisma`. После изменений:

```bash
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

### Работа с кэшем

Используйте функции из `lib/cache.ts`:

```typescript
import { getCache, setCache, deleteCache } from '@/lib/cache';

// Получить из кэша
const data = await getCache('key');

// Сохранить в кэш (TTL 5 минут)
await setCache('key', data, 300);

// Удалить из кэша
await deleteCache('key');
```

## Деплой на VPS

### Требования VPS

- Ubuntu 22.04+ / Debian 12+
- 2+ CPU cores
- 4GB+ RAM
- 50GB+ SSD

### Установка на VPS

1. Установка Node.js, PostgreSQL, Redis, Nginx
2. Настройка базы данных
3. Настройка переменных окружения
4. Сборка проекта: `npm run build`
5. Запуск через PM2: `pm2 start npm --name "kissblow" -- start`
6. Настройка Nginx как reverse proxy
7. Настройка SSL (Let's Encrypt)

Подробные инструкции по деплою будут добавлены позже.

## Лицензия

Private
