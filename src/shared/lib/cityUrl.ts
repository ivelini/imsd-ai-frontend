// Утилиты для города в URL (city query-параметр)

/**
 * Резолв label города по value (для серверных компонентов).
 * cities/defaultCity — из getGeo() (shared/api/data.ts), не из моков напрямую.
 */
export function resolveCityLabel(
  value: string | undefined,
  cities: { value: string; label: string }[],
  defaultCity: string,
): string {
  if (!value) return defaultCity;
  return cities.find((c) => c.value === value)?.label ?? defaultCity;
}

export const CITY_PARAM = "city";

/** Извлечь value города из searchParams (null = не выбран) */
export function resolveCityValue(
  searchParams: URLSearchParams,
): string | null {
  return searchParams.get(CITY_PARAM) || null;
}

/**
 * Добавить city параметр к URL-строке.
 * Если город не выбран (cityValue пуст) — не добавляем.
 * Если выбран (даже Челябинск) — добавляем всегда.
 */
export function appendCityParam(url: string, cityValue: string): string {
  if (!cityValue) return url;
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

/** Действие синхронизации города между URL и стором (CityHydrator) */
export type CitySyncAction =
  | { type: "none" }
  | { type: "setStore"; value: string }
  | { type: "setUrl"; value: string };

/**
 * Что делать при расхождении URL и стора:
 * - URL пуст, стор пуст → ничего;
 * - URL пуст, стор есть → дописать город в URL (заход без ?city= с сохранённым выбором);
 * - URL есть и отличается от стора → стор подчиняется URL (URL — источник истины);
 * - совпадают → ничего (защита от бесконечного цикла replace).
 */
export function citySyncAction(
  urlCity: string | null,
  storeCity: string | null,
): CitySyncAction {
  if (urlCity) {
    if (urlCity !== storeCity) return { type: "setStore", value: urlCity };
    return { type: "none" };
  }
  if (storeCity) return { type: "setUrl", value: storeCity };
  return { type: "none" };
}
