"use client";
// Страница корзины: .cart_row → .cart_in + .cart_total (фаза 4; живой API 24.11.2026)
// Данные — React Query (useCart), мутации +/− и удаление — в CartItemRow.
// Пустое состояние — нет в мокапе, сделано по образцу (см. style.css .cart-empty).
import Link from "next/link";
import { useCart } from "@/features/cart/api/useCart";
import { formatPrice } from "@/shared/lib/money";
import { CartItemRow } from "./CartItemRow";


interface CartPageProps {
  /** Пункты .cart_total_list — готовые строки от «бэка» (getCartTotalInfo) */
  benefits: string[];
}

export function CartPage({ benefits }: CartPageProps) {
  const { data: cart, isLoading } = useCart();
  const items = cart?.items ?? [];

  if (isLoading) return null;

  if (items.length === 0) {
    return (
      <section className="cart-section container">
        <h2>Корзина</h2>
        <div className="cart-empty">
          <p className="cart-empty-text">В корзине пока пусто</p>
          <Link className="primary-button cart-empty-button" href="/catalog/tires">
            Перейти в каталог
          </Link>
        </div>
      </section>
    );
  }

  const hasUnavailable = items.some((item) => !item.available);

  return (
    <section className="cart-section container">
      <h2>Корзина</h2>
      <div className="cart_row">
        <div className="cart_in">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>
        <div className="cart_total">
          <div className="cart_total_top">
            <div className="cart_total_top_title">Итого</div>
            <div className="cart_total_top_price">{formatPrice(cart?.subtotal ?? 0)}</div>
          </div>
          <div className="cart_total_list">
            {benefits.map((b) => (
              <div key={b}>
                <img src="/assets/img/cart_total_list.svg" alt="" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          {hasUnavailable && (
            <p className="cart-total-warning">
              Некоторые товары недоступны в выбранном городе — уберите их, чтобы оформить заказ.
            </p>
          )}
          <Link href="/checkout" className="cart_total_next">
            Оформить заказ
          </Link>
        </div>
      </div>
    </section>
  );
}
