"use client";
// Попап «Товар добавлен в корзину» (фаза 3, 04.08.2026)
// Переиспользуемый — страница товара, каталог
import { useUpdateCartItem } from "@/features/cart/api/useUpdateCartItem";
import { useEsc } from "@/shared/lib/useEsc";
import type { CartItem } from "@/features/cart/types";
import { formatPrice } from "@/shared/lib/money";


interface CartPopupProps {
  item: CartItem;
  /** Сколько штук добавлено (строка «X шт. — цена») */
  addedQuantity?: number;
  onClose: () => void;
}

export function CartPopup({ item, addedQuantity = 1, onClose }: CartPopupProps) {
  const { mutate: changeQuantity } = useUpdateCartItem();
  useEsc(onClose);

  return (
    <div className="cart_popup_overlay" onClick={onClose}>
      <div
        className="cart_popup"
        id="cart_popup"
        style={{ display: "block" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="cart_popup_close" onClick={onClose} aria-label="Закрыть">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M1 1L17 17M17 1L1 17" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <div className="cart_popup_title">Товар успешно добавлен в корзину</div>
        <div className="cart_popup_item">
          <div className="cart_popup_item_img">
            <img src={item.image} alt="" />
          </div>
          <div className="cart_popup_item_info">
            <div className="cart_popup_item_info_title">{item.name}</div>
            <div className="cart_popup_item_info_single">
              {addedQuantity} шт. - <span>{formatPrice(item.price)}</span>
            </div>
          </div>
          <div className="cart_popup_item_quantity">
            <div className="cart_popup_item_quantity_in">
              <div className="cart_popup_item_quantity_btn" onClick={() => changeQuantity({ id: item.id, delta: -1 })}>
                <img src="/assets/img/popup_minus.svg" alt="" />
              </div>
              <div className="cart_popup_item_quantity_number">
                <span>{item.quantity}</span>
              </div>
              <div className="cart_popup_item_quantity_btn" onClick={() => changeQuantity({ id: item.id, delta: 1 })}>
                <img src="/assets/img/popup_plus.svg" alt="" />
              </div>
            </div>
            <div className="cart_popup_item_info_av">
              Наличие <span>{">"}12 шт.</span>
            </div>
          </div>
          <div className="cart_popup_item_total">{formatPrice(item.price * item.quantity)}</div>
        </div>
        <div className="cart_popup_btns">
          <a href="#" className="cart_popup_btn cart_popup_btn_close" onClick={(e) => { e.preventDefault(); onClose(); }}>
            Продолжить покупки
          </a>
          <a href="/cart" className="cart_popup_btn cart_popup_btn_cart">
            Перейти в корзину
          </a>
        </div>
      </div>
    </div>
  );
}
