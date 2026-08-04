"use client";
// Количество + кнопка «Добавить в корзину» + попап (фаза 3, 04.08.2026)
import { useState, useEffect, useCallback } from "react";
import { useAddToCart } from "@/features/cart/api/useAddToCart";
import { useCart } from "@/features/cart/api/useCart";
import { useUpdateCartItem } from "@/features/cart/api/useUpdateCartItem";
import type { ProductDetailData } from "../types";

const formatPrice = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export function AddToCartBlock({ product }: { product: ProductDetailData }) {
  const [quantity, setQuantity] = useState(1);
  const [popupOpen, setPopupOpen] = useState(false);
  const { mutate, isPending } = useAddToCart();
  const { data: items } = useCart();
  const { mutate: changeQuantity } = useUpdateCartItem();

  // Найти добавленный товар в корзине (по id продукта)
  const cartItem = items?.find((i) => i.id === product.id);

  // ESC → закрыть попап
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopupOpen(false);
    },
    [],
  );

  useEffect(() => {
    if (popupOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [popupOpen, handleKeyDown]);

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
        onSuccess: () => setPopupOpen(true),
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
        {isPending ? "Добавление..." : "Добавить в корзину"}
      </button>

      {/* Попап «Товар добавлен в корзину» */}
      {popupOpen && (
        <div
          className="cart_popup_overlay"
          onClick={() => setPopupOpen(false)}
        >
          <div
            className="cart_popup"
            id="cart_popup"
            style={{ display: "block" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="cart_popup_close"
              onClick={() => setPopupOpen(false)}
              aria-label="Закрыть"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M1 1L17 17M17 1L1 17" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="cart_popup_title">Товар успешно добавлен в корзину</div>
            {cartItem && (
              <div className="cart_popup_item">
                <div className="cart_popup_item_img">
                  <img src={cartItem.image} alt="" />
                </div>
                <div className="cart_popup_item_info">
                  <div className="cart_popup_item_info_title">{cartItem.name}</div>
                  <div className="cart_popup_item_info_single">
                    {quantity} шт. - <span>{formatPrice(cartItem.price)}</span>
                  </div>
                </div>
                <div className="cart_popup_item_quantity">
                  <div className="cart_popup_item_quantity_in">
                    <div className="cart_popup_item_quantity_btn" onClick={() => changeQuantity({ id: cartItem.id, delta: -1 })}>
                      <img src="/assets/img/popup_minus.svg" alt="" />
                    </div>
                    <div className="cart_popup_item_quantity_number">
                      <span>{cartItem.quantity}</span>
                    </div>
                    <div className="cart_popup_item_quantity_btn" onClick={() => changeQuantity({ id: cartItem.id, delta: 1 })}>
                      <img src="/assets/img/popup_plus.svg" alt="" />
                    </div>
                  </div>
                  <div className="cart_popup_item_info_av">
                    Наличие <span>{">"}12 шт.</span>
                  </div>
                </div>
                <div className="cart_popup_item_total">{formatPrice(cartItem.price * cartItem.quantity)}</div>
              </div>
            )}
            <div className="cart_popup_btns">
              <a href="#" className="cart_popup_btn cart_popup_btn_close" onClick={(e) => { e.preventDefault(); setPopupOpen(false); }}>
                Продолжить покупки
              </a>
              <a href="/cart" className="cart_popup_btn cart_popup_btn_cart">
                Перейти в корзину
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
