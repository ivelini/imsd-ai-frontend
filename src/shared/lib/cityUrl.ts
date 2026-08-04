// Утилиты для города в URL (city query-параметр)
import { DEFAULT_CITY, DEFAULT_CITY_VALUE, GEO_CITIES } from "@/data/geo";

/** Резолв label города по value (для серверных компонентов) */
export function resolveCityLabel(value?: string): string {
  if (!value) return DEFAULT_CITY;
  return GEO_CITIES.find((c) => c.value === value)?.label ?? DEFAULT_CITY;
}

export const CITY_PARAM = "city";

/** Извлечь value города из searchParams (или DEFAULT_CITY_VALUE) */
export function resolveCityValue(
  searchParams: URLSearchParams,
): string {
  return searchParams.get(CITY_PARAM) || DEFAULT_CITY_VALUE;
}

/** Добавить city параметр к URL-строке (пути с query). Если default — не добавляем. */
export function appendCityParam(url: string, cityValue: string): string {
  if (cityValue === DEFAULT_CITY_VALUE) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}city=${encodeURIComponent(cityValue)}`;
}

/** Слить текущие searchParams с патчем: overrides с ключом → новое значение, null → удалить */
export function mergeSearchParams(
  current: URLSearchParams,
  overrides: Record<string, string | null>,
): string {
  const next = new URLSearchParams(current.toString());
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  return next.toString();
}
