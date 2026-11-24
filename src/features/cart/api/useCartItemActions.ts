// Общая логика кнопок корзины (фаза 3): состояние попапов, поиск товара в корзине,
// добавление/удаление. Используется BuyButton (каталог) и AddToCartBlock (товар).
"use client";

import { useState, useSyncExternalStore } from "react";
import { useAddToCart } from "@/features/cart/api/useAddToCart";
import { useRemoveFromCart } from "@/features/cart/api/useRemoveFromCart";
import { useCart } from "@/features/cart/api/useCart";
import {
  findCartItemByProduct,
  type CartProductRef,
} from "@/features/cart/lib/itemable";

// Пустая подписка: «готово» — не событие внешнего мира, а факт клиента
const emptySubscribe = () => () => {};

export function useCartItemActions(item: CartProductRef, quantity: number) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: add, isPending } = useAddToCart();
  const { mutate: remove } = useRemoveFromCart();
  const { data: cart } = useCart();

  // false при SSR и гидратации, true — на клиенте: данные корзины рендерятся после гидратации
  const ready = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const cartItem = cart ? findCartItemByProduct(cart.items, item) : undefined;
  const isInCart = ready && !!cartItem;

  const handleAdd = () => {
    add({ ref: item, quantity }, { onSuccess: () => setPopupOpen(true) });
  };

  const handleRemove = () => {
    if (cartItem) remove(cartItem.id);
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
