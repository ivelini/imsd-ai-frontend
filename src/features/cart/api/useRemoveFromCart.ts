// Мутация: удалить строку корзины; ответ сервера — новая корзина
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCartItem } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { useCity } from "@/shared/layout/api/useCity";

export function useRemoveFromCart() {
  const qc = useQueryClient();
  const { citySlug } = useCity();

  return useMutation({
    mutationFn: (lineId: string) => removeCartItem(lineId, citySlug),

    onSuccess: (cart) => {
      qc.setQueryData(queryKeys.cart.items(citySlug), cart);
    },
  });
}
