"use client";
// Статус заказа /order-status (фаза 4). Макета нет — по образцу стиля.
// Ввод номера → useOrderByNumber → статус заказа или «не найден».
import { useState } from "react";
import Link from "next/link";
import { useOrderByNumber } from "@/features/checkout/api/useOrderByNumber";
import { formatPrice } from "@/shared/lib/money";


export function OrderStatusPage() {
  const [number, setNumber] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data: order, isFetching, isSuccess } = useOrderByNumber(
    submitted,
    submitted !== "",
  );

  const handleSubmit = () => {
    setSubmitted(number);
  };

  return (
    <section className="order-section container">
      <h2>Статус заказа</h2>
      <p className="order-status-hint">
        Введите номер заказа (например, А-00001) — он указан в письме после
        оформления.
      </p>
      <div className="order-status-search">
        <input
          type="text"
          placeholder="Номер заказа"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
        />
        <button className="primary-button" onClick={handleSubmit}>
          Найти
        </button>
      </div>

      {isFetching && <p className="order-status-hint">Поиск…</p>}

      {isSuccess && !isFetching && (
        <div className="order-status-result">
          {order ? (
            <>
              <p>
                Заказ <b>{order.number}</b> — статус:{" "}
                <b className="order-status-ok">{order.status}</b>
              </p>
              <p>К оплате: {formatPrice(order.total)}</p>
              <Link href={`/order/${order.id}`} className="primary-button">
                Подробнее о заказе
              </Link>
            </>
          ) : (
            <p>
              Заказ с номером <b>{submitted}</b> не найден. Проверьте номер
              или обратитесь по телефону.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
