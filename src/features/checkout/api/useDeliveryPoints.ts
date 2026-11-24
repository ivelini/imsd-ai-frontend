// Точки самовывоза города: без города запрос не отправляем — бэк взял бы город по умолчанию
"use client";

import { useQuery } from "@tanstack/react-query";
import { getDeliveryPoints } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useDeliveryPoints(city: string) {
  return useQuery({
    queryKey: queryKeys.checkout.deliveryPoints(city),
    queryFn: () => getDeliveryPoints(city),
    enabled: city !== "",
    staleTime: 0, // точки правятся в админке — справочник обязан быть свежим
  });
}
