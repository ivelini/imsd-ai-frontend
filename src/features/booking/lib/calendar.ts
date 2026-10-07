/**
 * Сетка календаря записи: месяц раскладывается по неделям с понедельника.
 * Чистая функция — проверяется без DOM и без API.
 */

export type CalendarCellState = "empty" | "past" | "off" | "free";

export interface CalendarCell {
  /** 'YYYY-MM-DD'; у ведущих и добивочных ячеек — null */
  date: string | null;
  day: number | null;
  state: CalendarCellState;
}

export interface BuildCalendarInput {
  /** 'YYYY-MM' */
  month: string;
  /** 'YYYY-MM-DD' — сегодня по календарю пользователя */
  today: string;
  /** Карта доступности из GET /booking/slots: false — выходной, отсутствие ключа — тоже */
  days: Record<string, boolean>;
}

export function buildCalendar({ month, today, days }: BuildCalendarInput): CalendarCell[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const leading = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  const cells: CalendarCell[] = Array.from({ length: leading }, () => emptyCell());

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    cells.push({ date, day, state: dayState(date, today, days) });
  }

  while (cells.length % 7 !== 0) {
    cells.push(emptyCell());
  }

  return cells;
}

/**
 * День, который шаг «Время» показывает сразу при заходе: сегодня, если записаться
 * на него ещё можно, иначе — первый по календарю свободный день карты. Карта пуста
 * (грузится или в месяце нет слотов) — сегодня: шаг не должен остаться без даты.
 */
export function defaultBookingDate(days: Record<string, boolean>, today: string): string {
  if (days[today] === true) return today;

  const firstFree = Object.keys(days)
    .filter((date) => days[date] === true)
    .sort()[0];

  return firstFree ?? today;
}

/**
 * Прошлое отсекается по календарю, а не по карте бэка: тот отдаёт `true` и по
 * прошедшим дням, и кликабельным такой день делать нельзя.
 */
function dayState(date: string, today: string, days: Record<string, boolean>): CalendarCellState {
  if (date < today) return "past";

  return days[date] === true ? "free" : "off";
}

function emptyCell(): CalendarCell {
  return { date: null, day: null, state: "empty" };
}
