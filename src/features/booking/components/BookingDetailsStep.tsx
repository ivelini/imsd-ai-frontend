// Шаг 3: контактные данные. Код выдаётся здесь — на шаге 4 остаётся его ввод
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingAlert } from "./BookingAlert";
import { BookingSteps } from "./BookingSteps";
import { BookingSummary } from "./BookingSummary";
import { useBookingCatalog } from "@/features/booking/api/useBookingCatalog";
import { useBookingDraft } from "@/features/booking/api/useBookingDraft";
import { useIssueBookingCode } from "@/features/booking/api/useIssueBookingCode";
import { formatDayShort } from "@/features/booking/lib/dates";
import { mapBookingError, toErrorResponse, type BookingErrorResult } from "@/features/booking/lib/errors";
import { buildQuote, toQuoteItems } from "@/features/booking/lib/quote";
import { formatMoney } from "@/shared/lib/money";

export function BookingDetailsStep() {
  const router = useRouter();
  const { draft, save } = useBookingDraft(true);
  const { data: catalog } = useBookingCatalog(draft?.radius ?? null, draft?.carType ?? null);
  const issueCode = useIssueBookingCode();
  const [error, setError] = useState<BookingErrorResult | null>(null);

  if (draft === null) return null;

  const services = catalog?.services ?? [];
  const quote = buildQuote(
    toQuoteItems(services, Object.fromEntries(draft.services.map((s) => [s.id, s.quantity]))),
  );

  const filled = draft.name.trim() !== "" && draft.phone.trim() !== "";

  const submit = () => {
    setError(null);
    issueCode.mutate(draft.phone, {
      onSuccess: ({ retry_after }) => {
        save({ ...draft, codeIssuedAt: Date.now(), codeRetryAfter: retry_after });
        router.push("/booking/code");
      },
      onError: (cause) => setError(mapBookingError(toErrorResponse(cause))),
    });
  };

  return (
    <section className="booking-section container">
      <h2>Данные для записи</h2>
      <p className="booking-subtitle">На указанный телефон придёт SMS с кодом подтверждения</p>

      <BookingSteps active={3} />

      <div className="booking-row">
        <div className="booking-form">
          <div className="booking-datetime">
            <img src="/assets/img/clock.svg" alt="" />
            <span>
              <span className="booking-datetime-value">
                {draft.date && formatDayShort(draft.date)}, {draft.hour}:00
              </span>
              — прибыть к этому времени
            </span>
            <button
              className="booking-datetime-change"
              type="button"
              onClick={() => router.push("/booking")}
            >
              Изменить время
            </button>
          </div>

          {error && (
            <div className="booking-blk">
              <BookingAlert title={errorTitle(error)} text={error.message} />
            </div>
          )}

          <div className="booking-blk">
            <h3 className="booking-blk-title">Контактные данные</h3>
            <div className="booking-fields-row">
              <div className="auth_field">
                <label htmlFor="booking-name">Имя</label>
                <input
                  type="text"
                  id="booking-name"
                  placeholder="Как к вам обращаться"
                  value={draft.name}
                  onChange={(event) => save({ ...draft, name: event.target.value })}
                />
              </div>
              <div className="auth_field">
                <label htmlFor="booking-phone">Телефон</label>
                <input
                  type="tel"
                  id="booking-phone"
                  placeholder="+7 (900) 000-00-00"
                  value={draft.phone}
                  onChange={(event) => save({ ...draft, phone: event.target.value })}
                />
                <p className="auth_field_prompt">Код из SMS придёт на этот номер</p>
              </div>
            </div>
            <div className="auth_field">
              <label htmlFor="booking-plate">Госномер автомобиля</label>
              <input
                type="text"
                id="booking-plate"
                placeholder="А 000 АА 174"
                value={draft.plate ?? ""}
                onChange={(event) => save({ ...draft, plate: event.target.value || null })}
              />
              <p className="auth_field_prompt">
                Необязательно — пригодится при повторной записи
              </p>
            </div>
            <div className="booking-consent">
              <img src="/assets/img/order_check.svg" alt="" />
              <span>
                Отправляя форму, я соглашаюсь с{" "}
                <a href="#">политикой обработки персональных данных</a>
              </span>
            </div>
          </div>
        </div>

        <BookingSummary
          date={draft.date}
          hour={draft.hour}
          total={quote.total}
          footer={
            <>
              <button
                className="booking-btn-primary"
                type="button"
                disabled={!filled || issueCode.isPending}
                onClick={submit}
              >
                Получить код
              </button>
              <button
                className="booking-summary-link"
                type="button"
                onClick={() => router.push("/booking/services")}
              >
                Изменить услуги
              </button>
            </>
          }
        >
          <div className="booking-summary-group">
            {quote.rows.map((row) => (
              <div key={row.id} className="booking-summary-row">
                <span className="booking-summary-label">
                  {services.find((service) => service.id === row.id)?.name} × {row.quantity}
                </span>
                <span className="booking-summary-value booking-summary-value--price">
                  {formatMoney(row.amount)}
                </span>
              </div>
            ))}
          </div>
        </BookingSummary>
      </div>
    </section>
  );
}

/** Заголовок алерта по состоянию отказа: тексты бэка — для человека, заголовок — от экрана. */
function errorTitle(error: BookingErrorResult): string {
  switch (error.state) {
    case "cooldown":
      return "Код уже отправлен";
    case "phone_invalid":
      return "Проверьте номер телефона";
    default:
      return "Не удалось получить код";
  }
}
