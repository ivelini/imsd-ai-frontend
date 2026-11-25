"use client";
// Повторная отправка SMS-кода: остаток кулдауна считается от retry_after бэка.
// Таймер живёт здесь, чтобы регистрация, сброс пароля и смена телефона не дублировали его.
import { useEffect, useState } from "react";
import { formatCountdown, resendRemaining } from "@/shared/lib/countdown";

interface CodeResendProps {
  /** Момент выдачи кода; null — код ещё не запрашивали */
  issuedAt: number | null;
  /** Длительность кулдауна из ответа бэка, секунд */
  retryAfter: number | null;
  pending: boolean;
  onResend: () => void;
  label?: string;
}

const DEFAULT_LABEL = "Отправить код повторно";

export function CodeResend({
  issuedAt,
  retryAfter,
  pending,
  onResend,
  label = DEFAULT_LABEL,
}: CodeResendProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  const remaining =
    issuedAt !== null && retryAfter !== null
      ? resendRemaining({ issuedAt, retryAfter, now })
      : 0;

  return (
    <>
      {remaining > 0 ? (
        <p className="code-timer">
          Отправить код повторно можно через{" "}
          <span className="code-timer-value">{formatCountdown(remaining)}</span>
        </p>
      ) : null}
      <button
        className={remaining > 0 ? "code-resend code-resend--disabled" : "code-resend"}
        type="button"
        disabled={remaining > 0 || pending}
        onClick={onResend}
      >
        {label}
      </button>
    </>
  );
}
