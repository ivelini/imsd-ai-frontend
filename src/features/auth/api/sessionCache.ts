// Сброс сессии: выход, сброс пароля (бэк удаляет все токены) и ответ 401.
// Одно место, чтобы токен и пользовательские кэши чистились одинаково.
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import { ApiError } from "@/shared/api/http";
import { browserTokenStorages, clearAuthToken } from "@/shared/lib/authToken";

export function dropSession(qc: QueryClient): void {
  const storages = browserTokenStorages();

  if (storages !== null) clearAuthToken(storages);

  qc.setQueryData(queryKeys.auth.session, null);
  qc.removeQueries({ queryKey: ["cart"] });
  qc.removeQueries({ queryKey: ["account"] });
}

/** Ответ 401 в мутации: токен больше не принят — сбрасываем сессию, экран уведёт на вход. */
export function handleSessionError(qc: QueryClient, error: unknown): void {
  if (error instanceof ApiError && error.status === 401) dropSession(qc);
}
