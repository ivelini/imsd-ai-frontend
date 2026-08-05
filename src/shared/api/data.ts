// Единый источник данных (03.08.2026)
// Сейчас: setTimeout + src/data/*. При API: замена на fetch.
// Используется и Server Components (await), и Client Components (React Query).
import type { PaginatedResult } from "./types";
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
  PHONE,
  CATALOG_MENU_GROUPS,
  SOCIALS,
  MENU_SOCIALS,
  FOOTER_COPYRIGHT,
} from "@/data/nav";
import type { MenuGroup } from "@/data/nav";
import { HOME_DATA } from "@/data/products";
import { SERVICE_PAGES } from "@/data/servicePages";
import type { ServicePageLink, ServicePage } from "@/data/servicePages";

export type { ServicePageLink, ServicePage };

export interface NavData {
  phone: typeof PHONE;
  /** Шапка (navigation-block): items блока type=header из /api/service_pages */
  headerLinks: ServicePageLink[];
  /** Футер: items блока type=footer из /api/service_pages */
  footerLinks: ServicePageLink[];
  catalogMenuGroups: MenuGroup[];
  socials: readonly string[];
  menuSocials: readonly string[];
  /** Плашки .benefits — attention_blocks из /api/service-page/main */
  attentionBlocks: AttentionBlock[];
  footerCopyright: string;
}

export async function getNav(): Promise<NavData> {
  const headerLinks =
    SERVICE_PAGES.find((b) => b.type === "header")?.items ?? [];
  const footerLinks =
    SERVICE_PAGES.find((b) => b.type === "footer")?.items ?? [];
  return delay(50, {
    phone: PHONE,
    headerLinks,
    footerLinks,
    catalogMenuGroups: CATALOG_MENU_GROUPS,
    socials: SOCIALS,
    menuSocials: MENU_SOCIALS,
    attentionBlocks: HOME_DATA.attention_blocks,
    footerCopyright: FOOTER_COPYRIGHT,
  });
}

// ---------------------------------------------------------------------------
// Service pages: GET /api/service_page/<slug>
// ---------------------------------------------------------------------------
import { SERVICE_PAGE_CONTENT } from "@/data/servicePages";

export async function getServicePage(
  slug: string,
): Promise<ServicePage | null> {
  const page = SERVICE_PAGE_CONTENT[slug];
  return delay(30, page ? { slug, ...page } : null);
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
// Home: GET /api/service-page/main (мок) — attention_blocks, slider, news,
// description, seo. Структура 1-в-1 с ответом бэка.
// ---------------------------------------------------------------------------
import type { HomeData, AttentionBlock } from "@/features/home/types";

export type { HomeData, AttentionBlock };

export async function getHomeData(): Promise<HomeData> {
  return delay(50, HOME_DATA);
}

/** attention_blocks — нужны лейауту (плашки .benefits на всех страницах) */
export async function getAttentionBlocks(): Promise<AttentionBlock[]> {
  return delay(30, HOME_DATA.attention_blocks);
}

// ---------------------------------------------------------------------------
// Catalog: стартовая страница /catalog (карточки + бренды)
// ---------------------------------------------------------------------------
import { CATALOG_START } from "@/data/catalogStart";
import type { CatalogStartData } from "@/data/catalogStart";

export type { CatalogStartData };

export async function getCatalogStart(): Promise<CatalogStartData> {
  return delay(30, CATALOG_START);
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
import { CART_TOTAL_BENEFITS } from "@/data/cart";

export { getTireModel, getAutoResult, getCarBlock, SEO_CONTENT };
export type { AutoBrandData, AutoModData, AutoResultProduct, CarBlockData, FilterOptions, TireProduct };

// ---------------------------------------------------------------------------
// Product (страница товара)
// ---------------------------------------------------------------------------
import type { ProductDetailData } from "@/features/product/types";
import { SEASON_LABELS } from "@/data/catalog";

export type { ProductDetailData };

export async function getProduct(
  modelSlug: string,
  sizeSlug: string,
): Promise<ProductDetailData | null> {
  const product = ALL_PRODUCTS.find(
    (p) => p.modelSlug === modelSlug && p.sizeSlug === sizeSlug,
  );
  if (!product) return null;

  const seasonLabel = SEASON_LABELS[product.season] ?? product.season;
  const loadSpeedLabel = `${product.loadIndex}${product.speedRating}`;
  const spikesLabel = product.season === "winter" ? "Да" : "Нет";
  const runFlatLabel = ["michelin", "pirelli"].includes(product.brandId) ? "Да" : "Нет";
  const productionCountryLabel = product.countryLabel;

  const quantityOptions = [1, 2, 3, 4].map((q) => ({
    value: q,
    label: `${(product.price * q).toLocaleString("ru-RU")} ₽ - ${q} шт.`,
  }));

  return delay(50, {
    ...product,
    images: [
      "/assets/img/large.png",
      "/assets/img/disk-1.png",
      "/assets/img/wheel-product.png",
      "/assets/img/disk-2.png",
      "/assets/img/large.png",
      "/assets/img/disk-1.png",
      "/assets/img/wheel-product.png",
      "/assets/img/disk-2.png",
    ],
    seasonLabel,
    loadSpeedLabel,
    spikesLabel,
    runFlatLabel,
    productionCountryLabel,
    quantityOptions,
    pickupDate: "8 авг (сб)",
    deliveryLabel: "бесплатно",
    storeAddress: "Челябинск - Свердловский тракт 3Н (Автоальянс)",
    storeHours: "Рабочие дни: 09:00-19:00 / Выходные: 09:00-17:00",
    descriptionHtml: `<p>${product.modelName} — ${
      product.season === "summer" ? "летняя" : product.season === "winter" ? "зимняя" : "всесезонная"
    } шина, разработанная для обеспечения высокого уровня безопасности, комфорта и долговечности.</p>
<p>Шина ${product.modelName} — это выбор водителей, которые ценят уверенное сцепление на мокрой и сухой дороге, предсказуемое поведение автомобиля в поворотах и низкий уровень шума при движении. Технология изготовления протектора гарантирует равномерный износ и высокую ходимость.</p>
<p>Инновационный состав резиновой смеси позволяет шине сохранять эластичность при низких температурах, обеспечивая стабильное пятно контакта и короткий тормозной путь. Ламелизация блоков протектора эффективно отводит воду и снежную шугу из зоны контакта, снижая риск аквапланирования.</p>
<p>Дизайн протектора оптимизирован для максимальной курсовой устойчивости и минимального сопротивления качению, что положительно влияет на расход топлива. Усиленная конструкция боковины повышает стойкость к механическим повреждениям и продлевает срок службы шины.</p>
<p>Шины ${product.modelName} производятся на современном оборудовании с многоступенчатым контролем качества. Каждая шина проходит проверку на геометрическую точность, балансировку и соответствие заявленным характеристикам перед отгрузкой.</p>`,
    availabilityText:
      "Информация о наличии продукта обновляется в реальном времени. На складе в Челябинске поддерживается неснижаемый остаток наиболее востребованных типоразмеров. Точное количество можно уточнить у менеджера по телефону.",
    deliveryText:
      "Доставка осуществляется по всей России. Самовывоз со склада в Челябинске — бесплатно. Доставка до ПВЗ СДЭК, Boxberry, Почта России — от 300₽. Курьерская доставка по Челябинску — 400₽. Отправка транспортной компанией в другие регионы — от 600₽.",
    warrantyText:
      "Гарантия на все шины интернет-магазина «Автоальянс» составляет 12 месяцев с даты покупки. Гарантийный срок службы шин — 5 лет с даты изготовления. Гарантия распространяется на производственные дефекты. Гарантия не распространяется на механические повреждения, возникшие в результате неправильной эксплуатации.",
    reviewCount: 25,
    parameters: [
      { name: "Код товара:", value: product.code },
      {
        name: "Производитель:",
        value: product.brandName,
        badge: true,
        description: {
          title: product.brandName,
          text: `${product.brandName} — один из ведущих производителей автомобильных шин. Компания основана в середине XX века и за прошедшие десятилетия зарекомендовала себя как надёжный поставщик качественной резины для легковых, внедорожных и коммерческих автомобилей. Продукция ${product.brandName} проходит строгий контроль качества на всех этапах производства и соответствует международным стандартам безопасности. Шины ${product.brandName} выбирают миллионы водителей по всему миру.`,
        },
      },
      { name: "Ширина профиля:", value: String(product.width) },
      { name: "Высота профиля:", value: String(product.profile) },
      { name: "Посадочный диаметр:", value: String(product.diameter) },
      { name: "Сезонность:", value: seasonLabel },
      { name: "Страна бренда:", value: product.countryLabel },
      { name: "Индекс скорости и нагрузки:", value: loadSpeedLabel },
      {
        name: "Страна производства:",
        value: productionCountryLabel,
        badge: true,
        description: {
          title: `Страна производства — ${product.countryLabel}`,
          text: `Производство шин осуществляется на современных заводах в ${product.countryLabel === "Россия" ? "России" : product.countryLabel + "и"}. Производственные мощности оснащены оборудованием последнего поколения, а технологический процесс соответствует мировым стандартам шинной промышленности. Локализация производства позволяет оптимизировать логистические издержки и предложить покупателям конкурентоспособные цены при сохранении высокого качества продукции.`,
        },
      },
      {
        name: "Год выпуска:",
        value: product.year,
        badge: true,
        description: {
          title: `Год выпуска — ${product.year}`,
          text: `Шины выпущены в ${product.year.includes("-") ? "период " + product.year : product.year + " году"}. Срок службы автомобильных шин составляет 5 лет с даты изготовления при соблюдении правил хранения и эксплуатации. Рекомендуется обращать внимание на дату выпуска при покупке — свежие шины обеспечивают максимальный уровень безопасности и комфорта. Хранение шин на складе осуществляется в соответствии с требованиями ГОСТ — в сухом проветриваемом помещении, без воздействия прямых солнечных лучей.`,
        },
      },
      { name: "Шипы:", value: spikesLabel },
      { name: "Run flat:", value: runFlatLabel },
    ],
  });
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
  filter?: FilterState,
): Promise<WheelAutoResultItem[] | null> {
  return delay(50, getWheelsAutoResult(brand, model, year, mod, filter));
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
    code: "АА-00075632",
    availability: ">12 шт.",
  },
];

export async function getCartTotalInfo(): Promise<{ benefits: string[] }> {
  return delay(30, { benefits: [...CART_TOTAL_BENEFITS] });
}

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
  code?: string;
  availability?: string;
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

// ---------------------------------------------------------------------------
// Checkout: опции оформления + мок-создание заказа
// ---------------------------------------------------------------------------
import {
  CHECKOUT_DELIVERY,
  CHECKOUT_PAYMENT,
  CHECKOUT_AGREEMENT,
} from "@/data/checkout";
import type { DeliveryMethod, PaymentMethod } from "@/data/checkout";

export interface CheckoutOptions {
  delivery: DeliveryMethod[];
  payment: PaymentMethod[];
  agreement: string;
}

export async function getCheckoutOptions(): Promise<CheckoutOptions> {
  return delay(30, {
    delivery: CHECKOUT_DELIVERY,
    payment: CHECKOUT_PAYMENT,
    agreement: CHECKOUT_AGREEMENT,
  });
}

/** Заказ — снимок корзины и данных формы (фаза 4, мок-хранилище в localStorage) */
export interface Order {
  id: string;
  /** Человекочитаемый номер заказа, напр. «А-00001» */
  number: string;
  status: string;
  items: CartItem[];
  total: number;
  recipient: {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
  };
  /** Готовые строки от «бэка» (api-contract): label вместо id */
  deliveryLabel: string;
  deliveryAddress: string;
  paymentLabel: string;
}

export interface CreateOrderPayload {
  recipient: Order["recipient"];
  deliveryMethodId: string;
  deliveryAddress: string;
  paymentMethodId: string;
}

// Мок-хранилище заказов в localStorage (createOrder выполняется на клиенте —
// заказ должен пережить редирект на /order/[id], как корзина через «cart»)
const ORDERS_KEY = "orders";

function loadOrders(): Order[] {
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (stored) return JSON.parse(stored) as Order[];
    } catch {
      /* пусто */
    }
  }
  return [];
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const items = [...cartStore];
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const orders = loadOrders();
  const delivery = CHECKOUT_DELIVERY.find(
    (d) => d.id === payload.deliveryMethodId,
  );
  const payment = CHECKOUT_PAYMENT.find(
    (p) => p.id === payload.paymentMethodId,
  );
  const order: Order = {
    id: `order-${orders.length + 1}`,
    number: `А-${String(orders.length + 1).padStart(5, "0")}`,
    status: "Принят в обработку",
    items,
    total,
    recipient: payload.recipient,
    deliveryLabel: delivery?.title ?? payload.deliveryMethodId,
    deliveryAddress: payload.deliveryAddress,
    paymentLabel: payment?.label ?? payload.paymentMethodId,
  };
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  // Оформление завершено — корзина пуста (персист как в addToCart)
  cartStore.length = 0;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(50, order);
}

export async function getOrder(id: string): Promise<Order | null> {
  return delay(30, loadOrders().find((o) => o.id === id) ?? null);
}

export async function getOrderByNumber(
  number: string,
): Promise<Order | null> {
  const q = number.trim().toLowerCase();
  return delay(30, loadOrders().find((o) => o.number.toLowerCase() === q) ?? null);
}

// ---------------------------------------------------------------------------
// Auth: мок-сессия в localStorage (при API — Laravel Sanctum и т.п.)
// ---------------------------------------------------------------------------
export interface Session {
  /** Имя пользователя (после входа по логину — сам логин) */
  name: string;
  /** Телефон или email */
  login: string;
}

const SESSION_KEY = "session";

export async function getSession(): Promise<Session | null> {
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) return JSON.parse(stored) as Session;
    } catch {
      /* пусто */
    }
  }
  return null;
}

export async function loginMock(
  login: string,
  _password: string,
  _remember: boolean,
): Promise<Session> {
  // Мок принимает любые данные — имитация успешного входа
  const session: Session = { name: login, login };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return delay(30, session);
}

export async function registerMock(
  name: string,
  login: string,
  _password: string,
): Promise<Session> {
  const session: Session = { name, login };
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return delay(30, session);
}

export async function logoutMock(): Promise<void> {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
  return delay(30, undefined);
}

// ---------------------------------------------------------------------------
// Articles: статьи (список, одна, похожие)
// ---------------------------------------------------------------------------
import { ARTICLES } from "@/data/articles";
import type { Article } from "@/data/articles";

export type { Article };

export async function getArticles(): Promise<Article[]> {
  return delay(30, [...ARTICLES]);
}

export async function getArticle(slug: string): Promise<Article | null> {
  return delay(30, ARTICLES.find((a) => a.slug === slug) ?? null);
}

export async function getRelatedArticles(
  slug: string,
): Promise<Article[]> {
  const related = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);
  return delay(30, related);
}

