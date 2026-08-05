// Хук чтения заказа по id (фаза 4) — заказ хранится в localStorage (мок)
"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrder } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useOrder(id: string) {
  return useQuery({
    queryKey: [...queryKeys.checkout.order, id] as const,
    queryFn: () => getOrder(id),
    staleTime: 0,
  });
}
