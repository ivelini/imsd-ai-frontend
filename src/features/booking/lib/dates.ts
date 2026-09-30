/**
 * Даты записи в человеческом виде: «11 сентября (пт)», «11 сентября 2026, пятница»,
 * «Сентябрь 2026». Разбор — в UTC: строка 'YYYY-MM-DD' не должна сдвигаться часовым поясом.
 */

const LOCALE = "ru-RU";

function parse(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

/** «11 сентября (пт)» — подпись выбранного дня в сводке записи. */
export function formatDayShort(date: string): string {
  const value = parse(date);
  const day = value.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const weekday = value.toLocaleDateString(LOCALE, { weekday: "short", timeZone: "UTC" });

  return `${day} (${weekday})`;
}

/** «11 сентября, пятница» — подпись дня над сеткой часов. */
export function formatDayLong(date: string): string {
  return parse(date).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    weekday: "long",
    timeZone: "UTC",
  });
}

/** «11 сентября 2026, пятница» — строка экрана успеха. */
export function formatDayFull(date: string): string {
  const value = parse(date);
  // Собираем порядок вручную: у ru-RU «г.» в конце и день недели перед датой
  const day = value.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const weekday = value.toLocaleDateString(LOCALE, { weekday: "long", timeZone: "UTC" });

  return `${day.replace(/\s*г\.$/, "")}, ${weekday}`;
}

/** «Сентябрь 2026» — заголовок сетки календаря. */
export function formatMonthTitle(month: string): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const value = new Date(Date.UTC(year, monthNumber - 1, 1));
  const title = value.toLocaleDateString(LOCALE, { month: "long", timeZone: "UTC" });

  return `${title.charAt(0).toUpperCase()}${title.slice(1)} ${year}`;
}

/** Сегодняшняя дата пользователя строкой 'YYYY-MM-DD' (локальный день, не UTC). */
export function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

/** Прибавить дни к 'YYYY-MM-DD'. */
export function addDays(date: string, days: number): string {
  const value = parse(date);
  value.setUTCDate(value.getUTCDate() + days);

  return value.toISOString().slice(0, 10);
}

/** Первое и последнее число месяца 'YYYY-MM'. */
export function monthRange(month: string): { from: string; to: string } {
  const [year, monthNumber] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}

export function addMonths(month: string, delta: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  const value = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));

  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}
