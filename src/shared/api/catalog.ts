// Catalog: стартовая страница /catalog, каталог шин и дисков, авто-каскад
import type { PaginatedResult } from "./types";
import { delay } from "./base";
import { CATALOG_START } from "@/data/catalogStart";
import type { CatalogStartData } from "@/features/catalog/types";
import {
  ALL_PRODUCTS,
  getFilterOptions,
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
import type { FilterOptions, FilterState, TireProduct } from "@/features/catalog/types";
import {
  ALL_WHEELS,
  getWheelsFilterOptions,
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

const PER_PAGE = 12;

export async function getCatalogFilters(): Promise<FilterOptions> {
  return delay(50, getFilterOptions());
}

export async function getCatalogProducts(
  filter: FilterState,
): Promise<PaginatedResult<TireProduct>> {
  let items = [...ALL_PRODUCTS];

  if (filter.season) items = items.filter((p) => p.season === filter.season);
  if (filter.brand) items = items.filter((p) => p.brandId === filter.brand);
  if (filter.width) items = items.filter((p) => p.width === filter.width);
  if (filter.profile) items = items.filter((p) => p.profile === filter.profile);
  if (filter.diameter) items = items.filter((p) => p.diameter === filter.diameter);
  if (filter.priceMin != null) items = items.filter((p) => p.price >= filter.priceMin!);
  if (filter.priceMax != null) items = items.filter((p) => p.price <= filter.priceMax!);
  if (filter.country) items = items.filter((p) => p.country === filter.country);
  if (filter.tireType) items = items.filter((p) => p.tireType === filter.tireType);
  if (filter.delivery && filter.delivery.length > 0) {
    // В моках все товары доступны — фильтр delivery не сужает
  }

  const total = items.length;
  const page = filter.page ?? 1;
  const start = (page - 1) * PER_PAGE;
  const paged = items.slice(start, start + PER_PAGE);

  return delay(50, { items: paged, total, page, perPage: PER_PAGE });
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
): Promise<PaginatedResult<WheelProduct>> {
  let items = [...ALL_WHEELS];

  if (filter.brand) items = items.filter((p) => p.brandId === filter.brand);
  if (filter.diameter) items = items.filter((p) => p.diameter === filter.diameter);
  if (filter.width) items = items.filter((p) => p.width === filter.width);
  if (filter.pcd) items = items.filter((p) => p.pcd === filter.pcd);
  if (filter.et) items = items.filter((p) => p.et === filter.et);
  if (filter.hubBore) items = items.filter((p) => p.hubBore === filter.hubBore);
  if (filter.wheelType) items = items.filter((p) => p.wheelType === filter.wheelType);
  if (filter.priceMin != null) items = items.filter((p) => p.price >= filter.priceMin!);
  if (filter.priceMax != null) items = items.filter((p) => p.price <= filter.priceMax!);
  if (filter.country) items = items.filter((p) => p.country === filter.country);
  if (filter.delivery && filter.delivery.length > 0) {
    // В моках все товары доступны — фильтр delivery не сужает
  }

  const total = items.length;
  const page = filter.page ?? 1;
  const start = (page - 1) * PER_PAGE;
  const paged = items.slice(start, start + PER_PAGE);

  return delay(50, { items: paged, total, page, perPage: PER_PAGE });
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
