// Сохранение матрицы уведомлений: бэк возвращает эффективные настройки — кладём в кэш
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveNotificationSettings } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { handleSessionError } from "@/features/auth/api/sessionCache";
import type { NotificationSettingDto } from "@/features/account/types";

export function useSaveNotificationSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (settings: NotificationSettingDto[]) => saveNotificationSettings(settings),

    onSuccess: (rows) => {
      qc.setQueryData(queryKeys.account.notifications, rows);
    },

    onError: (error) => handleSessionError(qc, error),
  });
}
