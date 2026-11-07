/**
 * Decimal-значения бэка приходят строками («7.0», «40.0») — на экране нужна
 * запись без хвостовых нулей. Правило одно на листинг и карточку товара.
 */
export function decimal(value: string | number): string {
  return String(Number(value));
}
