import { PrismaClient, Prisma } from '@prisma/client';
// Redis и cache будут использоваться позже
// import { redis } from './redis';
// import { getCache, setCache, deleteCache, deleteCachePattern } from './cache';

// Создаем singleton экземпляр Prisma
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Типы для экспорта
export type Profile = Prisma.profilesGetPayload<{
  include: {
    media_media_profile_idToprofiles: true;
    media_profiles_main_photo_idTomedia: true;
    users: true;
  };
}>;

// Функции для работы с БД будут реализованы по мере необходимости
// Базовая структура готова для использования

