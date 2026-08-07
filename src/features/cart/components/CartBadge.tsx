// Счётчик корзины в шапке: количество позиций из React Query
"use client";

import { useCartCount } from "@/features/cart/api/useCartCount";

export function CartBadge() {
  const count = useCartCount();
  return <span id="count-in-busket">{count}</span>;
}
