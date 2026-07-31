"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/useCartStore";
import { useUIStore } from "@/stores/useUIStore";

export function AddToCartPopup() {
  const { cartPopupOpen, setCartPopupOpen } = useUIStore();
  const { items, changeQuantity } = useCartStore();

  if (!cartPopupOpen) return null;
  const last = items[items.length - 1];
  if (!last) return null;

  return (
    <div className="cart_popup">
      <div className="cart_popup_title">Товар успешно добавлен в корзину</div>
      <div className="cart_popup_item">
        <div className="cart_popup_item_img">
          <img src={last.image} alt="" />
        </div>
        <div className="cart_popup_item_info">
          <div className="cart_popup_item_info_title">{last.name}</div>
          <div className="cart_popup_item_info_single">
            1шт. - <span>{last.price.toLocaleString("ru-RU")} ₽</span>
          </div>
          <div className="cart_popup_item_quantity">
            <div className="cart_popup_item_quantity_in">
              <button
                type="button"
                className="cart_popup_item_quantity_btn"
                onClick={() => changeQuantity(last.id, -1)}
                aria-label="Уменьшить количество"
              >
                <img src="/assets/img/popup_minus.svg" alt="-" />
              </button>
              <div className="cart_popup_item_quantity_number">
                <span>{last.quantity}</span>
              </div>
              <button
                type="button"
                className="cart_popup_item_quantity_btn"
                onClick={() => changeQuantity(last.id, 1)}
                aria-label="Увеличить количество"
              >
                <img src="/assets/img/popup_plus.svg" alt="+" />
              </button>
            </div>
            <div className="cart_popup_item_info_av">
              Наличие <span>&gt;12 шт.</span>
            </div>
          </div>
        </div>
        <div className="cart_popup_item_total">{(last.price * last.quantity).toLocaleString("ru-RU")} ₽</div>
      </div>
      <div className="cart_popup_btns">
        <button type="button" className="cart_popup_btn cart_popup_btn_close" onClick={() => setCartPopupOpen(false)}>
          Продолжить покупки
        </button>
        <Link className="cart_popup_btn cart_popup_btn_cart" href="/cart" onClick={() => setCartPopupOpen(false)}>
          Перейти в корзину
        </Link>
      </div>
    </div>
  );
}
