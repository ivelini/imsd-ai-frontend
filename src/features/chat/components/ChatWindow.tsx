"use client";
// Окно чата: шапка, лента реплик, ввод. Вёрстка и поведение — макет .template/chat/:
// резиновое окно за левый верхний угол, поле ввода до 5 строк, на мобильном — экран минус 16 px.
import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toErrorResponse } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/queryKeys";
import { useCity } from "@/shared/layout/api/useCity";
import { useEsc } from "@/shared/lib/useEsc";
import { useChatMessages } from "@/features/chat/api/useChatMessages";
import { useSendChatMessage } from "@/features/chat/api/useSendChatMessage";
import {
  CHAT_UNAVAILABLE_MESSAGE,
  mapChatError,
  type ChatErrorResult,
} from "@/features/chat/lib/errors";
import { ChatBubbleIcon } from "@/features/chat/components/ChatIcons";
import { isCurrentLocation, visibleOptions } from "@/features/chat/lib/options";
import { clearChatToken, readChatToken, saveChatToken } from "@/features/chat/lib/session";
import { formatChatTime } from "@/features/chat/lib/time";

const GREETING =
  "Здравствуйте! Я ИИ-ассистент Автоальянс. Помогу подобрать шины и диски, расскажу о доставке и записи на шиномонтаж.";
// Контракт POST /api/chat: message 1–2000 символов
const MAX_MESSAGE_LENGTH = 2000;

interface ChatWindowProps {
  onClose: () => void;
}

interface ChatNotice {
  message: string;
  retryable: boolean;
}

interface ResizeStart {
  startX: number;
  startY: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

/**
 * Плашка состояния: ошибка отправки → таймаут ожидания → ошибка чтения.
 * Протухший диалог плашки не рисует — токен сбрасывается, остаётся приветствие.
 */
function toNotice(
  sendError: ChatErrorResult | null,
  timedOut: boolean,
  readError: ChatErrorResult | null,
): ChatNotice | null {
  if (sendError) {
    return { message: sendError.message, retryable: false };
  }

  if (timedOut) {
    return { message: CHAT_UNAVAILABLE_MESSAGE, retryable: true };
  }

  if (readError && readError.kind !== "session_expired") {
    return { message: readError.message, retryable: true };
  }

  return null;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  // Токен диалога — единственный владелец сессии окна; переживает закрытие через localStorage
  const [token, setToken] = useState<string | null>(() => readChatToken());
  const [text, setText] = useState("");
  const [sendError, setSendError] = useState<ChatErrorResult | null>(null);
  // Реплика, варианты которой уже кликнули: ссылка уводит со страницы, поэтому скрываем сами
  const [dismissedMessageId, setDismissedMessageId] = useState<number | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resizeRef = useRef<ResizeStart | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Протухший диалог: окно — владелец токена, поэтому сброс (стирание + приветствие) здесь
  const expireSession = () => {
    clearChatToken();
    setToken(null);
  };

  const { messages, error: readError, retry, timedOut } = useChatMessages(token, expireSession);
  const { mutate: send, isPending } = useSendChatMessage();
  // Город, который посетитель видит на сайте; бэк обновляет город диалога на каждом POST
  const { citySlug } = useCity();

  useEsc(onClose);

  const readErrorResult = readError ? mapChatError(toErrorResponse(readError)) : null;
  const notice = toNotice(sendError, timedOut, readErrorResult);
  const noticeMessage = notice?.message ?? null;
  const lastMessageId = messages[messages.length - 1]?.id ?? null;
  const options = visibleOptions(messages, dismissedMessageId);

  // Лента открывается на последней реплике
  useEffect(() => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, noticeMessage, timedOut]);

  const resizeInput = () => {
    const el = inputRef.current;
    if (!el) {
      return;
    }

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    resizeInput();
  };

  /** Общий путь отправки: форма очищает поле, клик по варианту — нет. */
  const sendMessage = (raw: string, clearInput: boolean) => {
    const message = raw.trim();
    if (!message || isPending) {
      return;
    }

    send(
      { message, token: token ?? undefined, city: citySlug },
      {
        onSuccess: (accepted) => {
          saveChatToken(accepted.session_token);
          setToken(accepted.session_token);
          void queryClient.invalidateQueries({ queryKey: queryKeys.chat.all });
          setSendError(null);
          if (!clearInput) {
            return;
          }

          setText("");
          if (inputRef.current) {
            inputRef.current.style.height = "auto";
          }
        },
        onError: (cause) => {
          const result = mapChatError(toErrorResponse(cause));
          if (result.kind === "session_expired") {
            expireSession();
          }

          setSendError(result);
        },
      },
    );
  };

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(text, true);
  };

  /** Переход по варианту-ссылке: без POST; текущий адрес — принудительное обновление страницы. */
  const openOptionLink = (event: ReactMouseEvent<HTMLAnchorElement>, url: string) => {
    // Средний клик и клики с модификаторами оставляем браузеру (новая вкладка)
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    setDismissedMessageId(lastMessageId);

    const current = window.location.pathname + window.location.search;
    if (isCurrentLocation(url, current)) {
      router.refresh();
      return;
    }

    router.push(url);
  };

  const startResize = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const el = windowRef.current;
    if (!el) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = el.getBoundingClientRect();
    const styles = getComputedStyle(el);
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      width: rect.width,
      height: rect.height,
      minWidth: parseFloat(styles.minWidth),
      minHeight: parseFloat(styles.minHeight),
      // max-* заданы calc(...) — не число; край экрана считаем сами
      maxWidth: parseFloat(styles.maxWidth) || window.innerWidth - 32,
      maxHeight: parseFloat(styles.maxHeight) || window.innerHeight - 48,
    };
  };

  const moveResize = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const start = resizeRef.current;
    const el = windowRef.current;
    if (!start || !el) {
      return;
    }

    const width = start.width - (event.clientX - start.startX);
    const height = start.height - (event.clientY - start.startY);
    el.style.width = `${Math.min(start.maxWidth, Math.max(start.minWidth, width))}px`;
    el.style.height = `${Math.min(start.maxHeight, Math.max(start.minHeight, height))}px`;
  };

  const endResize = (event: ReactPointerEvent<HTMLSpanElement>) => {
    resizeRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="chat-widget">
      <div className="chat-window" ref={windowRef} role="dialog" aria-label="Чат с ИИ-ассистентом">
        <span
          className="chat-resize"
          aria-hidden="true"
          title="Изменить размер"
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M15 1 1 15M10 1 1 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>

        <header className="chat-header">
          <span className="chat-header-avatar" aria-hidden="true">
            <ChatBubbleIcon size={24} />
          </span>
          <div className="chat-header-info">
            <p className="chat-header-name">ИИ-ассистент</p>
            <p className="chat-header-status">
              <span className="chat-status-dot" />
              Онлайн
            </p>
          </div>
          <button className="chat-close" type="button" aria-label="Закрыть чат" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="chat-messages" ref={messagesRef}>
          {messages.length === 0 && (
            <div className="chat-msg chat-msg-assistant">
              <p className="chat-msg-text">{GREETING}</p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-msg ${message.role === "user" ? "chat-msg-user" : "chat-msg-assistant"}`}
            >
              <p className="chat-msg-text">{message.content}</p>
              {message.created_at && (
                <span className="chat-msg-time">{formatChatTime(message.created_at)}</span>
              )}
            </div>
          ))}
          {options.length > 0 && (
            <div className="chat-options">
              {options.map((option) => {
                if (option.url) {
                  const url = option.url;
                  return (
                    <a
                      key={url}
                      className="chat-option"
                      href={url}
                      onClick={(event) => openOptionLink(event, url)}
                    >
                      {option.label}
                    </a>
                  );
                }

                const optionText = option.text;
                if (!optionText) {
                  return null;
                }

                return (
                  <button
                    key={optionText}
                    className="chat-option"
                    type="button"
                    disabled={isPending}
                    onClick={() => sendMessage(optionText, false)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
          {notice && (
            <div className="chat-notice" role="alert">
              <span>{notice.message}</span>
              {notice.retryable && (
                <button className="chat-notice-retry" type="button" onClick={retry}>
                  Повторить
                </button>
              )}
            </div>
          )}
        </div>

        <form className="chat-composer" onSubmit={handleSend}>
          <textarea
            className="chat-input"
            rows={1}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Напишите сообщение..."
            aria-label="Сообщение"
            value={text}
            onChange={handleChange}
            ref={inputRef}
          />
          <button
            className="chat-send"
            type="submit"
            aria-label="Отправить"
            disabled={isPending || text.trim().length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M22 2 15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
