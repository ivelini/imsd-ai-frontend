// Мутация: изменить количество в корзине (03.08.2026)
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItem } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import type { CartItem } from "@/features/cart/types";

export function useUpdateCartItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; delta: number }) =>
      updateCartItem(args.id, args.delta),

    onMutate: async ({ id, delta }) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart.items });
      const prev = qc.getQueryData<CartItem[]>(queryKeys.cart.items) ?? [];
      const next = prev
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0);
      qc.setQueryData(queryKeys.cart.items, next);
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
