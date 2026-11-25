// Настройки уведомлений: матрица событие × канал из бэка
"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotificationSettings } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useNotificationSettings() {
  return useQuery({
    queryKey: queryKeys.account.notifications,
    queryFn: getNotificationSettings,
  });
}
