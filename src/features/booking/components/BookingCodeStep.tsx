// Шаг 4: код из SMS. Два состояния отказа приходят одним статусом 409 и различаются
// машинным кодом — «код устарел» и «время занято» показываются здесь, а не отдельными адресами
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookingAlert } from "./BookingAlert";
import { BookingSteps } from "./BookingSteps";
import { useBookingCatalog } from "@/features/booking/api/useBookingCatalog";
import { useBookingDraft } from "@/features/booking/api/useBookingDraft";
import { useBookingReference } from "@/features/booking/api/useBookingReference";
import { useConfirmBooking } from "@/features/booking/api/useConfirmBooking";
import { useIssueBookingCode } from "@/features/booking/api/useIssueBookingCode";
import { formatDayShort } from "@/features/booking/lib/dates";
import { resendRemaining } from "@/features/booking/lib/draft";
import {
  mapBookingError,
  toErrorResponse,
  type BookingErrorResult,
  type BookingErrorState,
} from "@/features/booking/lib/errors";
import { plural } from "@/features/booking/lib/plural";
import { buildQuote, toQuoteItems } from "@/features/booking/lib/quote";
import { formatMoney } from "@/shared/lib/money";

const CODE_LENGTH = 4;

export function BookingCodeStep() {
  const router = useRouter();
  const { draft, save } = useBookingDraft(true);
  const { data: catalog } = useBookingCatalog(draft?.radius ?? null, draft?.carType ?? null);
  const { data: reference } = useBookingReference();
  const issueCode = useIssueBookingCode();
  const confirm = useConfirmBooking();

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<BookingErrorResult | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  if (draft === null) return null;

  const services = catalog?.services ?? [];
  const quote = buildQuote(
    toQuoteItems(services, Object.fromEntries(draft.services.map((s) => [s.id, s.quantity]))),
  );

  // Остаток кулдауна: длительность из ответа бэка, отсчёт — от момента выдачи кода
  const remaining =
    draft.codeIssuedAt !== null && draft.codeRetryAfter !== null
      ? resendRemaining({ issuedAt: draft.codeIssuedAt, retryAfter: draft.codeRetryAfter, now })
      : 0;

  const submit = () => {
    setError(null);
    confirm.mutate(
      { draft, code: digits.join("") },
      {
        onSuccess: () => router.replace("/booking/success"),
        onError: (cause) => setError(mapBookingError(toErrorResponse(cause))),
      },
    );
  };

  const resend = () => {
    setError(null);
    issueCode.mutate(draft.phone, {
      onSuccess: ({ retry_after }) => {
        save({ ...draft, codeIssuedAt: Date.now(), codeRetryAfter: retry_after });
        setDigits(Array(CODE_LENGTH).fill(""));
      },
      onError: (cause) => setError(mapBookingError(toErrorResponse(cause))),
    });
  };

  const codeReady = digits.every((digit) => digit !== "");

  return (
    <section className="booking-section container">
      <h2>Подтверждение записи</h2>
      <p className="booking-subtitle">Введите код из SMS — запись будет создана</p>

      <BookingSteps active={4} />

      <div className="code-card">
        <h3>Код из SMS</h3>

        {error === null ? (
          <p className="code-subtitle">
            Мы отправили SMS с кодом на номер <span className="code-phone">{draft.phone}</span>
          </p>
        ) : (
          <BookingAlert title={alertTitle(error)} text={alertText(error, draft.hour, reference?.code_ttl_min)} />
        )}

        <div className="otp-inputs">
          {digits.map((digit, index) => (
            <input
              key={index}
              className={error === null ? "otp-digit" : "otp-digit otp-digit--error"}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              aria-label={`Цифра кода ${index + 1}`}
              onChange={(event) => setDigits(replaceDigit(digits, index, event.target.value))}
            />
          ))}
        </div>

        {error === null ? (
          <>
            <p className="code-timer">
              Отправить код повторно можно через <span className="code-timer-value">{formatCountdown(remaining)}</span>
            </p>
            <button
              className={remaining > 0 ? "code-resend code-resend--disabled" : "code-resend"}
              type="button"
              disabled={remaining > 0 || issueCode.isPending}
              onClick={resend}
            >
              Отправить код повторно
            </button>
          </>
        ) : timeUnavailable(error.state) ? (
          <button
            className="booking-btn-primary"
            type="button"
            onClick={() => router.push("/booking")}
          >
            Выбрать другое время
          </button>
        ) : (
          <button className="booking-btn-primary" type="button" disabled={issueCode.isPending} onClick={resend}>
            Выслать новый код
          </button>
        )}

        {error === null && (
          <>
            <button
              className="booking-btn-primary"
              type="button"
              disabled={!codeReady || confirm.isPending}
              onClick={submit}
            >
              Подтвердить запись
            </button>
            <p className="code-hint">
              Код действует {reference?.code_ttl_min ?? "—"} минут. Запись создастся только после
              ввода кода — время заранее не удерживается
            </p>
          </>
        )}
      </div>

      <div className="code-summary">
        <span>
          {draft.date && formatDayShort(draft.date)}, {draft.hour}:00
        </span>
        <span>·</span>
        <span>
          {draft.services.length} {plural(draft.services.length, ["услуга", "услуги", "услуг"])}
        </span>
        <span>·</span>
        <span>Итого</span>
        <b className="booking-summary-total-price">{formatMoney(quote.total)}</b>
        <button className="code-summary-link" type="button" onClick={() => router.push("/booking")}>
          Изменить время
        </button>
      </div>
    </section>
  );
}

function replaceDigit(digits: string[], index: number, value: string): string[] {
  const next = [...digits];
  next[index] = value.replace(/\D/g, "").slice(0, 1);

  return next;
}

function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Заголовок отказа: у двух состояний шага 4 он свой, остальные — общий. */
function alertTitle(error: BookingErrorResult): string {
  switch (error.state) {
    case "code_expired":
      return "Код устарел";
    case "slot_taken":
    case "slot_unavailable":
      return "Выбранное время больше недоступно";
    case "code_invalid":
      return "Код не найден";
    case "cooldown":
      return "Код уже отправлен";
    default:
      return "Не удалось подтвердить запись";
  }
}

/** Отказ по времени: выйти из тупика можно только сменой слота, повторный код не поможет. */
function timeUnavailable(state: BookingErrorState): boolean {
  return state === "slot_taken" || state === "slot_unavailable";
}

/** Текст отказа. Свои формулировки — там, где бэк говорит общим текстом. */
function alertText(error: BookingErrorResult, hour: number | null, ttl: number | undefined): string {
  switch (error.state) {
    case "code_expired":
      return `Срок действия кода${ttl ? ` — ${ttl} минут —` : ""} истёк. Запись не создана. Запросите новый код на тот же номер или введите другой номер телефона.`;
    case "code_invalid":
      return "Проверьте цифры из SMS и попробуйте ещё раз или запросите новый код.";
    case "slot_taken":
    case "slot_unavailable":
      return `Слот ${hour}:00 заняли. Запись не создана — ничего не удержано и не списано. Выберите другое время: услуги и данные сохранятся, придёт новый код.`;
    default:
      return error.message;
  }
}
