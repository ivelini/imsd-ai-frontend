// Правила поллинга чата: опрашиваем, пока ждём ответ ассистента, и не дольше 60 секунд
// (контракт public-chat.md). «Повторить» открывает новое окно ожидания без повторного POST.
import type { ChatMessageDto } from "@/shared/api/chat";

export const CHAT_POLL_INTERVAL_MS = 1500;
export const CHAT_WAIT_TIMEOUT_MS = 60_000;

/** Реплика, которой достаточно для решения о поллинге. */
type ChatReply = Pick<ChatMessageDto, "role" | "created_at">;

function lastReply(messages: ChatReply[]): ChatReply | undefined {
  return messages[messages.length - 1];
}

/** Последняя реплика — вопрос пользователя: ответа ещё нет. */
export function isAwaitingAnswer(messages: ChatReply[]): boolean {
  return lastReply(messages)?.role === "user";
}

/** Сколько ждём: мс с времени последнего вопроса; `null` — время не пришло (ждать без таймера). */
function waitingMs(messages: ChatReply[], now: number): number | null {
  const createdAt = lastReply(messages)?.created_at;
  if (!createdAt) {
    return null;
  }

  const startedAt = Date.parse(createdAt);
  return Number.isNaN(startedAt) ? null : now - startedAt;
}

/** Поллинг идёт, пока ждём ответ и не истекло окно ожидания (или его продлили повтором). */
export function shouldPoll(
  messages: ChatReply[],
  now: number,
  retryUntil: number,
): boolean {
  if (!isAwaitingAnswer(messages)) {
    return false;
  }

  if (now < retryUntil) {
    return true;
  }

  const waited = waitingMs(messages, now);
  return waited === null || waited <= CHAT_WAIT_TIMEOUT_MS;
}

/** Ожидание истекло: ждём ответ, но опрос уже остановлен правилом окна. */
export function isWaitTimedOut(
  messages: ChatReply[],
  now: number,
  retryUntil: number,
): boolean {
  return isAwaitingAnswer(messages) && !shouldPoll(messages, now, retryUntil);
}
