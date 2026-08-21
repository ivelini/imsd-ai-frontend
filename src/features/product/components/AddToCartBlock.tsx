"use client";
// Количество + кнопка «Добавить в корзину»/«Убрать» + попапы (фаза 3, 04.08.2026)
import { useState } from "react";
import { useCartItemActions } from "@/features/cart/api/useCartItemActions";
import { CartPopup } from "@/features/cart/components/CartPopup";
import { ConfirmRemovePopup } from "@/shared/ui/ConfirmRemovePopup";
import type { ProductDetailData } from "../types";

export function AddToCartBlock({ product }: { product: ProductDetailData }) {
  const [quantity, setQuantity] = useState(1);
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
    quantity,
  );

  return (
    <>
      <div className="options">
        <select
          id="quantity-select"
          className="quantity-select"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        >
          {product.quantityOptions.map((opt) => (
            <option key={opt.value} className="quantity-select-option" value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="payment-info">
        <div className="payment-option">
          <span className="payment-title">Оплата при получении</span>
          <span className="payment-details">Наличие {product.quantity} шт.</span>
          <span className="payment-details">
            Самовывоз <span className="highlight-text">{product.pickupDate}</span>
          </span>
          <span className="payment-details">
            Доставка до ПВЗ <span className="highlight-text">{product.deliveryLabel}</span>
          </span>
        </div>
        <div className="payment-option">
          <div><strong>Самовывоз из ПВЗ по адресу:</strong></div>
          <div><strong>Адрес:</strong> {product.storeAddress}</div>
          <div>
            <strong>Время работы:</strong>{" "}
            <div>{product.storeHours}</div>
          </div>
        </div>
      </div>

      <button
        className={`add-to-cart-button primary-button${!ready ? " add-to-cart-button--skeleton" : isInCart ? " add-to-cart-button--remove" : ""}`}
        onClick={!ready ? undefined : isInCart ? () => setConfirmOpen(true) : handleAdd}
      >
        {!ready ? "" : isInCart ? "Убрать из корзины" : isPending ? "Добавление..." : "Добавить в корзину"}
      </button>

      {popupOpen && cartItem && (
        <CartPopup
          item={cartItem}
          addedQuantity={quantity}
          onClose={() => setPopupOpen(false)}
        />
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
