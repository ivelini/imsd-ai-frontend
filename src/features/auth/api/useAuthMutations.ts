// Мутации сессии: вход / регистрация / выход (фаза 4)
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginMock, registerMock, logoutMock } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

const invalidateSession = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: queryKeys.auth.session });
};

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { login: string; password: string; remember: boolean }) =>
      loginMock(args.login, args.password, args.remember),
    onSettled: () => invalidateSession(qc),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { name: string; login: string; password: string }) =>
      registerMock(args.name, args.login, args.password),
    onSettled: () => invalidateSession(qc),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logoutMock,
    onSettled: () => invalidateSession(qc),
  });
}
