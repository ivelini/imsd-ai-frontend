// Селектор: количество позиций в корзине (для счётчика в шапке)
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCartItems } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useCartCount() {
  const { data } = useQuery({
    queryKey: queryKeys.cart.items,
    queryFn: getCartItems,
    staleTime: 0,
  });
  return data?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
}
