// Мутация: добавить товар в корзину — ответ сервера (вся корзина) кладём в кеш
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCartItem } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { useCity } from "@/shared/layout/api/useCity";
import type { CartProductRef } from "@/features/cart/lib/itemable";

interface AddToCartVars {
  ref: CartProductRef;
  quantity: number;
}

export function useAddToCart() {
  const qc = useQueryClient();
  const { citySlug } = useCity();

  return useMutation({
    mutationFn: ({ ref, quantity }: AddToCartVars) =>
      addCartItem(
        { itemableType: ref.itemableType, itemableId: ref.itemableId, quantity },
        citySlug,
      ),

    onSuccess: (cart) => {
      qc.setQueryData(queryKeys.cart.items(citySlug), cart);
    },
  });
}
