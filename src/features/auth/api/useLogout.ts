// Выход: POST /auth/logout удаляет текущий токен; локально чистим всегда, даже при сбое сети
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/shared/api/data";
import { dropSession } from "./sessionCache";

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => dropSession(qc),
  });
}
