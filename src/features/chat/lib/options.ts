// Кликабельные варианты ответа: показываем только у последней реплики ленты и только
// у ответа ассистента (контракт public-chat-frontend.md). После клика по text-варианту
// последняя реплика — вопрос пользователя, поэтому кнопки исчезают сами; клик по url
// реплики не создаёт — такие варианты скрывает visibleOptions по dismissedMessageId.
import type { ChatMessageDto, ChatOptionDto } from "@/shared/api/chat";

export function lastOptions(messages: ChatMessageDto[]): ChatOptionDto[] {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") {
    return [];
  }

  return last.options ?? [];
}

/** Варианты для ленты: только у последней реплики и только если её ещё не кликали. */
export function visibleOptions(
  messages: ChatMessageDto[],
  dismissedMessageId: number | null,
): ChatOptionDto[] {
  const last = messages[messages.length - 1];
  if (!last || last.id === dismissedMessageId) {
    return [];
  }

  return lastOptions(messages);
}

/**
 * Ссылка ведёт на текущий адрес: `router.push` по тому же пути ничего не обновит,
 * страницу нужно перезапросить (`router.refresh`).
 */
export function isCurrentLocation(url: string, current: string): boolean {
  return url === current;
}
