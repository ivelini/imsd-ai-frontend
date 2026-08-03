// Парсер URL-сегментов каталога в FilterState (фаза 2)
// [[...params]] → { season?, brand?, width?, profile?, diameter? }
// Порядок сегментов не важен при парсинге, фиксированный при сборке.
import type { FilterState } from "@/features/catalog/types";

const SEASON_MAP: Record<string, string> = {
  winter: "зимняя",
  summer: "летняя",
  "all-season": "всесезонная",
};

const REVERSE_SEASON_MAP: Record<string, string> = {
  "зимняя": "winter",
  "летняя": "summer",
  "всесезонная": "all-season",
};

const R_DIAMETER = /^r(\d+)$/i; // r15, R16

export function parseCatalogParams(
  params: { params?: string[] },
  searchParams: Record<string, string | string[] | undefined>,
): FilterState {
  const segments = params.params ?? [];
  const filter: FilterState = {};

  // Проход по сегментам: определяем тип каждого
  const unknowns: string[] = [];
  for (const seg of segments) {
    const lower = seg.toLowerCase();

    // Сезон
    if (SEASON_MAP[lower]) {
      filter.season = SEASON_MAP[lower];
      continue;
    }

    // Диаметр rN
    const rMatch = lower.match(R_DIAMETER);
    if (rMatch) {
      filter.diameter = parseInt(rMatch[1], 10);
      continue;
    }

    // Число → ширина или профиль
    const num = parseInt(lower, 10);
    if (!isNaN(num)) {
      if (filter.width == null) {
        filter.width = num;
      } else if (filter.profile == null) {
        filter.profile = num;
      }
      continue;
    }

    // Всё остальное — потенциальный бренд
    unknowns.push(lower);
  }

  // Первый неизвестный → бренд
  if (unknowns.length > 0) {
    filter.brand = unknowns[0];
  }

  // Query-параметры
  if (searchParams.price_min) {
    filter.priceMin = parseInt(String(searchParams.price_min), 10);
  }
  if (searchParams.price_max) {
    filter.priceMax = parseInt(String(searchParams.price_max), 10);
  }
  if (searchParams.delivery) {
    filter.delivery = Array.isArray(searchParams.delivery)
      ? searchParams.delivery
      : [searchParams.delivery];
  }
  if (searchParams.page) {
    filter.page = parseInt(String(searchParams.page), 10);
  }

  return filter;
}

/** Сборка URL из FilterState → фиксированный порядок season/brand/width/profile/diameter */
export function buildCatalogUrl(filter: FilterState): string {
  const parts: string[] = [];

  if (filter.season) {
    parts.push(REVERSE_SEASON_MAP[filter.season] ?? filter.season);
  }
  if (filter.brand) {
    parts.push(filter.brand);
  }
  if (filter.width) {
    parts.push(String(filter.width));
  }
  if (filter.profile) {
    parts.push(String(filter.profile));
  }
  if (filter.diameter) {
    parts.push(`r${filter.diameter}`);
  }

  const query = new URLSearchParams();
  if (filter.priceMin) query.set("price_min", String(filter.priceMin));
  if (filter.priceMax) query.set("price_max", String(filter.priceMax));
  if (filter.delivery?.length) {
    filter.delivery.forEach((d) => query.append("delivery[]", d));
  }
  if (filter.page && filter.page > 1) query.set("page", String(filter.page));

  const path = `/catalog/tires/${parts.join("/")}`;
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export { SEASON_MAP, REVERSE_SEASON_MAP };
