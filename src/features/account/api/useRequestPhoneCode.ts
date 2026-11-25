// Код на новый телефон профиля; ответ несёт длительность кулдауна повторной отправки
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestProfilePhoneCode } from "@/shared/api/data";
import { handleSessionError } from "@/features/auth/api/sessionCache";

export function useRequestPhoneCode() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (phone: string) => requestProfilePhoneCode(phone),
    onError: (error) => handleSessionError(qc, error),
  });
}
