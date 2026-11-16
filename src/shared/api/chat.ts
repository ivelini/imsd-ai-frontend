// Публичный чат: вопрос и чтение реплик (контракт public-chat.md; источник истины —
// ../backend/documentations/scramble/public-api.json). Ответ ассистента асинхронный:
// POST принимает вопрос (202), реплики читаются GET-поллингом. Токен — только заголовком.
import { fetchJson } from "./http";

/** Кликабельный вариант ответа: `label` — подпись; `text` — реплика при клике, `url` — переход в каталог. */
export interface ChatOptionDto {
  label: string;
  text?: string;
  url?: string;
}

/** Реплика витрины: роли `system` наружу не отдаются. */
export interface ChatMessageDto {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string | null;
  /** Кликабельные варианты; ключа нет, когда агент выбора не предлагал. */
  options?: ChatOptionDto[];
}

/** 202 POST: токен диалога и id уже записанной реплики пользователя. */
export interface ChatAcceptedDto {
  session_token: string;
  message_id: number;
  status: "accepted";
}

/** Аргументы отправки: вопрос, текущий диалог и город витрины. */
export interface ChatSendArgs {
  message: string;
  /** Токен текущего диалога; без него бэк создаст новый. */
  token?: string;
  /** Слаг выбранного на сайте города; бэк обновляет город диалога на каждом POST. */
  city?: string;
}

/** Отправка вопроса. Без токена бэк создаёт новый диалог и возвращает его в 202. */
export async function sendChatMessage({
  message,
  token,
  city,
}: ChatSendArgs): Promise<ChatAcceptedDto> {
  const body = await fetchJson("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Session-Token": token } : {}),
    },
    body: JSON.stringify({ message, ...(city ? { city } : {}) }),
  });

  return body as ChatAcceptedDto;
}

/** Реплики диалога. Поллинг полным списком: контракт отдаёт до 200 реплик без `after_id`. */
export async function fetchChatMessages(
  token: string,
  signal?: AbortSignal,
): Promise<ChatMessageDto[]> {
  const body = (await fetchJson("/chat/messages", {
    headers: { "X-Session-Token": token },
    signal,
  })) as { data?: ChatMessageDto[] } | null;

  return body?.data ?? [];
}
