// Опции каскада «По автомобилю»: слаг/id → строковое value, подпись формирует бэк.
import type { FilterOption } from "@/features/catalog/types";

export function toAutoOptions<T>(
  items: T[],
  value: (item: T) => string,
  label: (item: T) => string,
): FilterOption[] {
  return items.map((item) => ({ value: value(item), label: label(item) }));
}
