// Мутация: подтвердить заказ кодом из SMS (шаг 2).
// Бэк сам очищает корзину — инвалидируем кеш, чтобы счётчик в шапке обнулился.
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmCheckout } from "@/shared/api/data";
import { buildCheckoutPayload } from "@/features/checkout/lib/payload";
import type { CheckoutDraft } from "@/features/checkout/types";

interface ConfirmCheckoutVars {
  draft: CheckoutDraft;
  code: string;
}

export function useConfirmCheckout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ draft, code }: ConfirmCheckoutVars) =>
      confirmCheckout(buildCheckoutPayload(draft, code), draft.idempotencyKey),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
