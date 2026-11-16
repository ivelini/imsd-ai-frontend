"use client";
// Отправка вопроса в чат: POST /api/chat; ответ ассистента приходит поллингом.
import { useMutation } from "@tanstack/react-query";
import { sendChatMessage } from "@/shared/api/chat";

export function useSendChatMessage() {
  return useMutation({ mutationFn: sendChatMessage });
}
