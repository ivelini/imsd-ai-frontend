// Статус заказа (24.11.2026): публичного поиска по номеру у бэка нет —
// страница объясняет, где искать статус, и не показывает мок-данные.
import Link from "next/link";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ label: "Главная", href: "/" }, { label: "Статус заказа" }]}
      />
      <section className="order-section container">
        <h2>Статус заказа</h2>
        <p className="order-status-hint">
          Статус заказа отображается на странице заказа сразу после оформления.
        </p>
        <p className="order-status-hint">
          Поиск заказа по номеру появится вместе с личным кабинетом.
        </p>
        <Link href="/cart" className="primary-button">
          Перейти в корзину
        </Link>
      </section>
    </>
  );
}
