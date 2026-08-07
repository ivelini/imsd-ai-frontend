// Парсер URL-сегментов каталога в FilterState (фаза 2, обобщён 07.08.2026)
// [[...params]] → { season?, brand?, width?, profile?, diameter? }
// value сегментов = value опций фильтра 1:1 (summer, viatti, 185, 60, r15) —
// никаких маппингов (контракт: .claude/rules/api-contract.md)
// Грамматика каталога — конфиг (порядок сегментов, query-поля):
// шины и диски различаются только TIRES_CONFIG / WHEELS_CONFIG.
import type { FilterState } from "@/features/catalog/types";

const R_DIAMETER = /^r(\d+)$/i; // r15, R16

// ---------------------------------------------------------------------------
// Правила конфига
// ---------------------------------------------------------------------------

/** Парсер сегмента: распознать и записать в filter. true = сегмент «съеден» */
type SegmentParser = (seg: string, filter: FilterState) => boolean;

/** Парсер query-параметра: из searchParams в filter */
type QueryParser = (
  sp: Record<string, string | string[] | undefined>,
  filter: FilterState,
) => void;

export interface CatalogUrlConfig {
  /** Префикс пути: "/catalog/tires" | "/catalog/wheels" */
  pathPrefix: string;
  /** Порядок и логика разбора сегментов URL */
  segmentParsers: SegmentParser[];
  /** Парсинг query-параметров (общие добавляет parseUrl) */
  queryParsers: QueryParser[];
  /** Сегменты из FilterState в фиксированном порядке URL */
  segmentOrder: (f: FilterState) => (string | null)[];
  /** Свои query-поля в URL (общие поля добавляет buildUrl) */
  extraQueryFields: (f: FilterState) => [string, string][];
}

// ---------------------------------------------------------------------------
// Общие сегмент-парсеры
// ---------------------------------------------------------------------------

/** rN → diameter (общий для шин и дисков) */
const diameterSegment: SegmentParser = (seg, filter) => {
  const m = seg.toLowerCase().match(R_DIAMETER);
  if (!m) return false;
  filter.diameter = parseInt(m[1], 10);
  return true;
};

/** Числа шин: первое → ширина, второе → профиль, остальные игнорируются */
const tireNumberSegment: SegmentParser = (seg, filter) => {
  const num = parseInt(seg, 10);
  if (isNaN(num)) return false;
  if (filter.width == null) filter.width = num;
  else if (filter.profile == null) filter.profile = num;
  return true;
};

/** Число дисков: первое → ширина (J-width, например 6.5) */
const wheelNumberSegment: SegmentParser = (seg, filter) => {
  const num = parseFloat(seg);
  if (isNaN(num) || filter.width != null) return false;
  filter.width = num;
  return true;
};

/**
 * Сезон/бренд шин — семантика 1-в-1 с прежним кодом:
 * сезон — только ПЕРВЫЙ нечисловой сегмент (если это сезон);
 * бренд — первый не-сезонный; остальные нечисловые игнорируются
 * (например /tires/viatti/summer/... — season из URL не берётся).
 */
const tireBrandSeasonSegment: SegmentParser = (seg, filter) => {
  const lower = seg.toLowerCase();
  const seasons = new Set(["summer", "winter", "all-season"]);
  const isSeason = seasons.has(lower);
  if (filter.brand == null && !isSeason) {
    filter.brand = lower;
  } else if (filter.season == null && filter.brand == null && isSeason) {
    filter.season = lower;
  }
  return true; // потреблён (даже если проигнорирован)
};

/** Бренд дисков — первый нечисловой сегмент */
const wheelBrandSegment: SegmentParser = (seg, filter) => {
  if (filter.brand == null) filter.brand = seg.toLowerCase();
  return true;
};

// ---------------------------------------------------------------------------
// Общие query-парсеры
// ---------------------------------------------------------------------------

const strVal = (raw: string | string[] | undefined) => String(raw);
const intVal = (raw: string | string[] | undefined) => parseInt(String(raw), 10);
const floatVal = (raw: string | string[] | undefined) => parseFloat(String(raw));

/** Query с fallback: заполняет поле только если его не задали сегменты */
const fallback = (
  urlKey: string,
  filterKey: keyof FilterState,
  toValue: (raw: string | string[] | undefined) => unknown,
): QueryParser => (sp, filter) => {
  const raw = sp[urlKey];
  if (filter[filterKey] == null && raw) {
    (filter as unknown as Record<string, unknown>)[filterKey] = toValue(raw);
  }
};

/** Query безусловно: перезаписывает (поля, которых нет в сегментах) */
const always = (
  urlKey: string,
  filterKey: keyof FilterState,
  toValue: (raw: string | string[] | undefined) => unknown,
): QueryParser => (sp, filter) => {
  const raw = sp[urlKey];
  if (raw) {
    (filter as unknown as Record<string, unknown>)[filterKey] = toValue(raw);
  }
};

/** delivery[] приходит из URL как { "delivery[]": [...] } — читаем оба ключа */
const deliveryQuery: QueryParser = (sp, filter) => {
  const raw = sp.delivery ?? sp["delivery[]"];
  if (raw) {
    filter.delivery = Array.isArray(raw) ? raw : [raw];
  }
};

/** Общие query-поля шин и дисков */
const commonQueryParsers: QueryParser[] = [
  always("price_min", "priceMin", intVal),
  always("price_max", "priceMax", intVal),
  always("country", "country", strVal),
  deliveryQuery,
  always("page", "page", intVal),
];

// ---------------------------------------------------------------------------
// Общие query-поля в URL
// ---------------------------------------------------------------------------

function writeCommonQuery(filter: FilterState, query: URLSearchParams): void {
  if (filter.priceMin) query.set("price_min", String(filter.priceMin));
  if (filter.priceMax) query.set("price_max", String(filter.priceMax));
  if (filter.country) query.set("country", filter.country);
  if (filter.delivery?.length) {
    filter.delivery.forEach((d) => query.append("delivery", d));
  }
  if (filter.page && filter.page > 1) query.set("page", String(filter.page));
}

/** Параметры шин для includeParams (вкладка «По автомобилю») */
function writeTireParams(filter: FilterState, query: URLSearchParams): void {
  if (filter.season) query.set("season", filter.season);
  if (filter.brand) query.set("brand", filter.brand);
  if (filter.width) query.set("width", String(filter.width));
  if (filter.profile) query.set("profile", String(filter.profile));
  if (filter.diameter) query.set("diameter", String(filter.diameter));
}

/** Query-часть URL (общие поля + свои + city) — используется buildUrl и buildQueryString */
function buildQueryPortion(
  config: CatalogUrlConfig,
  filter: FilterState,
  includeParams: boolean,
  cityValue?: string | null,
): string {
  const query = new URLSearchParams();
  writeCommonQuery(filter, query);
  if (includeParams) writeTireParams(filter, query);
  for (const [key, value] of config.extraQueryFields(filter)) query.set(key, value);
  if (cityValue) query.set("city", cityValue);
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// ---------------------------------------------------------------------------
// Обобщённые функции
// ---------------------------------------------------------------------------

export function parseUrl(
  config: CatalogUrlConfig,
  params: { params?: string[] },
  searchParams: Record<string, string | string[] | undefined>,
): FilterState {
  const filter: FilterState = {};

  // Сегменты: пробуем парсеры по порядку, первый «съевший» побеждает
  for (const seg of params.params ?? []) {
    for (const parser of config.segmentParsers) {
      if (parser(seg, filter)) break;
    }
  }

  // Query: свои параметры + общие
  for (const parser of config.queryParsers) parser(searchParams, filter);
  for (const parser of commonQueryParsers) parser(searchParams, filter);

  return filter;
}

export function buildUrl(
  config: CatalogUrlConfig,
  filter: FilterState,
  cityValue?: string | null,
  includeParams = false,
): string {
  const path = `${config.pathPrefix}/${config.segmentOrder(filter).filter(Boolean).join("/")}`;
  return `${path}${buildQueryPortion(config, filter, includeParams, cityValue)}`;
}

// ---------------------------------------------------------------------------
// Конфиги шин и дисков
// ---------------------------------------------------------------------------

const tireSegmentOrder = (f: FilterState) => [
  f.season ?? null,
  f.brand ?? null,
  f.width != null ? String(f.width) : null,
  f.profile != null ? String(f.profile) : null,
  f.diameter != null ? `r${f.diameter}` : null,
];

const wheelSegmentOrder = (f: FilterState) => [
  f.diameter != null ? `r${f.diameter}` : null,
  f.width != null ? String(f.width) : null,
  f.brand ?? null,
];

const tireExtraQueryFields = (f: FilterState): [string, string][] => {
  const out: [string, string][] = [];
  if (f.tireType) out.push(["tire_type", f.tireType]);
  return out;
};

const wheelExtraQueryFields = (f: FilterState): [string, string][] => {
  const out: [string, string][] = [];
  if (f.pcd) out.push(["pcd", f.pcd]);
  if (f.et) out.push(["et", String(f.et)]);
  if (f.hubBore) out.push(["hub_bore", String(f.hubBore)]);
  if (f.wheelType) out.push(["wheel_type", f.wheelType]);
  return out;
};

export const TIRES_CONFIG: CatalogUrlConfig = {
  pathPrefix: "/catalog/tires",
  segmentParsers: [diameterSegment, tireNumberSegment, tireBrandSeasonSegment],
  queryParsers: [
    fallback("season", "season", strVal),
    fallback("brand", "brand", strVal),
    fallback("width", "width", intVal),
    fallback("profile", "profile", intVal),
    fallback("diameter", "diameter", intVal),
    always("tire_type", "tireType", strVal),
  ],
  segmentOrder: tireSegmentOrder,
  extraQueryFields: tireExtraQueryFields,
};

export const WHEELS_CONFIG: CatalogUrlConfig = {
  pathPrefix: "/catalog/wheels",
  segmentParsers: [diameterSegment, wheelNumberSegment, wheelBrandSegment],
  queryParsers: [
    fallback("brand", "brand", strVal),
    always("pcd", "pcd", strVal),
    always("et", "et", intVal),
    always("hub_bore", "hubBore", floatVal),
    always("wheel_type", "wheelType", strVal),
  ],
  segmentOrder: wheelSegmentOrder,
  extraQueryFields: wheelExtraQueryFields,
};

// ---------------------------------------------------------------------------
// Обёртки (обратная совместимость — потребители не меняют импорты)
// ---------------------------------------------------------------------------

export function parseCatalogParams(
  params: { params?: string[] },
  searchParams: Record<string, string | string[] | undefined>,
): FilterState {
  return parseUrl(TIRES_CONFIG, params, searchParams);
}

export function parseWheelsParams(
  params: { params?: string[] },
  searchParams: Record<string, string | string[] | undefined>,
): FilterState {
  return parseUrl(WHEELS_CONFIG, params, searchParams);
}

export function buildCatalogUrl(filter: FilterState, cityValue?: string | null): string {
  return buildUrl(TIRES_CONFIG, filter, cityValue);
}

export function buildWheelsUrl(filter: FilterState, cityValue?: string | null): string {
  return buildUrl(WHEELS_CONFIG, filter, cityValue);
}

/**
 * Query-строка фильтров (вкладки «По автомобилю»).
 * includeParams=true — включает и параметры шин (season/brand/width/profile/diameter):
 * состояние фильтра параметров сохраняется в URL и восстанавливается при возврате
 * на «По параметрам».
 */
export function buildQueryString(
  filter: FilterState,
  includeParams = false,
  cityValue?: string | null,
): string {
  return buildQueryPortion(TIRES_CONFIG, filter, includeParams, cityValue);
}
