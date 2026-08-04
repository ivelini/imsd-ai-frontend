"use client";
// Кнопка «Купить»/«Убрать» в карточке каталога + попапы (фаза 3, 04.08.2026)
// SSR и первый клиентский рендер — серая заглушка (одинаково). Без текста,
// чтобы не было мигания «Купить»→«Убрать». После mount — правильное состояние.
import { useState, useEffect } from "react";
import { useAddToCart } from "@/features/cart/api/useAddToCart";
import { useRemoveFromCart } from "@/features/cart/api/useRemoveFromCart";
import { useCart } from "@/features/cart/api/useCart";
import { CartPopup } from "@/shared/ui/CartPopup";
import { ConfirmRemovePopup } from "@/shared/ui/ConfirmRemovePopup";
import type { ProductBase } from "@/features/catalog/types";

export function BuyButton({ product }: { product: ProductBase }) {
  const [popupOpen, setPopupOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const { mutate: add, isPending } = useAddToCart();
  const { mutate: remove } = useRemoveFromCart();
  const { data: items } = useCart();

  // После mount — рендер по данным корзины (post-hydration update)
  useEffect(() => setReady(true), []);

  const cartItem = items?.find((i) => i.id === product.id);
  const isInCart = ready && !!cartItem;

  const handleBuy = () => {
    add(
      {
        item: {
          id: product.id,
          name: product.title,
          price: product.price,
          image: product.image,
        },
        quantity: 1,
      },
      { onSuccess: () => setPopupOpen(true) },
    );
  };

  const handleRemove = () => {
    remove(product.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <button
        className={`buy-now${!ready ? " buy-now--skeleton" : isInCart ? " buy-now--remove" : ""}`}
        onClick={!ready ? undefined : isInCart ? () => setConfirmOpen(true) : handleBuy}
      >
        <p>{!ready ? "" : isInCart ? "Убрать" : isPending ? "Добавление..." : "Купить"}</p>
<img src="/assets/img/bag.svg" alt="" />
      </button>

      {popupOpen && cartItem && (
        <CartPopup item={cartItem} addedQuantity={1} onClose={() => setPopupOpen(false)} />
      )}

      {confirmOpen && (
        <ConfirmRemovePopup
          name={product.title}
          onConfirm={handleRemove}
          onClose={() => setConfirmOpen(false)}
        />
      )}
    </>
  );
}
