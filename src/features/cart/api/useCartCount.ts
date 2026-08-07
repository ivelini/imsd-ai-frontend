// Селектор: количество позиций в корзине (для счётчика в шапке)
// Читает кеш useCart напрямую (правило 9: «селектор из кеша») —
// подписка на изменения кеша, без собственного useQuery.
"use client";

import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import type { CartItem } from "@/features/cart/types";

export function useCartCount() {
  const qc = useQueryClient();
  // Снапшот стабилен: undefined или та же ссылка кеша (без зацикливания)
  const items = useSyncExternalStore(
    (onStoreChange) => qc.getQueryCache().subscribe(onStoreChange),
    () => qc.getQueryData<CartItem[]>(queryKeys.cart.items),
    () => undefined, // SSR: кеша корзины на сервере нет; после гидрации — клиентский снапшот
  );
  return (items ?? []).reduce((sum, i) => sum + i.quantity, 0);
}
