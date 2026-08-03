// Единый источник данных (03.08.2026)
// Сейчас: setTimeout + src/data/*. При API: замена на fetch.
// Используется и Server Components (await), и Client Components (React Query).
import type { PaginatedResult } from "./types";
import type { SectionProduct, NewsItem } from "@/features/home/types";
import type { CartItem } from "@/features/cart/types";

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
} from "@/data/geo";
import type { GeoRegion, GeoCity } from "@/data/geo";

export interface GeoData {
  regions: GeoRegion[];
  cities: GeoCity[];
  defaultCity: string;
}

export async function getGeo(): Promise<GeoData> {
  return delay(50, {
    regions: GEO_REGIONS,
    cities: GEO_CITIES,
    defaultCity: DEFAULT_CITY,
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
// Catalog (фаза 2 — заглушки)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getCatalogProducts(
  _filter: Record<string, unknown>,
): Promise<PaginatedResult<unknown>> {
  throw new Error("getCatalogProducts — фаза 2");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getModel(_slug: string): Promise<unknown> {
  throw new Error("getModel — фаза 2");
}

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
