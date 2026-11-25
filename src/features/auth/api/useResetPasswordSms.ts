// Сброс пароля кодом из SMS: бэк удаляет все токены клиента — сессия сбрасывается
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPasswordSms } from "@/shared/api/data";
import type { ResetSmsInput } from "@/features/auth/types";
import { dropSession } from "./sessionCache";

export function useResetPasswordSms() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ResetSmsInput) => resetPasswordSms(input),
    onSuccess: () => dropSession(qc),
  });
}
