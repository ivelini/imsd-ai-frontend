// Время реплики чата: ISO с таймзоной → «ЧЧ:ММ» в зоне браузера.
import { RU_LOCALE } from "@/shared/lib/date";

const TIME_FORMATTER = new Intl.DateTimeFormat(RU_LOCALE, { hour: "2-digit", minute: "2-digit" });

/** Подпись времени; пустое или битое время подписи не рисует (в контракте `null` допустим). */
export function formatChatTime(iso: string | null): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return TIME_FORMATTER.format(date);
}
