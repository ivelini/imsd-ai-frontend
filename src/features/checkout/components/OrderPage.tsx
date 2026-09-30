"use client";
// Страница заказа /order/[id] (фаза 4). Макета в шаблоне нет — по образцу
// корзины (.cart_item без кнопок) + блок данных получателя (.order-info).
// Данные — useOrder (React Query, localStorage-мок).
import Link from "next/link";
import { useOrder } from "@/features/checkout/api/useOrder";
import type { Order } from "@/features/checkout/types";
import { formatPrice } from "@/shared/lib/money";


function OrderItems({ order }: { order: Order }) {
  return (
    <div className="cart_in">
      {order.items.map((item) => (
        <div className="cart_item" key={item.id}>
          <div className="cart_item_img">
            <img src={item.image} alt="" />
          </div>
          <div className="cart_item_info">
            <div className="cart_item_info_title">{item.name}</div>
            {item.code && (
              <div className="cart_item_info_code">
                Код товара: <span>{item.code}</span>
              </div>
            )}
            <div className="cart_item_info_price">
              <span>{item.price.toLocaleString("ru-RU")}</span> ₽ / шт.
            </div>
          </div>
          <div className="cart_item_quantity">
            <div className="cart_item_quantity_number">
              <span>{item.quantity} шт.</span>
            </div>
          </div>
          <div className="cart_item_total">
            <div className="cart_item_total_price">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderPage({ id }: { id: string }) {
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) return null;

  if (!order) {
    return (
      <section className="order-section container">
        <h2>Заказ не найден</h2>
        <div className="cart-empty">
          <p className="cart-empty-text">
            Заказ не найден. Проверьте номер или{" "}
            <Link href="/order-status">воспользуйтесь поиском по номеру</Link>.
          </p>
          <Link className="primary-button cart-empty-button" href="/catalog/tires">
            Перейти в каталог
          </Link>
        </div>
      </section>
    );
  }

  const { recipient: r } = order;

  return (
    <section className="order-section container">
      <h2>Заказ {order.number}</h2>
      <div className="order-status">
        Статус: <b>{order.status}</b>
      </div>
      <div className="order_row">
        <OrderItems order={order} />
        <div className="order_total">
          <div className="order_total_top">
            <div className="order_total_top_title">К оплате</div>
            <div className="order_total_top_price">{formatPrice(order.total)}</div>
          </div>
          <div className="order_total_list">
            {order.items.map((item) => (
              <div key={item.id}>
                <span>{item.name}</span>
                <span>
                  {item.quantity}шт. х {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="order-info">
        <h3>Данные получателя</h3>
        <dl>
          <div>
            <dt>ФИО</dt>
            <dd>
              {[r.lastName, r.firstName, r.middleName].filter(Boolean).join(" ") || "—"}
            </dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>{r.phone}</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd>{r.email || "—"}</dd>
          </div>
          <div>
            <dt>Способ получения</dt>
            <dd>{order.deliveryLabel}</dd>
          </div>
          {order.deliveryAddress && (
            <div>
              <dt>Адрес</dt>
              <dd>{order.deliveryAddress}</dd>
            </div>
          )}
          <div>
            <dt>Оплата</dt>
            <dd>{order.paymentLabel}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
