"use client";
// Строка товара в корзине: .cart_item (фаза 4; живой API 24.11.2026)
// В мокапе +/- и «Удалить» — div'ы, здесь кнопки (семантизация без смены классов)
import { useUpdateCartItem } from "@/features/cart/api/useUpdateCartItem";
import { useRemoveFromCart } from "@/features/cart/api/useRemoveFromCart";
import type { CartItem } from "@/features/cart/types";
import { formatPrice } from "@/shared/lib/money";


export function CartItemRow({ item }: { item: CartItem }) {
  const { mutate: changeQuantity, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: remove, isPending: isRemoving } = useRemoveFromCart();
  const busy = isUpdating || isRemoving;

  return (
    <div className="cart_item">
      <div className="cart_item_img">
        <img src={item.image} alt="" />
      </div>
      <div className="cart_item_info">
        <div className="cart_item_info_title">{item.name}</div>
        {item.countInStock !== null || !item.available ? (
          <div className="cart_item_info_more">
            <div className="cart_item_info_av">
              {item.available ? (
                <>
                  Наличие <span>{item.countInStock} шт.</span>
                </>
              ) : (
                "Нет в наличии в выбранном городе"
              )}
            </div>
          </div>
        ) : null}
        <div className="cart_item_info_price">
          {item.price !== null ? (
            <>
              <span>{item.price.toLocaleString("ru-RU")}</span> ₽
            </>
          ) : (
            "Цена недоступна в этом городе"
          )}
        </div>
      </div>

      <div className="cart_item_quantity">
        <div className="cart_item_quantity_in">
          <button
            className="cart_item_quantity_btn"
            onClick={() => changeQuantity({ lineId: item.id, quantity: item.quantity - 1 })}
            disabled={busy || item.quantity <= 1}
            aria-label="Уменьшить количество"
          >
            <img src="/assets/img/cart_minus.svg" alt="" />
          </button>
          <div className="cart_item_quantity_number">
            <span>{item.quantity}</span>
          </div>
          <button
            className="cart_item_quantity_btn"
            onClick={() => changeQuantity({ lineId: item.id, quantity: item.quantity + 1 })}
            disabled={busy}
            aria-label="Увеличить количество"
          >
            <img src="/assets/img/cart_plus.svg" alt="" />
          </button>
        </div>
      </div>
      <div className="cart_item_total">
        <div className="cart_item_total_price">
          {item.total !== null ? formatPrice(item.total) : "—"}
        </div>
        <button
          className="cart_item_total_delete"
          onClick={() => remove(item.id)}
          disabled={busy}
        >
          Удалить <img src="/assets/img/cart_delete.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
