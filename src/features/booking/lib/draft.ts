/**
 * Черновик записи: полнота, смена времени, кулдаун кода.
 * Хранилище черновика — отдельно (draftStore): здесь только чистые переходы.
 */
import type { BookingDraft } from "@/features/booking/types";

/** Шаги 2–4 при неполном черновике уводят на шаг 1 — защита от прямого захода по адресу. */
export function isComplete(draft: BookingDraft): boolean {
  return draft.date !== null && draft.hour !== null;
}

export function createEmptyDraft(): BookingDraft {
  return {
    date: null,
    hour: null,
    radius: null,
    carType: null,
    services: [],
    name: "",
    phone: "",
    plate: null,
    codeIssuedAt: null,
    codeRetryAfter: null,
  };
}

/**
 * Смена времени сбрасывает момент выдачи кода: иначе шаг 4 подтвердит запись
 * кодом, выданным на другое время.
 */
export function setTime(draft: BookingDraft, date: string, hour: number | null): BookingDraft {
  if (draft.date === date && draft.hour === hour) return draft;

  return { ...draft, date, hour, codeIssuedAt: null };
}

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
