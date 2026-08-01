// Попап «Товар добавлен в корзину»: .cart_popup (фаза 1).
// Мокап показывает через body-класс .popup-cart — в React условный рендер по state
"use client";

import { useUIStore } from "@/stores/useUIStore";
import { useCartStore } from "@/stores/useCartStore";

const formatPrice = (n: number) => n.toLocaleString("ru-RU").replace(/ /g, " ") + " ₽";

export function AddToCartPopup() {
  const open = useUIStore((s) => s.cartPopupOpen);
  const setOpen = useUIStore((s) => s.setCartPopupOpen);
  const items = useCartStore((s) => s.items);

  if (!open) return null;

  const item = items[0];

  return (
    <div className="cart_popup" id="cart_popup" style={{ display: "block" }}>
      <div className="cart_popup_title">Товар успешно добавлен в корзину</div>
      {item && (
        <div className="cart_popup_item">
          <div className="cart_popup_item_img">
            <img src={item.image} alt="" />
          </div>
          <div className="cart_popup_item_info">
            <div className="cart_popup_item_info_title">{item.name}</div>
            <div className="cart_popup_item_info_single">
              1шт. - <span>{formatPrice(item.price)}</span>
            </div>
          </div>
          <div className="cart_popup_item_quantity">
            <div className="cart_popup_item_quantity_in">
              <div className="cart_popup_item_quantity_btn" onClick={() => useCartStore.getState().changeQuantity(item.id, -1)}>
                <img src="/assets/img/popup_minus.svg" alt="" />
              </div>
              <div className="cart_popup_item_quantity_number">
                <span>{item.quantity}</span>
              </div>
              <div className="cart_popup_item_quantity_btn" onClick={() => useCartStore.getState().changeQuantity(item.id, 1)}>
                <img src="/assets/img/popup_plus.svg" alt="" />
              </div>
            </div>
            <div className="cart_popup_item_info_av">
              Наличие <span>&gt;12 шт.</span>
            </div>
          </div>
          <div className="cart_popup_item_total">{formatPrice(item.price * item.quantity)}</div>
        </div>
      )}
      <div className="cart_popup_btns">
        <a href="#" className="cart_popup_btn cart_popup_btn_close" onClick={(e) => { e.preventDefault(); setOpen(false); }}>
          Продолжить покупки
        </a>
        <a href="/cart" className="cart_popup_btn cart_popup_btn_cart">
          Перейти в корзину
        </a>
      </div>
    </div>
  );
}
