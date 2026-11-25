// Правка ФИО/email: ответ бэка — новый клиент, кэш сессии обновляется сразу
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { handleSessionError } from "@/features/auth/api/sessionCache";
import type { ProfileInput } from "@/features/account/types";

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileInput) => updateProfile(input),

    onSuccess: (client) => {
      qc.setQueryData(queryKeys.auth.session, client);
    },

    onError: (error) => handleSessionError(qc, error),
  });
}
