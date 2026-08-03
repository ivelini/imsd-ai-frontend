// Мутация: добавить в корзину (03.08.2026)
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart, type CartAddPayload } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";
import type { CartItem } from "@/features/cart/types";

export function useAddToCart() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (args: { item: CartAddPayload; quantity?: number }) =>
      addToCart(args.item, args.quantity),

    onMutate: async ({ item, quantity = 1 }) => {
      await qc.cancelQueries({ queryKey: queryKeys.cart.items });
      const prev = qc.getQueryData<CartItem[]>(queryKeys.cart.items) ?? [];
      const optimistic: CartItem = { ...item, quantity };
      const existing = prev.findIndex((i) => i.id === item.id);
      const next =
        existing >= 0
          ? prev.map((i, idx) =>
              idx === existing ? { ...i, quantity: i.quantity + quantity } : i,
            )
          : [...prev, optimistic];
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
