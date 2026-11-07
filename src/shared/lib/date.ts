/**
 * Русский формат дат: «31 июля 2026».
 * Часовой пояс передаётся явно: серверный Intl зависит от TZ машины (dev —
 * Asia/Yekaterinburg, прод может быть UTC), без него дата у границы суток «переезжает».
 */

export const RU_LOCALE = "ru-RU";
export const SITE_TIME_ZONE = "Asia/Yekaterinburg";

/** «31 июля 2026»: день, месяц, год; «г.» в конце срезаем (артефакт ru-RU). */
export function formatRuLongDate(
  value: Date,
  timeZone: string = SITE_TIME_ZONE,
): string {
  return value
    .toLocaleDateString(RU_LOCALE, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone,
    })
    .replace(/\s*г\.$/, "");
}
