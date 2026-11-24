"use client";
// Страница заказа /order/[id] из снимка ответа (sessionStorage): публичного чтения
// заказа гостя нет. Другой id или чужой браузер — «заказ не найден».
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { snapshotStore } from "@/features/checkout/lib/draftStore";
import { formatPrice } from "@/shared/lib/money";


export function OrderPage({ id }: { id: string }) {
  const snapshot = useSyncExternalStore(
    snapshotStore.subscribe,
    snapshotStore.getSnapshot,
    snapshotStore.getServerSnapshot,
  );

  if (snapshot === null || snapshot.id !== id) {
    return (
      <section className="order-section container">
        <h2>Заказ не найден</h2>
        <div className="cart-empty">
          <p className="cart-empty-text">
            Заказ открывается по ссылке сразу после оформления — в этой вкладке или в этом
            браузере. Поиск по номеру появится вместе с личным кабинетом.
          </p>
          <Link className="primary-button cart-empty-button" href="/catalog/tires">
            Перейти в каталог
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="order-section container">
      <h2>Заказ №{snapshot.id}</h2>
      <div className="order-status">
        Статус: <b>Заказ оформлен</b>
      </div>
      <div className="order_row">
        <div className="order-info">
          <h3>Состав заказа</h3>
          <dl>
            {snapshot.items.map((item, index) => (
              <div key={index}>
                <dt>{item.name}</dt>
                <dd>
                  {item.quantity} шт. × {formatPrice(item.unitPrice)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="order_total">
          <div className="order_total_top">
            <div className="order_total_top_title">К оплате</div>
            <div className="order_total_top_price">{formatPrice(snapshot.total)}</div>
          </div>
          <div className="order_total_list">
            <div>
              <span>Товары</span>
              <span>{formatPrice(snapshot.subtotal)}</span>
            </div>
            <div>
              <span>Доставка</span>
              <span>{formatPrice(snapshot.deliveryCost)}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="order-info">
        <h3>Данные получателя</h3>
        <dl>
          <div>
            <dt>ФИО</dt>
            <dd>{snapshot.customer.name || "—"}</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>{snapshot.customer.phone}</dd>
          </div>
          <div>
            <dt>E-Mail</dt>
            <dd>{snapshot.customer.email || "—"}</dd>
          </div>
          <div>
            <dt>Способ получения</dt>
            <dd>{snapshot.deliveryLabel}</dd>
          </div>
          {snapshot.pickupAddress !== null && (
            <div>
              <dt>Адрес точки</dt>
              <dd>{snapshot.pickupAddress}</dd>
            </div>
          )}
          {snapshot.deliveryAddress !== null && (
            <div>
              <dt>Адрес</dt>
              <dd>{snapshot.deliveryAddress}</dd>
            </div>
          )}
          <div>
            <dt>Оплата</dt>
            <dd>{snapshot.paymentLabel}</dd>
          </div>
        </dl>
      </div>
      <Link href="/catalog/tires" className="primary-button">
        Продолжить покупки
      </Link>
    </section>
  );
}
