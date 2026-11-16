// Общий транспорт API-слоя: разбор тела, ошибка со статусом и HTTP-запрос с отказом.
// Вынесено по правилу двух: то же было в shared/api/booking.ts, понадобилось чату.
import { apiBase } from "./base";

/** Ответ бэка для разбора доменом: статус + тело (сеть и отмена — статус 0). */
export interface ApiErrorResponse {
  status: number;
  body: unknown;
}

/** Тело отказа бэка: текст для экрана, машинный код и ошибки валидации. */
export interface ApiErrorPayload {
  message?: string;
  code?: string;
  errors?: unknown;
}

/** Общий текст, когда бэк не прислал свой. */
export const DEFAULT_API_ERROR_MESSAGE = "Не удалось выполнить запрос. Попробуйте ещё раз";

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    // 500 от прокси приходит HTML — тело не должно ронять разбор
    return null;
  }
}

/** Ошибка бэка с телом ответа: домен различает отказы по статусу и `code`, не по тексту. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`API: HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** HTTP-запрос к API: тело разбирается всегда, не-2xx → ApiError. */
export async function fetchJson(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${apiBase()}${path}`, init);
  const body = await readJson(res);

  if (!res.ok) {
    throw new ApiError(res.status, body);
  }

  return body;
}

/** Исключение запроса → ответ для разбора: не-API ошибка (сеть, отмена) сводится к «неизвестно». */
export function toErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof ApiError) {
    return { status: error.status, body: error.body };
  }

  return { status: 0, body: null };
}
