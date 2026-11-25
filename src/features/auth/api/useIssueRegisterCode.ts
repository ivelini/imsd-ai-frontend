// Код регистрации на телефон; ответ несёт длительность кулдауна повторной отправки
"use client";

import { useMutation } from "@tanstack/react-query";
import { requestRegisterCode } from "@/shared/api/data";

export function useIssueRegisterCode() {
  return useMutation({
    mutationFn: (phone: string) => requestRegisterCode(phone),
  });
}
