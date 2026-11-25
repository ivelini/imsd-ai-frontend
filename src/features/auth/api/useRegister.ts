// Регистрация: токен сохраняется постоянно, сессия в кэш, корзина перечитывается с Bearer
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { browserTokenStorages, saveAuthToken } from "@/shared/lib/authToken";
import type { ClientLogin, RegisterInput } from "@/features/auth/types";

export function useRegister() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => register(input),

    onSuccess: (result: ClientLogin) => {
      const storages = browserTokenStorages();

      if (storages !== null) saveAuthToken(storages, result.token, true);

      qc.setQueryData(queryKeys.auth.session, result.client);
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
