"use client";
// Строка товара в корзине: .cart_item (фаза 4)
// В мокапе +/- и «Удалить» — div'ы, здесь кнопки (семантизация без смены классов)
import { useUpdateCartItem } from "@/features/cart/api/useUpdateCartItem";
import { useRemoveFromCart } from "@/features/cart/api/useRemoveFromCart";
import type { CartItem } from "@/features/cart/types";

const formatPrice = (n: number) => n.toLocaleString("ru-RU") + " ₽";

export function CartItemRow({ item }: { item: CartItem }) {
  const { mutate: changeQuantity } = useUpdateCartItem();
  const { mutate: remove } = useRemoveFromCart();

  return (
    <div className="cart_item">
      <div className="cart_item_img">
        <img src={item.image} alt="" />
      </div>
      <div className="cart_item_info">
        <div className="cart_item_info_title">{item.name}</div>
        {item.code || item.availability ? (
          <div className="cart_item_info_more">
            {item.code && (
              <div className="cart_item_info_code">
                Код товара: <span>{item.code}</span>
              </div>
            )}
            {item.availability && (
              <div className="cart_item_info_av">
                Наличие <span>{item.availability}</span>
              </div>
            )}
          </div>
        ) : null}
        <div className="cart_item_info_price">
          <span>{item.price.toLocaleString("ru-RU")}</span> ₽
        </div>
      </div>

      <div className="cart_item_quantity">
        <div className="cart_item_quantity_in">
          <button
            className="cart_item_quantity_btn"
            onClick={() => changeQuantity({ id: item.id, delta: -1 })}
            aria-label="Уменьшить количество"
          >
            <img src="/assets/img/cart_minus.svg" alt="" />
          </button>
          <div className="cart_item_quantity_number">
            <span>{item.quantity}</span>
          </div>
          <button
            className="cart_item_quantity_btn"
            onClick={() => changeQuantity({ id: item.id, delta: 1 })}
            aria-label="Увеличить количество"
          >
            <img src="/assets/img/cart_plus.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="cart_item_total">
        <div className="cart_item_total_price">
          {formatPrice(item.price * item.quantity)}
        </div>
        <button
          className="cart_item_total_delete"
          onClick={() => remove(item.id)}
        >
          Удалить <img src="/assets/img/cart_delete.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
