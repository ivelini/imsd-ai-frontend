// Сессия клиента: GET /account/profile по Bearer-токену; нет токена или 401 — гость
"use client";

import { useQuery } from "@tanstack/react-query";
import { getSession } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: getSession,
    staleTime: 0,
  });
}
