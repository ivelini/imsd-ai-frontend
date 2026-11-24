// Хук чтения корзины: город влияет на цены — он в ключе кеша и в запросе
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { useCity } from "@/shared/layout/api/useCity";

export function useCart() {
  const { citySlug } = useCity();

  return useQuery({
    // без города запрос не отправляем: иначе первый ответ придёт не в том городе
    queryKey: queryKeys.cart.items(citySlug),
    queryFn: () => getCart(citySlug),
    enabled: citySlug !== "",
    staleTime: 0, // всегда свежая
  });
}
