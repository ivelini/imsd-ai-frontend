/**
 * Черновик записи: полнота и смена времени.
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
