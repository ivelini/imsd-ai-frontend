// Мутация: создать заказ (оформление, фаза 4)
// createOrder сам чистит корзину (мок) — invalidate обновляет счётчик и заказ
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/shared/api/data";
import { queryKeys } from "@/shared/api/queryKeys";

export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createOrder,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart.items });
      qc.invalidateQueries({ queryKey: queryKeys.checkout.order });
    },
  });
}
