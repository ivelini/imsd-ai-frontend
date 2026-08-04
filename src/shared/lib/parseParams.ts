// Парсер URL-сегментов каталога в FilterState (фаза 2)
// [[...params]] → { season?, brand?, width?, profile?, diameter? }
// value сегментов = value опций фильтра 1:1 (summer, viatti, 185, 60, r15) —
// никаких маппингов (контракт: .claude/rules/api-contract.md)
import type { FilterState } from "@/features/catalog/types";
import { DEFAULT_CITY_VALUE } from "@/data/geo";

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

    // Всё остальное — сезон или бренд (value совпадает с URL напрямую)
    unknowns.push(lower);
  }

  // Известные сезоны → season, остальное → бренд
  const seasons = new Set(["summer", "winter", "all-season"]);
  if (unknowns.length > 0) {
    const first = unknowns[0];
    filter.season = seasons.has(first) ? first : undefined;
    // Бренд — первое не-сезонное значение
    const brand = unknowns.find((u) => !seasons.has(u));
    if (brand) filter.brand = brand;
  }

  // Query-параметры (сегменты имеют приоритет: если сегмент не задал — берём из query,
  // так каскад авто хранит параметры шин в query при переключении вкладок)
  if (filter.season == null && searchParams.season) {
    filter.season = String(searchParams.season);
  }
  if (filter.brand == null && searchParams.brand) {
    filter.brand = String(searchParams.brand);
  }
  if (filter.width == null && searchParams.width) {
    filter.width = parseInt(String(searchParams.width), 10);
  }
  if (filter.profile == null && searchParams.profile) {
    filter.profile = parseInt(String(searchParams.profile), 10);
  }
  if (filter.diameter == null && searchParams.diameter) {
    filter.diameter = parseInt(String(searchParams.diameter), 10);
  }
  if (searchParams.price_min) {
    filter.priceMin = parseInt(String(searchParams.price_min), 10);
  }
  if (searchParams.price_max) {
    filter.priceMax = parseInt(String(searchParams.price_max), 10);
  }
  if (searchParams.country) {
    filter.country = String(searchParams.country);
  }
  if (searchParams.tire_type) {
    filter.tireType = String(searchParams.tire_type);
  }
  // delivery[] приходит из URL как { "delivery[]": [...] } — читаем оба ключа
  const deliveryParam = searchParams.delivery ?? searchParams["delivery[]"];
  if (deliveryParam) {
    filter.delivery = Array.isArray(deliveryParam)
      ? deliveryParam
      : [deliveryParam];
  }
  if (searchParams.page) {
    filter.page = parseInt(String(searchParams.page), 10);
  }

  return filter;
}

/**
 * Query-строка фильтров.
 * includeParams=true — включает и параметры шин (season/brand/width/profile/diameter):
 * используется на вкладке «По автомобилю», чтобы состояние фильтра параметров
 * сохранялось в URL и восстанавливалось при возврате на «По параметрам».
 */
export function buildQueryString(
  filter: FilterState,
  includeParams = false,
  cityValue?: string,
): string {
  const query = new URLSearchParams();
  if (includeParams) {
    if (filter.season) query.set("season", filter.season);
    if (filter.brand) query.set("brand", filter.brand);
    if (filter.width) query.set("width", String(filter.width));
    if (filter.profile) query.set("profile", String(filter.profile));
    if (filter.diameter) query.set("diameter", String(filter.diameter));
  }
  if (filter.priceMin) query.set("price_min", String(filter.priceMin));
  if (filter.priceMax) query.set("price_max", String(filter.priceMax));
  if (filter.country) query.set("country", filter.country);
  if (filter.tireType) query.set("tire_type", filter.tireType);
  if (filter.delivery?.length) {
    filter.delivery.forEach((d) => query.append("delivery", d));
  }
  if (filter.page && filter.page > 1) query.set("page", String(filter.page));
  if (cityValue && cityValue !== DEFAULT_CITY_VALUE) {
    query.set("city", cityValue);
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

/** Сборка URL каталога → фиксированный порядок season/brand/width/profile/diameter + query */
export function buildCatalogUrl(filter: FilterState, cityValue?: string): string {
  const parts: string[] = [];

  if (filter.season) {
    parts.push(filter.season); // value уже латиницей
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

  const path = `/catalog/tires/${parts.join("/")}`;
  return `${path}${buildQueryString(filter, false, cityValue)}`;
}

// ---------------------------------------------------------------------------
// Диски
// ---------------------------------------------------------------------------

/** Парсинг URL-сегментов + query для каталога дисков */
export function parseWheelsParams(
  params: { params?: string[] },
  searchParams: Record<string, string | string[] | undefined>,
): FilterState {
  const segments = params.params ?? [];
  const filter: FilterState = {};

  for (const seg of segments) {
    const lower = seg.toLowerCase();

    // Диаметр rN
    const rMatch = lower.match(R_DIAMETER);
    if (rMatch) {
      filter.diameter = parseInt(rMatch[1], 10);
      continue;
    }

    // Число → ширина (J-width, например 6.5)
    const num = parseFloat(lower);
    if (!isNaN(num) && filter.width == null) {
      filter.width = num;
      continue;
    }

    // Остальное — бренд
    if (filter.brand == null) {
      filter.brand = lower;
    }
  }

  // Wheels-specific query params
  if (searchParams.pcd) filter.pcd = String(searchParams.pcd);
  if (searchParams.et) filter.et = parseInt(String(searchParams.et), 10);
  if (searchParams.hub_bore) filter.hubBore = parseFloat(String(searchParams.hub_bore));
  if (searchParams.wheel_type) filter.wheelType = String(searchParams.wheel_type);

  // Общие query-параметры
  if (searchParams.brand && filter.brand == null) filter.brand = String(searchParams.brand);
  if (searchParams.price_min) filter.priceMin = parseInt(String(searchParams.price_min), 10);
  if (searchParams.price_max) filter.priceMax = parseInt(String(searchParams.price_max), 10);
  if (searchParams.country) filter.country = String(searchParams.country);
  const deliveryParam = searchParams.delivery ?? searchParams["delivery[]"];
  if (deliveryParam) {
    filter.delivery = Array.isArray(deliveryParam) ? deliveryParam : [deliveryParam];
  }
  if (searchParams.page) filter.page = parseInt(String(searchParams.page), 10);

  return filter;
}

/** Сборка URL для каталога дисков */
export function buildWheelsUrl(filter: FilterState, cityValue?: string): string {
  const parts: string[] = [];

  if (filter.diameter) parts.push(`r${filter.diameter}`);
  if (filter.width) parts.push(String(filter.width));
  if (filter.brand) parts.push(filter.brand);

  const path = `/catalog/wheels/${parts.join("/")}`;
  const query = new URLSearchParams();

  if (filter.pcd) query.set("pcd", filter.pcd);
  if (filter.et) query.set("et", String(filter.et));
  if (filter.hubBore) query.set("hub_bore", String(filter.hubBore));
  if (filter.wheelType) query.set("wheel_type", filter.wheelType);
  if (filter.priceMin) query.set("price_min", String(filter.priceMin));
  if (filter.priceMax) query.set("price_max", String(filter.priceMax));
  if (filter.country) query.set("country", filter.country);
  if (filter.delivery?.length) filter.delivery.forEach((d) => query.append("delivery", d));
  if (filter.page && filter.page > 1) query.set("page", String(filter.page));
  if (cityValue && cityValue !== DEFAULT_CITY_VALUE) query.set("city", cityValue);

  const qs = query.toString();
  return `${path}${qs ? `?${qs}` : ""}`;
}
