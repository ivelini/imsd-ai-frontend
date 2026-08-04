"use client";
// Количество + кнопка «Добавить в корзину» (фаза 3, 04.08.2026)
import { useState } from "react";
import { useAddToCart } from "@/features/cart/api/useAddToCart";
import { useUIStore } from "@/stores/useUIStore";
import type { ProductDetailData } from "../types";

export function AddToCartBlock({ product }: { product: ProductDetailData }) {
  const [quantity, setQuantity] = useState(1);
  const { mutate, isPending } = useAddToCart();

  const handleAdd = () => {
    mutate(
      {
        item: {
          id: product.id,
          name: product.title,
          price: product.price,
          image: product.image,
        },
        quantity,
      },
      {
        onSuccess: () => useUIStore.getState().setCartPopupOpen(true),
      },
    );
  };

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
        className="add-to-cart-button primary-button"
        onClick={handleAdd}
        disabled={isPending}
      >
        Добавить в корзину
      </button>
    </>
  );
}
