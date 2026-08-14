// Catalog: стартовая страница /catalog, каталог шин и дисков, авто-каскад
import type { PaginatedResult } from "./types";
import { apiBase, delay } from "./base";
import { CATALOG_START } from "@/data/catalogStart";
import type { CatalogStartData } from "@/features/catalog/types";
import {
  getCatalogProductsMock,
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
 * Целевой контракт: brand/country — slug, diameter — r-значения (исправляется
 * на бэке). width/profile — int → строка (совпадает с сегментом URL без потерь).
 */
export function toFilterOptions(data: TireFilterValuesDto): FilterOptions {
  // value в нижний регистр: бэк отдаёт "r13C" — в URL сегменты строчные (r13c)
  const opts = (items: TireFilterValuesDto["width"]): FilterOptions["seasons"] =>
    items.map((o) => ({ label: String(o.label), value: String(o.value).toLowerCase() }));

  return {
    seasons: opts(data.season),
    brands: opts(data.brand),
    widths: opts(data.width),
    profiles: opts(data.profile),
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

export async function getCatalogProducts(
  filter: FilterState,
  city?: string,
): Promise<PaginatedResult<TireProduct>> {
  // city — контекст запроса; при подключении API уходит в query fetch-запроса
  return delay(50, getCatalogProductsMock(filter, city));
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
