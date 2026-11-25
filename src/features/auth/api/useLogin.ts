// Вход: токен в выбранное хранилище, сессия в кэш, корзина перечитывается с Bearer
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { browserTokenStorages, saveAuthToken } from "@/shared/lib/authToken";
import type { ClientLogin, LoginInput } from "@/features/auth/types";

interface LoginVars extends LoginInput {
  remember: boolean;
}

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, password }: LoginVars) => login({ phone, password }),

    onSuccess: (result: ClientLogin, vars) => {
      const storages = browserTokenStorages();

      if (storages !== null) saveAuthToken(storages, result.token, vars.remember);

      qc.setQueryData(queryKeys.auth.session, result.client);
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
