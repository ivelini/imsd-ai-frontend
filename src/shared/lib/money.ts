/**
 * Деньги проекта. API отдаёт копейки — в рублях считает только отображение.
 * formatMoney — ядро (копейки), formatPrice — обёртка для экранов, живущих в рублях.
 */

const KOPECKS_PER_RUBLE = 100;

/**
 * Копейки в рубли. Хвост «,00» не показываем: витрина живёт в целых рублях,
 * а ненулевые копейки терять нельзя — цена услуги записи приходит с ними.
 */
export function formatMoney(kopecks: number): string {
  const value = Math.round(kopecks);
  const hasKopecks = value % KOPECKS_PER_RUBLE !== 0;
  const options = hasKopecks ? { minimumFractionDigits: 2, maximumFractionDigits: 2 } : {};

  return (value / KOPECKS_PER_RUBLE).toLocaleString("ru-RU", options) + " ₽";
}

export function formatPrice(rubles: number): string {
  return formatMoney(rubles * KOPECKS_PER_RUBLE);
}
