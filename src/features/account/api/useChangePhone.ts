// Смена телефона проверенным кодом: ответ — новый клиент, кэш сессии обновляется
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeProfilePhone } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { handleSessionError } from "@/features/auth/api/sessionCache";
import type { ChangePhoneInput } from "@/features/account/types";

export function useChangePhone() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ChangePhoneInput) => changeProfilePhone(input),

    onSuccess: (client) => {
      qc.setQueryData(queryKeys.auth.session, client);
    },

    onError: (error) => handleSessionError(qc, error),
  });
}
