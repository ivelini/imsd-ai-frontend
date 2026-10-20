// URL авто-подбора: слаги Vehicle (контракт бэка 20.10.2026).
// Сегменты: /catalog/{tires|wheels}/auto/{makeSlug}/{modelSlug}/{year}/{modificationSlug}.
// Числовой id принимается как legacy-значение (бэк поддерживает fallback); страница
// канонизирует такие сегменты редиректом на слаг.

export type VehicleAutoCategory = "tires" | "wheels";

export interface VehicleAutoSelection {
  make?: string;
  model?: string;
  year?: number;
  modification?: string;
}

const YEAR_MIN = 1900;
const YEAR_MAX = 2100;
const SEGMENT_PATTERN = /^[a-z0-9-]+$/;

function parseYear(value: string): number | null {
  if (!/^\d{4}$/.test(value)) return null;
  const parsed = Number(value);
  return parsed >= YEAR_MIN && parsed <= YEAR_MAX ? parsed : null;
}

/**
 * Разбор сегментов маршрута. Возвращает null для невалидного сегмента;
 * пустой массив — корень каскада (марки). Слаги и numeric id проходят.
 */
export function parseVehicleAutoSegments(segments: string[]): VehicleAutoSelection | null {
  if (segments.length > 4) return null;

  const selection: VehicleAutoSelection = {};

  const [make, model, year, modification] = segments;

  if (make !== undefined) {
    if (!SEGMENT_PATTERN.test(make)) return null;
    selection.make = make;
  }

  if (model !== undefined) {
    if (!SEGMENT_PATTERN.test(model)) return null;
    selection.model = model;
  }

  if (year !== undefined) {
    const parsedYear = parseYear(year);
    if (parsedYear === null) return null;
    selection.year = parsedYear;
  }

  if (modification !== undefined) {
    if (!SEGMENT_PATTERN.test(modification)) return null;
    selection.modification = modification;
  }

  return selection;
}

/** Путь авто-подбора по выбранному каскаду (query добавляет вызывающий). */
export function vehicleAutoPath(
  selection: VehicleAutoSelection,
  category: VehicleAutoCategory = "tires",
): string {
  const base = category === "wheels" ? "/catalog/wheels/auto" : "/catalog/tires/auto";
  const parts = [
    selection.make,
    selection.model,
    selection.year !== undefined ? String(selection.year) : undefined,
    selection.modification,
  ].filter((part): part is string => part !== undefined);

  return [base, ...parts].join("/");
}

/** Совпадение сегмента URL со справочной записью: слаг канонический, id — legacy. */
export function matchesVehicleRef(
  ref: { id: number; slug: string },
  value: string,
): boolean {
  return ref.slug === value || String(ref.id) === value;
}
