// Единый источник данных (03.08.2026)
// Сейчас: setTimeout + src/data/*. При API: замена на fetch.
// Используется и Server Components (await), и Client Components (React Query).
import type { PaginatedResult } from "./types";
import type { SectionProduct, NewsItem } from "@/features/home/types";
import type { CartItem } from "@/features/cart/types";

// ---------------------------------------------------------------------------
// База API (зарезервировано для бэкенда)
// При подключении Laravel: NEXT_PUBLIC_API_URL в .env.local, запросы через
// rewrites() в next.config.ts (фронт ходит на свой домен /api/*, Next проксирует
// на бэк — CORS не нужен). Мок-слой константу не использует.
// ---------------------------------------------------------------------------
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

// ---------------------------------------------------------------------------
// Утилита — эмуляция сетевой задержки
// ---------------------------------------------------------------------------
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// ---------------------------------------------------------------------------
// Layout: навигация, подвал, меню, бенефиты
// ---------------------------------------------------------------------------
import {
  NAV_LINKS,
  PHONE,
  CATALOG_MENU_GROUPS,
  FOOTER_GROUPS,
  SOCIALS,
  MENU_SOCIALS,
  BENEFITS,
  FOOTER_COPYRIGHT,
} from "@/data/nav";
import type { NavLink, MenuGroup, Benefit } from "@/data/nav";

export interface NavData {
  phone: typeof PHONE;
  navLinks: NavLink[];
  catalogMenuGroups: MenuGroup[];
  footerGroups: NavLink[][];
  socials: readonly string[];
  menuSocials: readonly string[];
  benefits: Benefit[];
  footerCopyright: string;
}

export async function getNav(): Promise<NavData> {
  return delay(50, {
    phone: PHONE,
    navLinks: NAV_LINKS,
    catalogMenuGroups: CATALOG_MENU_GROUPS,
    footerGroups: FOOTER_GROUPS,
    socials: SOCIALS,
    menuSocials: MENU_SOCIALS,
    benefits: BENEFITS,
    footerCopyright: FOOTER_COPYRIGHT,
  });
}

// ---------------------------------------------------------------------------
// Layout: гео (города, регионы)
// ---------------------------------------------------------------------------
import {
  GEO_REGIONS,
  GEO_CITIES,
  DEFAULT_CITY,
  DEFAULT_CITY_VALUE,
} from "@/data/geo";
import type { GeoRegion, GeoCity } from "@/data/geo";

export interface GeoData {
  regions: GeoRegion[];
  cities: GeoCity[];
  defaultCity: string;
  defaultCityValue: string;
}

export async function getGeo(): Promise<GeoData> {
  return delay(50, {
    regions: GEO_REGIONS,
    cities: GEO_CITIES,
    defaultCity: DEFAULT_CITY,
    defaultCityValue: DEFAULT_CITY_VALUE,
  });
}

// ---------------------------------------------------------------------------
// Home: товары, новости, о компании
// ---------------------------------------------------------------------------
import {
  WHEELS_PRODUCTS,
  DISK_PRODUCTS,
  NEWS_ITEMS,
  ABOUT_TEXT,
} from "@/data/products";

export async function getHomeProducts(
  category: "wheels" | "disks",
): Promise<SectionProduct[]> {
  return delay(50, category === "wheels" ? WHEELS_PRODUCTS : DISK_PRODUCTS);
}

export async function getNews(): Promise<NewsItem[]> {
  return delay(50, NEWS_ITEMS);
}

export async function getAboutText(): Promise<string> {
  return delay(50, ABOUT_TEXT);
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------
import {
  ALL_PRODUCTS,
  getFilterOptions,
  getTireModel,
  AUTO_BRANDS,
  AUTO_YEARS,
  generateModifications,
  getAutoResult,
  getCarBlock,
  SEO_CONTENT,
} from "@/data/catalog";
import type {
  AutoBrandData,
  AutoModData,
  AutoResultProduct,
  CarBlockData,
} from "@/data/catalog";
import type { FilterOptions, FilterState, TireProduct } from "@/features/catalog/types";

export { getTireModel, getAutoResult, getCarBlock, SEO_CONTENT };
export type { AutoBrandData, AutoModData, AutoResultProduct, CarBlockData, FilterOptions, TireProduct };

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
): Promise<AutoResultProduct[] | null> {
  return delay(50, getAutoResult(brand, model, year, mod));
}

// ---------------------------------------------------------------------------
// Catalog: диски
// ---------------------------------------------------------------------------
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

export type { WheelAutoBrand, WheelAutoResultItem, WheelCarBlockData, WheelProduct };

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
): Promise<WheelAutoResultItem[] | null> {
  return delay(50, getWheelsAutoResult(brand, model, year, mod));
}

export { getWheelsCarBlock };

// ---------------------------------------------------------------------------
// Cart — мок-хранилище в памяти (имитация серверного состояния)
// ---------------------------------------------------------------------------
const cartStore: CartItem[] = [
  {
    id: "cart-demo-1",
    name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
    price: 10100,
    quantity: 4,
    image: "/assets/img/wheel-product.png",
  },
];

export async function getCartItems(): Promise<CartItem[]> {
  // Пробуем восстановить из localStorage (если доступен)
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cartStore.length = 0;
          cartStore.push(...parsed);
        }
      } catch {
        /* пусто */
      }
    }
  }
  return delay(30, [...cartStore]);
}

export interface CartAddPayload {
  id: string;
  name: string;
  price: number;
  image: string;
}

export async function addToCart(
  item: CartAddPayload,
  quantity = 1,
): Promise<CartItem> {
  const existing = cartStore.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartStore.push({ ...item, quantity });
  }
  // Персист
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(30, cartStore.find((i) => i.id === item.id)!);
}

export async function updateCartItem(
  id: string,
  delta: number,
): Promise<void> {
  const item = cartStore.find((i) => i.id === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(30, undefined);
}

export async function removeFromCart(id: string): Promise<void> {
  const idx = cartStore.findIndex((i) => i.id === id);
  if (idx !== -1) cartStore.splice(idx, 1);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(30, undefined);
}
