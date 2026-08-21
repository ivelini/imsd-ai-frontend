// Catalog: стартовая страница /catalog, каталог шин и дисков, авто-каскад
import type { PaginatedResult } from "./types";
import { apiBase, delay } from "./base";
import { CATALOG_START } from "@/data/catalogStart";
import type { CatalogStartData } from "@/features/catalog/types";
import {
  getTireModel,
  AUTO_BRANDS,
  AUTO_YEARS,
  generateModifications,
  getAutoResult,
  getCarBlock,
} from "@/data/catalog";
import type {
  AutoBrandData,
  AutoModData,
  AutoResultProduct,
  CarBlockData,
} from "@/data/catalog";
import type {
  FilterOptions,
  FilterState,
  TireFilterValuesDto,
  TireListItemDto,
  TireListDto,
  TireListResult,
  TireProduct,
} from "@/features/catalog/types";
import {
  getWheelsFilterOptions,
  getWheelsProductsMock,
  getWheelsAutoResult,
  getWheelsCarBlock,
  generateWheelMods,
  WHEEL_AUTO_BRANDS,
  WHEEL_AUTO_YEARS,
} from "@/data/wheels";
import type { WheelAutoBrand, WheelAutoResultItem, WheelCarBlockData } from "@/data/wheels";
import type { WheelProduct } from "@/features/catalog/types";

export type { CatalogStartData };
export type { AutoBrandData, AutoModData, AutoResultProduct, CarBlockData, FilterOptions, TireProduct };
export type { WheelAutoBrand, WheelAutoResultItem, WheelCarBlockData, WheelProduct };
export { getTireModel, getAutoResult, getCarBlock };
export { getWheelsCarBlock };

export async function getCatalogStart(): Promise<CatalogStartData> {
  return delay(30, CATALOG_START);
}

/**
 * Адаптер DTO GET /api/reference/filter/tire → FilterOptions.
 * Целевой контракт: brand/country — slug, diameter/width/profile — префиксные
 * размеры ("r15", "w185", "p60") — 1:1 с сегментами URL.
 */
export function toFilterOptions(data: TireFilterValuesDto): FilterOptions {
  // value в нижний регистр: бэк отдаёт "r13C" — в URL сегменты строчные (r13c)
  const opts = (items: TireFilterValuesDto["width"]): FilterOptions["seasons"] =>
    items.map((o) => ({ label: String(o.label), value: String(o.value).toLowerCase() }));

  // Размеры с префиксом; голое число (переходный период бэка) — префикс добавляется
  const sizeOpts = (items: TireFilterValuesDto["width"], prefix: string): FilterOptions["widths"] =>
    items.map((o) => {
      const value = String(o.value).toLowerCase();
      return { label: String(o.label), value: value.startsWith(prefix) ? value : `${prefix}${value}` };
    });

  return {
    seasons: opts(data.season),
    brands: opts(data.brand),
    widths: sizeOpts(data.width, "w"),
    profiles: sizeOpts(data.profile, "p"),
    diameters: opts(data.diameter),
    studded: opts(data.studded),
    pcds: [], // диски — отдельный мок (эндпоинта нет)
    ets: [],
    hubBores: [],
    wheelTypes: [],
    countries: opts(data.country),
    delivery: opts(data.delivery),
    priceMin: data.price.min,
    priceMax: data.price.max,
  };
}

export async function getCatalogFilters(): Promise<FilterOptions> {
  const res = await fetch(`${apiBase()}/reference/filter/tire`);
  if (!res.ok) {
    throw new Error(`getCatalogFilters: HTTP ${res.status}`);
  }
  const body = (await res.json()) as { data: TireFilterValuesDto };
  return toFilterOptions(body.data);
}

// --- Живой листинг GET /api/catalog/tires (контракт public-api.json, 21.08.2026) ---

/** Заглушка карточки без изображения (как в моке). */
const PRODUCT_PLACEHOLDER = "/assets/img/wheel-product.png";
/** Элементов на странице каталога (допустимо 10–100, бэк по умолчанию 48). */
const CATALOG_PER_PAGE = 12;

/** Фильтр каталога → query листинга. Город — слагом city= (резолвит бэк). */
export function toTireListQuery(filter: FilterState, city?: string): string {
  const params = new URLSearchParams();
  if (filter.width !== undefined) params.append("width[]", String(filter.width));
  if (filter.profile !== undefined) params.append("profile[]", String(filter.profile));
  if (filter.diameter !== undefined) params.append("diameter[]", String(filter.diameter));
  if (filter.season) params.append("season", filter.season);
  if (filter.studded) params.append("studded", filter.studded);
  if (filter.brand) params.append("brand", filter.brand);
  if (filter.country) params.append("country", filter.country);
  filter.delivery?.forEach((d) => params.append("delivery[]", d));
  if (filter.priceMin !== undefined) params.append("price_min", String(filter.priceMin));
  if (filter.priceMax !== undefined) params.append("price_max", String(filter.priceMax));
  if (filter.page !== undefined) params.append("page", String(filter.page));
  if (city) params.append("city", city);
  // URLSearchParams кодирует [] в %5B%5D — бэк ждёт каноничный вид width[]= (PHP parse_str)
  return params.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");
}

/** Диаметр DTO → число: "17" → 17, "13c" → 13 (C-размер), null → 0. */
function parseDiameter(diameter: string | null): number {
  const match = /^(\d+)(c)?$/.exec(diameter ?? "");
  return match ? Number(match[1]) : 0;
}

/** DTO листинга → TireProduct (поля, которых нет на бэке, — пустые дефолты). */
export function toTireProduct(dto: TireListItemDto): TireProduct {
  const sizeTitle = [dto.width, dto.profile].filter(Boolean).join("/");
  return {
    id: String(dto.id),
    category: "tires",
    slug: dto.slug,
    season: dto.season?.value ?? "all-season",
    seasonLabel: dto.season?.label,
    isStudded: dto.is_studded,
    deliveryMin: dto.delivery_min,
    deliveryMax: dto.delivery_max,
    brandId: String(dto.brand.id),
    brandName: dto.brand.name,
    modelSlug: dto.model?.slug ?? "",
    modelName: dto.model?.name ?? dto.name,
    width: dto.width ?? 0,
    profile: dto.profile ?? 0,
    diameter: parseDiameter(dto.diameter),
    price: dto.price ?? undefined,
    code: "",
    country: "",
    countryLabel: "",
    year: "",
    quantity: 0,
    image: dto.images[0]?.url ?? PRODUCT_PLACEHOLDER,
    title: dto.name,
    sizeSlug: dto.slug,
    sizeTitle: `${sizeTitle} R${dto.diameter ?? ""}`,
    // бэк шлёт noiseEmission строкой — в карточке число dB
    euLabel: dto.euro_label
      ? { ...dto.euro_label, noiseEmission: Number(dto.euro_label.noiseEmission) }
      : undefined,
    parameters: [],
    loadIndex: "",
    speedRating: "",
    tireType: "",
  };
}

export async function getCatalogProducts(
  filter: FilterState,
  city?: string,
): Promise<TireListResult> {
  const query = toTireListQuery(filter, city);
  const url = `${apiBase()}/catalog/tires?${query ? `${query}&` : ""}per_page=${CATALOG_PER_PAGE}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`getCatalogProducts: HTTP ${res.status}`);
  }
  const body = (await res.json()) as TireListDto;
  return {
    items: body.data.map(toTireProduct),
    total: body.meta.total,
    page: body.meta.current_page,
    perPage: body.meta.per_page,
    seo: body.meta.seo ?? null,
  };
}

export async function getAutoBrands(): Promise<AutoBrandData[]> {
  return delay(30, AUTO_BRANDS);
}

export async function getAutoModels(
  brand: string,
): Promise<{ slug: string; name: string }[]> {
  const brandData = AUTO_BRANDS.find((b) => b.id === brand);
  return delay(30, brandData?.models ?? []);
}

export async function getAutoYears(
  _brand: string,
  _model: string,
): Promise<number[]> {
  return delay(30, AUTO_YEARS);
}

export async function getAutoModifications(
  brand: string,
  model: string,
  year: number,
): Promise<AutoModData[]> {
  return delay(30, generateModifications(brand, model, year));
}

export async function fetchAutoResult(
  brand: string,
  model: string,
  year: number,
  mod: string,
  filter?: FilterState,
): Promise<AutoResultProduct[] | null> {
  return delay(50, getAutoResult(brand, model, year, mod, filter));
}

// --- Диски ---

export async function getWheelsFilters(): Promise<FilterOptions> {
  return delay(50, getWheelsFilterOptions());
}

export async function getWheelsProducts(
  filter: FilterState,
  city?: string,
): Promise<PaginatedResult<WheelProduct>> {
  // city — контекст запроса; при подключении API уходит в query fetch-запроса
  return delay(50, getWheelsProductsMock(filter, city));
}

export async function getWheelsAutoBrands(): Promise<WheelAutoBrand[]> {
  return delay(30, WHEEL_AUTO_BRANDS);
}

export async function getWheelsAutoModels(
  brand: string,
): Promise<{ slug: string; name: string }[]> {
  const brandData = WHEEL_AUTO_BRANDS.find((b) => b.id === brand);
  return delay(30, brandData?.models ?? []);
}

export async function getWheelsAutoYears(
  _brand: string,
  _model: string,
): Promise<number[]> {
  return delay(30, WHEEL_AUTO_YEARS);
}

export async function getWheelsAutoModifications(
  brand: string,
  model: string,
  year: number,
): Promise<{ id: string; name: string }[]> {
  const mods = generateWheelMods(brand, model, year);
  return delay(30, mods.map((m) => ({ id: m.id, name: m.name })));
}

export async function fetchWheelsAutoResult(
  brand: string,
  model: string,
  year: number,
  mod: string,
  filter?: FilterState,
): Promise<WheelAutoResultItem[] | null> {
  return delay(50, getWheelsAutoResult(brand, model, year, mod, filter));
}
