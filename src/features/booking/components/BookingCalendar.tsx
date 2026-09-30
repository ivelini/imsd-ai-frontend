// Сетка календаря записи: месяц, легенда, выбор дня. Свободные дни — кнопки,
// прошлые и выходные — нет (клик по ним не должен ничего значить)
import { buildCalendar } from "@/features/booking/lib/calendar";
import { addMonths, formatMonthTitle, today } from "@/features/booking/lib/dates";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface BookingCalendarProps {
  month: string;
  days: Record<string, boolean>;
  selected: string | null;
  onSelect: (date: string) => void;
  onMonthChange: (month: string) => void;
  /** Раньше текущего месяца уходить нельзя: там нет слотов */
  canGoBack: boolean;
}

export function BookingCalendar({
  month,
  days,
  selected,
  onSelect,
  onMonthChange,
  canGoBack,
}: BookingCalendarProps) {
  const cells = buildCalendar({ month, today: today(), days });

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          className={canGoBack ? "calendar-nav" : "calendar-nav calendar-nav--disabled"}
          type="button"
          aria-label="Предыдущий месяц"
          disabled={!canGoBack}
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          ‹
        </button>
        <div className="calendar-title">{formatMonthTitle(month)}</div>
        <button
          className="calendar-nav"
          type="button"
          aria-label="Следующий месяц"
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-days">
        {cells.map((cell, index) => {
          if (cell.state === "empty" || cell.date === null) {
            return <span key={index} className="calendar-day calendar-day--empty" />;
          }

          const classes = ["calendar-day", `calendar-day--${cell.state}`];
          if (cell.date === selected) classes.push("calendar-day--selected");
          if (cell.date === today()) classes.push("calendar-day--today");

          return cell.state === "free" ? (
            <button
              key={cell.date}
              className={classes.join(" ")}
              type="button"
              onClick={() => onSelect(cell.date!)}
            >
              {cell.day}
            </button>
          ) : (
            <span key={cell.date} className={classes.join(" ")}>
              {cell.day}
            </span>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="calendar-legend-item">
          <i className="calendar-legend-dot calendar-legend-dot--selectable" />
          Свободно
        </span>
        <span className="calendar-legend-item">
          <i className="calendar-legend-dot calendar-legend-dot--off" />
          Выходной
        </span>
        <span className="calendar-legend-item">
          <i className="calendar-legend-dot" />
          Выбрано
        </span>
      </div>
    </div>
  );
}
