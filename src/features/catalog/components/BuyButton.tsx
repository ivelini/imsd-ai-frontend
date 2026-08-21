"use client";
// Кнопка «Купить»/«Убрать» в карточке каталога + попапы (фаза 3, 04.08.2026)
// SSR и первый клиентский рендер — серая заглушка (одинаково). Без текста,
// чтобы не было мигания «Купить»→«Убрать». После mount — правильное состояние.
import { useCartItemActions } from "@/features/cart/api/useCartItemActions";
import { CartPopup } from "@/features/cart/components/CartPopup";
import { ConfirmRemovePopup } from "@/shared/ui/ConfirmRemovePopup";
import type { ProductBase } from "@/features/catalog/types";

export function BuyButton({ product }: { product: ProductBase }) {
  const {
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
  } = useCartItemActions(
    { id: product.id, name: product.title, price: product.price ?? 0, image: product.image },
    1,
  );

  return (
    <>
      <button
        className={`buy-now${!ready ? " buy-now--skeleton" : isInCart ? " buy-now--remove" : ""}`}
        onClick={!ready ? undefined : isInCart ? () => setConfirmOpen(true) : handleAdd}
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
