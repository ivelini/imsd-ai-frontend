// Общие API-типы (03.08.2026)
// При подключении API — синхронизировать с DTO бэкенда

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
