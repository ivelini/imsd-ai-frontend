"use client";
// Количество + кнопка «Добавить в корзину»/«Убрать» + попапы (фаза 3, 04.08.2026)
import { useState } from "react";
import { useCartItemActions } from "@/features/cart/api/useCartItemActions";
import { toItemableType } from "@/features/cart/lib/itemable";
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
    { itemableType: toItemableType(product.category), itemableId: product.id },
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
          {product.quantity !== null && (
            <span className="payment-details">Наличие {product.quantity} шт.</span>
          )}
          {product.pickupDate && (
            <span className="payment-details">
              Самовывоз <span className="highlight-text">{product.pickupDate}</span>
            </span>
          )}
          {product.deliveryLabel && (
            <span className="payment-details">
              Доставка до ПВЗ <span className="highlight-text">{product.deliveryLabel}</span>
            </span>
          )}
        </div>
        {/* Самовывоз: городозависимый текст бэка — первая строка заголовок, дальше строки
            (адрес и часы). Заголовок приходит от бэка: фронт не подменяет его своим. */}
        {product.pickupPointText && (
          <div className="payment-option">
            {product.pickupPointText
              .split("\n")
              .filter(Boolean)
              .map((line, i) => (
                <div key={i}>{i === 0 ? <strong>{line}</strong> : line}</div>
              ))}
          </div>
        )}
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
