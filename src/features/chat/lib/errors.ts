/**
 * Ошибки чата → состояние экрана.
 *
 * Разделение — по статусу и машинному `code` бэка (`ai.off_topic`): текст сообщения
 * правят свободно, а экран должен различать «не по теме», протухшую сессию, лимит,
 * формат и недоступность. Ветвиться по тексту нельзя.
 */
import type { ApiErrorPayload, ApiErrorResponse } from "@/shared/api/http";
import { DEFAULT_API_ERROR_MESSAGE } from "@/shared/api/http";

export type ChatErrorKind =
  | "off_topic"
  | "session_expired"
  | "limit"
  | "invalid"
  | "unavailable"
  | "unknown";

export interface ChatErrorResult {
  kind: ChatErrorKind;
  message: string;
}

const INVALID_MESSAGE = "Не удалось отправить сообщение. Попробуйте ещё раз";
const SESSION_EXPIRED_MESSAGE = "Диалог не найден. Отправьте вопрос ещё раз";

/** Общий текст недоступности: тот же у 5xx и у таймаута ожидания ответа. */
export const CHAT_UNAVAILABLE_MESSAGE = "Сервис временно недоступен";

export function mapChatError({ status, body }: ApiErrorResponse): ChatErrorResult {
  const payload = (body ?? {}) as ApiErrorPayload;

  if (status === 0 || status >= 500) {
    return { kind: "unavailable", message: CHAT_UNAVAILABLE_MESSAGE };
  }

  if (status === 404) {
    return { kind: "session_expired", message: SESSION_EXPIRED_MESSAGE };
  }

  if (status === 429) {
    return { kind: "limit", message: payload.message ?? CHAT_UNAVAILABLE_MESSAGE };
  }

  if (status === 400 && payload.code === "ai.off_topic") {
    return { kind: "off_topic", message: payload.message ?? DEFAULT_API_ERROR_MESSAGE };
  }

  // 422 — технические ключи валидации (`validation.*`): на экран только общий текст
  if (status === 422) {
    return { kind: "invalid", message: INVALID_MESSAGE };
  }

  return { kind: "unknown", message: payload.message ?? DEFAULT_API_ERROR_MESSAGE };
}
