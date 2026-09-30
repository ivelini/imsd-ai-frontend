/**
 * Итог записи по выбранным услугам. Цены — в копейках, как отдаёт API;
 * в рубли переводит только отображение (shared/lib/money).
 */
import type { BookingServiceDto } from "@/features/booking/types";

/** Строка итога: цена за одно колесо и количество. */
export interface QuoteItem {
  id: number;
  unitPrice: number;
  quantity: number;
}

export interface QuoteRow extends QuoteItem {
  amount: number;
}

export interface Quote {
  rows: QuoteRow[];
  total: number;
}

/**
 * Состав итога: услуги, отмеченные в черновике. Количество берётся из выбора —
 * бэк при отсутствии ключа молча ставит 1, поэтому источник количества только один.
 */
export function toQuoteItems(
  services: BookingServiceDto[],
  quantities: Record<number, number>,
): QuoteItem[] {
  return services
    .filter((service) => quantities[service.id] !== undefined)
    .map((service) => ({
      id: service.id,
      // без пары радиус+тип бэк не отдаёт unit_price — строка обязана взять base_price, не ноль
      unitPrice: service.unit_price ?? service.base_price,
      quantity: quantities[service.id],
    }));
}

export function buildQuote(items: QuoteItem[]): Quote {
  const rows = items.map((item) => ({ ...item, amount: item.unitPrice * item.quantity }));

  return { rows, total: rows.reduce((sum, row) => sum + row.amount, 0) };
}
