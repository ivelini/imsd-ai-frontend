// Экран успеха: живёт снимком созданной записи из sessionStorage.
// Снимка нет (заход по адресу) — возврат на шаг 1
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useBookingCatalog } from "@/features/booking/api/useBookingCatalog";
import { useBookingReference } from "@/features/booking/api/useBookingReference";
import { formatDayFull } from "@/features/booking/lib/dates";
import { snapshotStore } from "@/features/booking/lib/draftStore";
import { formatMoney } from "@/shared/lib/money";

export function BookingSuccess() {
  const router = useRouter();
  const booking = useSyncExternalStore(
    snapshotStore.subscribe,
    snapshotStore.getSnapshot,
    snapshotStore.getServerSnapshot,
  );
  const { data: catalog } = useBookingCatalog(booking?.radius ?? null, booking?.car_type ?? null);
  const { data: reference } = useBookingReference();

  useEffect(() => {
    if (booking === null) {
      router.replace("/booking");
    }
  }, [booking, router]);

  if (booking === null) return null;

  const carTypeLabel = catalog?.rules.car_type.find(
    (option) => String(option.value) === booking.car_type,
  )?.label;

  return (
    <section className="booking-section container">
      <div className="booking-success">
        <img className="booking-success-icon" src="/assets/img/order_check_a.svg" alt="" />
        <p className="booking-success-title">Запись подтверждена</p>
        <p className="booking-success-id">Запись № {booking.number}</p>

        <div className="booking-details">
          <Row label="Дата" value={formatDayFull(booking.date)} />
          <Row
            label="Время начала"
            value={`${booking.start_time.slice(0, 5)} — приехать к началу`}
          />
          {reference && <Row label="Адрес" value={reference.shop_address} />}
          <Row
            label="Услуги"
            value={(booking.items ?? [])
              .map((item) => item.service?.name)
              .filter(Boolean)
              .join(" · ")}
          />
          <Row
            label="Параметры авто"
            value={[`R${booking.radius}`, carTypeLabel].filter(Boolean).join(", ")}
          />
          <Row label="Итого к оплате" value={formatMoney(booking.total_price)} total />
          {reference && <Row label="Телефон мастерской" value={reference.shop_phone} />}
        </div>

        <div className="booking-success-actions">
          <button
            className="booking-btn-primary booking-btn-primary--auto"
            type="button"
            onClick={() => router.push("/")}
          >
            На главную
          </button>
        </div>
      </div>
    </section>
  );
}

interface RowProps {
  label: string;
  value: string;
  total?: boolean;
}

function Row({ label, value, total }: RowProps) {
  return (
    <div className={total ? "booking-details-row booking-details-row--total" : "booking-details-row"}>
      <span className="booking-details-label">{label}</span>
      <span className="booking-details-value">{value}</span>
    </div>
  );
}
