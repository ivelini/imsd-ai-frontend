// Сводка записи (aside шагов 1–3): дата и время, состав, итог, кнопка перехода
import type { ReactNode } from "react";
import { formatDayShort } from "@/features/booking/lib/dates";
import { formatMoney } from "@/shared/lib/money";

interface BookingSummaryProps {
  date: string | null;
  hour: number | null;
  /** Копейки; не передан — блок «Итого» не показывается (шаг 1) */
  total?: number;
  /** Строки состава: на шаге 1 их нет */
  children?: ReactNode;
  /** Кнопка перехода и ссылка «изменить» */
  footer: ReactNode;
}

export function BookingSummary({ date, hour, total, children, footer }: BookingSummaryProps) {
  return (
    <aside className="booking-summary">
      <h3 className="booking-summary-title">Ваша запись</h3>
      <div className="booking-summary-group">
        <div className="booking-summary-row">
          <span className="booking-summary-label">Дата</span>
          <span className="booking-summary-value">{date ? formatDayShort(date) : "—"}</span>
        </div>
        <div className="booking-summary-row">
          <span className="booking-summary-label">Время</span>
          <span className="booking-summary-value">{hour !== null ? `${hour}:00` : "—"}</span>
        </div>
      </div>

      {children}

      {total !== undefined && (
        <div className="booking-summary-total">
          <span>Итого</span>
          <span className="booking-summary-total-price">{formatMoney(total)}</span>
        </div>
      )}

      {footer}
    </aside>
  );
}
