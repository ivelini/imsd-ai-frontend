"use client";
// Реплики диалога и поллинг ответа: опрос — в хуке, не в компоненте (контракт public-chat.md).
import { useEffect, useState } from "react";
import { skipToken, useQuery } from "@tanstack/react-query";
import { fetchChatMessages } from "@/shared/api/chat";
import { ApiError } from "@/shared/api/http";
import { queryKeys } from "@/shared/api/queryKeys";
import {
  CHAT_POLL_INTERVAL_MS,
  CHAT_WAIT_TIMEOUT_MS,
  isAwaitingAnswer,
  isWaitTimedOut,
  shouldPoll,
} from "@/features/chat/lib/polling";

const TICK_MS = 1000;

export function useChatMessages(token: string | null, onSessionExpired: () => void) {
  const [retryUntil, setRetryUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  const query = useQuery({
    queryKey: queryKeys.chat.messages(token),
    // Нового диалога ещё нет — запрос не выполняется, приветствие видно сразу.
    // 404 — токен протух: владелец токена (окно) стирает его и сбрасывает диалог
    queryFn: token
      ? async ({ signal }) => {
          try {
            return await fetchChatMessages(token, signal);
          } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
              onSessionExpired();
            }

            throw error;
          }
        }
      : skipToken,
    staleTime: 0,
    // 404/429/5xx не повторяем: ошибку показывает плашка, «Повторить» перезапускает опрос
    retry: false,
    refetchInterval: (q) => {
      // Ошибку (429/404) не разгоняем в цикл повторов
      if (q.state.error) {
        return false;
      }

      return shouldPoll(q.state.data ?? [], Date.now(), retryUntil)
        ? CHAT_POLL_INTERVAL_MS
        : false;
    },
  });

  const messages = query.data ?? [];
  const awaiting = isAwaitingAnswer(messages);

  // Пока ждём ответ — секундный тик: таймаут и его снятие повтором должны быть видны
  useEffect(() => {
    if (!awaiting) {
      return;
    }

    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [awaiting, messages.length]);

  const retry = () => {
    setRetryUntil(Date.now() + CHAT_WAIT_TIMEOUT_MS);
    setNow(Date.now());
    void query.refetch();
  };

  return {
    messages,
    error: query.error,
    retry,
    timedOut: isWaitTimedOut(messages, now, retryUntil),
  };
}
