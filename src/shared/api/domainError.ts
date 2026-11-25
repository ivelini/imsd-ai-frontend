/**
 * Общий разбор доменного отказа бэка: машинный код → состояние экрана.
 *
 * Вынесено по правилу двух: то же было в features/checkout/lib/errors.ts,
 * понадобилось аккаунту. Карта кодов и состояния остаются у домена: здесь
 * только форма тела (`code`, `message`, `retry_after`) и защита от технических
 * текстов валидации.
 */
import type { ApiErrorPayload, ApiErrorResponse } from "./http";
import { DEFAULT_API_ERROR_MESSAGE } from "./http";

export interface DomainErrorResult<T extends string> {
  state: T | "unknown";
  message: string;
  /** Остаток кулдауна из тела 429 — таймер кнопки, а не константа фронта */
  retryAfter?: number;
}

export function mapDomainError<T extends string>(
  { body }: ApiErrorResponse,
  statesByCode: Record<string, T>,
): DomainErrorResult<T> {
  const payload = (body ?? {}) as ApiErrorPayload & { retry_after?: number };
  const state = payload.code ? statesByCode[payload.code] : undefined;

  // Ошибки валидации приходят без машинного кода, а их `message` — технический
  // ключ («validation.required»): на экран такое пускать нельзя
  if (state === undefined && payload.errors !== undefined) {
    return { state: "unknown", message: DEFAULT_API_ERROR_MESSAGE };
  }

  return {
    state: state ?? "unknown",
    message: payload.message ?? DEFAULT_API_ERROR_MESSAGE,
    retryAfter: payload.retry_after,
  };
}
