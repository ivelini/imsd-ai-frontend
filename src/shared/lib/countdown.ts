/**
 * Кулдаун повторной отправки SMS-кода: общий для записи на шиномонтаж и оформления
 * заказа. Длительность приходит от бэка (`retry_after`), фронт её не выдумывает.
 */
export interface ResendCountdownInput {
  issuedAt: number;
  /** Длительность кулдауна из ответа бэка (`retry_after`), а не остаток */
  retryAfter: number;
  now: number;
}

/** Остаток до повторной отправки кода, в секундах; 0 — кнопка активна. */
export function resendRemaining({ issuedAt, retryAfter, now }: ResendCountdownInput): number {
  const elapsed = Math.floor((now - issuedAt) / 1000);

  return Math.max(0, retryAfter - elapsed);
}

/** Секунды в «M:SS» — таймер кнопки «Отправить код повторно». */
export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));

  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
