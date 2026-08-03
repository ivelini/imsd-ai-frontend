// Хук чтения корзины (03.08.2026)
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCartItems } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useCart() {
  return useQuery({
    queryKey: queryKeys.cart.items,
    queryFn: getCartItems,
    staleTime: 0, // всегда свежая
  });
}
