// Шаг 1: дата и время записи — календарь месяца и часы выбранного дня
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingCalendar } from "./BookingCalendar";
import { BookingSteps } from "./BookingSteps";
import { BookingSummary } from "./BookingSummary";
import { useBookingDaySlots } from "@/features/booking/api/useBookingDaySlots";
import { useBookingDays } from "@/features/booking/api/useBookingDays";
import { useBookingDraft } from "@/features/booking/api/useBookingDraft";
import { useBookingReference } from "@/features/booking/api/useBookingReference";
import { today, monthRange, formatDayLong } from "@/features/booking/lib/dates";
import { isComplete, setTime } from "@/features/booking/lib/draft";
import { plural } from "@/features/booking/lib/plural";

export function BookingTimeStep() {
  const router = useRouter();
  const { draft, save } = useBookingDraft();
  const [month, setMonth] = useState(() => today().slice(0, 7));

  const range = monthRange(month);
  const { data: days = {} } = useBookingDays(range.from, range.to);
  const { data: slots = [] } = useBookingDaySlots(draft?.date ?? null);
  const { data: reference } = useBookingReference();

  if (draft === null) return null;

  const openSlots = slots.filter((slot) => !slot.is_closed);
  const busySlots = slots.filter((slot) => slot.is_closed);

  return (
    <section className="booking-section container">
      <h2>Выберите дату и время</h2>
      <p className="booking-subtitle">Приезжать нужно к выбранному времени начала записи</p>

      <BookingSteps active={1} />

      <div className="booking-row">
        <div className="booking-form">
          <div className="booking-blk">
            <h3 className="booking-blk-title">Дата</h3>
            <BookingCalendar
              month={month}
              days={days}
              selected={draft.date}
              onSelect={(date) => save(setTime(draft, date, null))}
              onMonthChange={setMonth}
              canGoBack={month > today().slice(0, 7)}
            />
          </div>

          <div className="booking-blk">
            <h3 className="booking-blk-title">Время</h3>
            {draft.date === null ? (
              <p className="booking-blk-hint">Выберите дату в календаре</p>
            ) : (
              <>
                <p className="booking-blk-hint">
                  {formatDayLong(draft.date)}
                  {openSlots.length > 0 &&
                    ` — часы работы мастерской ${openSlots[0].hour}:00–${
                      openSlots[openSlots.length - 1].hour + 1
                    }:00`}
                </p>
                <div className="time-grid">
                  {slots.map((slot) =>
                    slot.is_closed ? (
                      <span key={slot.hour} className="time-chip time-chip--busy">
                        {slot.hour}:00
                      </span>
                    ) : (
                      <button
                        key={slot.hour}
                        className={
                          slot.hour === draft.hour
                            ? "time-chip time-chip--selected"
                            : "time-chip"
                        }
                        type="button"
                        onClick={() => save(setTime(draft, draft.date!, slot.hour))}
                      >
                        {slot.hour}:00
                      </button>
                    ),
                  )}
                </div>
                {draft.hour !== null && reference && (
                  <p className="time-note">
                    Запись на {draft.hour}:00 означает, что приехать нужно к {draft.hour}:00.
                    {busySlots.length > 0 &&
                      ` Слоты ${busySlots.map((s) => `${s.hour}:00`).join(", ")} недоступны (перерыв и закрытый слот).`}{" "}
                    Записаться можно не позднее чем за {reference.min_lead_time_h}{" "}
                    {plural(reference.min_lead_time_h, ["час", "часа", "часов"])} до начала и в
                    пределах {reference.horizon_days}{" "}
                    {plural(reference.horizon_days, ["дня", "дней", "дней"])}.
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <BookingSummary
          date={draft.date}
          hour={draft.hour}
          footer={
            <>
              <button
                className="booking-btn-primary"
                type="button"
                disabled={!isComplete(draft)}
                onClick={() => router.push("/booking/services")}
              >
                К выбору услуг
              </button>
              <p className="booking-summary-note">
                Цена появится после выбора услуг на следующем шаге. Оплата в мастерской, после
                выполнения работ
              </p>
            </>
          }
        />
      </div>
    </section>
  );
}
