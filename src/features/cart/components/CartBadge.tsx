// Счётчик корзины в шапке: количество позиций из React Query.
// useCart здесь прогревает кеш: иначе счётчик показывал бы 0 до захода в корзину.
"use client";

import { useCart } from "@/features/cart/api/useCart";
import { useCartCount } from "@/features/cart/api/useCartCount";

export function CartBadge() {
  useCart();
  const count = useCartCount();
  return <span id="count-in-busket">{count}</span>;
}
