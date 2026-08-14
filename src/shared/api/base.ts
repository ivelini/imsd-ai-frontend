// База API-слоя: конфиг и утилиты (общие для доменных модулей)
// При подключении Laravel: NEXT_PUBLIC_API_URL в .env.local, запросы через
// rewrites() в next.config.ts (фронт ходит на свой домен /api/*, Next проксирует
// на бэк — CORS не нужен). Мок-слой константу не использует.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// Серверный fetch не принимает относительные URL: внутри контейнера бэк
// доступен напрямую по docker-имени (сеть imsd-ai), из браузера — через
// same-origin rewrites. Локальный dev вне Docker: BACKEND_URL=http://localhost:8081
const SERVER_API_BASE = process.env.BACKEND_URL ?? "http://imsd-backend-nginx";

/** База API с учётом контекста: браузер → /api (rewrite), сервер → прямой URL бэка */
export function apiBase(): string {
  return typeof window === "undefined" ? `${SERVER_API_BASE}/api` : API_BASE;
}

// Эмуляция сетевой задержки (мок-геттеры)
export function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
