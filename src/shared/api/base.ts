// База API-слоя: конфиг и утилиты (общие для доменных модулей)
// При подключении Laravel: NEXT_PUBLIC_API_URL в .env.local, запросы через
// rewrites() в next.config.ts (фронт ходит на свой домен /api/*, Next проксирует
// на бэк — CORS не нужен). Мок-слой константу не использует.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// Эмуляция сетевой задержки (при API заменяется на fetch)
export function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
