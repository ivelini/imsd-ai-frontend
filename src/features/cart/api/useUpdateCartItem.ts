// Мутация: изменить количество строки корзины (абсолютное значение, не дельта)
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItemQuantity } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import { useCity } from "@/shared/layout/api/useCity";

interface UpdateCartItemVars {
  lineId: string;
  quantity: number;
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  const { citySlug } = useCity();

  return useMutation({
    mutationFn: ({ lineId, quantity }: UpdateCartItemVars) =>
      updateCartItemQuantity(lineId, quantity, citySlug),

    onSuccess: (cart) => {
      qc.setQueryData(queryKeys.cart.items(citySlug), cart);
    },
  });
}
