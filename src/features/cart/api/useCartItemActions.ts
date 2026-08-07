// Общая логика кнопок корзины (фаза 3): состояние попапов, поиск товара в корзине,
// добавление/удаление. Используется BuyButton (каталог) и AddToCartBlock (товар).
"use client";

import { useState, useEffect } from "react";
import { useAddToCart } from "@/features/cart/api/useAddToCart";
import { useRemoveFromCart } from "@/features/cart/api/useRemoveFromCart";
import { useCart } from "@/features/cart/api/useCart";
import type { CartAddPayload } from "@/shared/api/data";

export function useCartItemActions(item: CartAddPayload, quantity: number) {
  const [ready, setReady] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: add, isPending } = useAddToCart();
  const { mutate: remove } = useRemoveFromCart();
  const { data: items } = useCart();

  // После mount — рендер по данным корзины (post-hydration update)
  useEffect(() => setReady(true), []);

  const cartItem = items?.find((i) => i.id === item.id);
  const isInCart = ready && !!cartItem;

  const handleAdd = () => {
    add({ item, quantity }, { onSuccess: () => setPopupOpen(true) });
  };

  const handleRemove = () => {
    remove(item.id);
    setConfirmOpen(false);
  };

  return {
    cartItem,
    isInCart,
    isPending,
    ready,
    handleAdd,
    handleRemove,
    popupOpen,
    confirmOpen,
    setPopupOpen,
    setConfirmOpen,
  };
}
