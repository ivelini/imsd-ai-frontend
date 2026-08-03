// Мутация: удалить из корзины (03.08.2026)
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFromCart } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import type { CartItem } from "@/features/cart/types";

export function useRemoveFromCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeFromCart(id),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart.items });
      const prev = qc.getQueryData<CartItem[]>(queryKeys.cart.items) ?? [];
      qc.setQueryData(
        queryKeys.cart.items,
        prev.filter((i) => i.id !== id),
      );
      return { prev };
    },

    onError: (_err, _args, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.cart.items, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.items });
    },
  });
}
