// Сетка календаря записи на шиномонтаж: прошлое, выходные, неделя с понедельника
// (тест-листы планов booking-react-port — тесты 1–3, booking-default-day — тесты 1–4)
import { describe, expect, it } from "vitest";

import {
  buildCalendar,
  defaultBookingDate,
  type CalendarCell,
} from "@/features/booking/lib/calendar";

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

describe("defaultBookingDate (день по умолчанию на шаге «Время»)", () => {
  it("test_default_date_is_today_when_available", () => {
    expect(defaultBookingDate({ "2026-10-06": true, "2026-10-07": false }, "2026-10-06")).toBe(
      "2026-10-06",
    );
  });

  it("test_default_date_first_free_when_today_unavailable", () => {
    const days = {
      "2026-10-06": false,
      "2026-10-07": false,
      "2026-10-08": true,
      "2026-10-09": true,
    };

    expect(defaultBookingDate(days, "2026-10-06")).toBe("2026-10-08");
  });

  it("test_default_date_ignores_map_order", () => {
    // ключи карты приходят от бэка в порядке диапазона, но полагаться на это нельзя
    expect(defaultBookingDate({ "2026-10-09": true, "2026-10-07": true }, "2026-10-06")).toBe(
      "2026-10-07",
    );
  });

  it("test_default_date_falls_back_to_today_on_empty_map", () => {
    // карта ещё грузится или месяц пуст — шаг не должен остаться без даты
    expect(defaultBookingDate({}, "2026-10-06")).toBe("2026-10-06");
  });
});
