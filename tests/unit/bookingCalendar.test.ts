// Сетка календаря записи на шиномонтаж: прошлое, выходные, неделя с понедельника
// (тест-лист плана booking-react-port, тесты 1–3)
import { describe, expect, it } from "vitest";

import { buildCalendar, type CalendarCell } from "@/features/booking/lib/calendar";

function cellAt(cells: CalendarCell[], day: number): CalendarCell {
  const cell = cells.find((c) => c.day === day);
  if (!cell) throw new Error(`в сетке нет ячейки ${day}`);
  return cell;
}

describe("buildCalendar (сетка месяца)", () => {
  it("test_past_day_ignores_backend_availability", () => {
    // бэк отдаёт true и по прошедшему дню — кликабельность решает календарь, а не карта
    const cells = buildCalendar({
      month: "2026-09",
      today: "2026-09-15",
      days: { "2026-09-10": true, "2026-09-16": true },
    });

    expect(cellAt(cells, 10).state).toBe("past");
    expect(cellAt(cells, 16).state).toBe("free");
  });

  it("test_closed_day_marked_off_not_free", () => {
    const cells = buildCalendar({
      month: "2026-09",
      today: "2026-09-15",
      days: { "2026-09-16": false },
    });

    expect(cellAt(cells, 16).state).toBe("off");
  });

  it("test_week_starts_monday_with_leading_empties", () => {
    // 2026-09-01 — вторник: первый столбец («Пн») пустой, 30 дней укладываются в 35 ячеек
    const cells = buildCalendar({ month: "2026-09", today: "2026-09-15", days: {} });

    expect(cells[0].state).toBe("empty");
    expect(cells[0].day).toBeNull();
    expect(cells.length % 7).toBe(0);
    expect([35, 42]).toContain(cells.length);
  });
});
