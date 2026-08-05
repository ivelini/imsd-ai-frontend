// Хук поиска заказа по номеру (фаза 4) — срабатывает, когда enabled
"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderByNumber } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useOrderByNumber(number: string, enabled: boolean) {
  return useQuery({
    queryKey: [...queryKeys.checkout.order, "by-number", number] as const,
    queryFn: () => getOrderByNumber(number),
    enabled,
    staleTime: 0,
  });
}
