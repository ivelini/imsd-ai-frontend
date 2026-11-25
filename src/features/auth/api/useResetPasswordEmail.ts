// Сброс пароля по ссылке из письма: бэк удаляет все токены клиента — сессия сбрасывается
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resetPasswordEmail } from "@/shared/api/data";
import type { ResetEmailInput } from "@/features/auth/types";
import { dropSession } from "./sessionCache";

export function useResetPasswordEmail() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ResetEmailInput) => resetPasswordEmail(input),
    onSuccess: () => dropSession(qc),
  });
}
