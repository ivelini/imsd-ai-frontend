// Селектор: количество позиций в корзине (для счётчика в шапке)
// Читает кеш useCart напрямую (правило 9: «селектор из кеша») —
// подписка на изменения кеша, без собственного useQuery.
"use client";

import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api/queryKeys";
import type { CartView } from "@/features/cart/types";
import { useCity } from "@/shared/layout/api/useCity";

export function useCartCount() {
  const qc = useQueryClient();
  const { citySlug } = useCity();
  // Снапшот стабилен: undefined или та же ссылка кеша (без зацикливания)
  const cart = useSyncExternalStore(
    (onStoreChange) => qc.getQueryCache().subscribe(onStoreChange),
    () => qc.getQueryData<CartView>(queryKeys.cart.items(citySlug)),
    () => undefined, // SSR: кеша корзины на сервере нет; после гидрации — клиентский снапшот
  );

  return (cart?.items ?? []).reduce((sum, item) => sum + item.quantity, 0);
}
