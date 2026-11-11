// Catalog: стартовая страница /catalog, каталог шин и дисков, авто-каскад
import { apiBase, cityQuery } from "./base";
import { toOriginParam } from "./origin";
import { PRODUCT_PLACEHOLDER } from "@/shared/lib/productImage";
import { appendCityParam } from "@/shared/lib/cityUrl";
import { decimal } from "@/shared/lib/decimal";
import { toArticleBlock } from "@/shared/lib/articleBlock";
import type {
  BrandLink,
  CatalogStartCard,
  CatalogStartData,
  FilterOptions,
  FilterState,
  ModelCardData,
  ModelCardDto,
  ModelCardResponseDto,
  ProductBase,
  TireFilterValuesDto,
  TireListItemDto,
  TireListDto,
  TireListResult,
  TireListSeo,
  TireProduct,
  WheelFilterValuesDto,
  WheelListItemDto,
  WheelListDto,
  WheelListResult,
  WheelProduct,
} from "@/features/catalog/types";
import type { ProductParam } from "@/shared/types/product";
import type { ArticleBlockData } from "@/shared/types/articleBlock";

export type { CatalogStartData };
export type { FilterOptions, TireProduct };
export type { WheelProduct };

/**
 * Карточки стартовой («по параметрам»/«по автомобилю») — статика фронта
 * (макет .template/catalog/start.html); бэк-эндпоинта для них нет.
 */
const CATALOG_START_CARDS: CatalogStartCard[] = [
  {
    id: "tires-params",
    icon: "tire",
    title: "Шины по параметрам",
    sub: "Ширина, профиль, диаметр, сезонность, тип",
    link: "/catalog/tires",
  },
  {
    id: "tires-auto",
    icon: "tire",
    title: "Шины по автомобилю",
    sub: "Марка, модель, год выпуска, модификация",
    link: "/catalog/tires/auto",
  },
  {
    id: "wheels-params",
    icon: "disk",
    title: "Диски по параметрам",
    sub: "Ширина, диаметр, PCD, вылет (ET), ступица",
    link: "/catalog/wheels",
  },
  {
    id: "wheels-auto",
    icon: "disk",
    title: "Диски по автомобилю",
    sub: "Марка, модель, год выпуска, модификация",
    link: "/catalog/wheels/auto",
  },
];

/** Ссылки брендов стартовой: value фасета — слаг в URL каталога, label — от бэка. */
function toBrandLinks(
  brands: FilterOptions["brands"],
  base: "/catalog/tires" | "/catalog/wheels",
  city?: string,
): BrandLink[] {
  return brands.map((b) => ({
    link: appendCityParam(`${base}/${b.value}`, city ?? ""),
    link_name: b.label,
  }));
}

/**
 * Стартовая /catalog из живых данных (задача 2 плана catalog-product-start-live):
 * бренды — фасеты фильтров шин и дисков; карточки — статика фронта.
 */
export function toCatalogStart(
  tireFacets: FilterOptions,
  wheelFacets: FilterOptions,
  city?: string,
): CatalogStartData {
  return {
    cards: CATALOG_START_CARDS.map((card) => ({
      ...card,
      link: appendCityParam(card.link, city ?? ""),
    })),
    tireBrands: toBrandLinks(tireFacets.brands, "/catalog/tires", city),
    wheelBrands: toBrandLinks(wheelFacets.brands, "/catalog/wheels", city),
  };
}

export async function getCatalogStart(city?: string): Promise<CatalogStartData> {
  const [tires, wheels] = await Promise.all([getCatalogFilters(), getWheelsFilters()]);
  return toCatalogStart(tires, wheels, city);
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

/** Элементов на странице каталога (допустимо 10–100, бэк по умолчанию 48). */
const CATALOG_PER_PAGE = 12;

/** Фильтр каталога → query листинга. Город — слагом city= (резолвит бэк). */
export function toTireListQuery(filter: FilterState, city?: string): string {
  const params = new URLSearchParams();
  if (filter.width !== undefined) params.append("width[]", String(filter.width));
  if (filter.profile !== undefined) params.append("profile[]", String(filter.profile));
  if (filter.diameter !== undefined) params.append("diameter[]", String(filter.diameter).toUpperCase());
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

/**
 * Короткий слаг модели для URL: у полного слага листинга («бренд-модель») срезается
 * префикс бренда (страницы модели/типоразмера адресуются схемой бэка: бренд + модель).
 * Нет префикса — полный остаётся как есть (не гадаем).
 */
function toShortModelSlug(fullSlug: string | null | undefined, brandSlug: string): string {
  if (!fullSlug) return "";
  const prefix = `${brandSlug}-`;
  return fullSlug.startsWith(prefix) ? fullSlug.slice(prefix.length) : fullSlug;
}

/** DTO листинга → TireProduct (состав полей — как в ответе бэка). */
export function toTireProduct(dto: TireListItemDto): TireProduct {
  const sizeTitle = [dto.width, dto.profile].filter(Boolean).join("/");
  return {
    id: String(dto.id),
    category: "tires",
    ean: dto.ean,
    slug: dto.slug,
    season: dto.season?.value ?? "all-season",
    seasonLabel: dto.season?.label,
    isStudded: dto.is_studded,
    deliveryMin: dto.delivery_min,
    deliveryMax: dto.delivery_max,
    brandName: dto.brand.name,
    brandSlug: dto.brand.slug,
    // ссылки карточек строятся коротким слагом: у полного «бренд-модель» префикс срезается
    modelSlug: toShortModelSlug(dto.model?.slug, dto.brand.slug),
    modelName: dto.model?.name ?? dto.name,
    width: dto.width ?? 0,
    profile: dto.profile ?? 0,
    diameter: parseDiameter(dto.diameter),
    price: dto.price ?? undefined,
    // зачёркнутая цена; карточка рисует её только выше текущей (условие в ProductCard)
    oldPrice: dto.old_price ?? undefined,
    // наличие из листинга; null — бэк не назвал число (строка «Наличие …» скрывается)
    quantity: dto.count_in_stock ?? null,
    image: dto.images[0]?.url ?? PRODUCT_PLACEHOLDER,
    title: dto.name,
    sizeSlug: dto.slug,
    sizeTitle: `${sizeTitle} R${dto.diameter ?? ""}`,
    // бэк шлёт noiseEmission строкой — в карточке число dB
    euLabel: dto.euro_label
      ? { ...dto.euro_label, noiseEmission: Number(dto.euro_label.noiseEmission) }
      : undefined,
    // origin (vendor/country/year с badge+description) → параметры карточки
    parameters: [
      toOriginParam("Производитель:", dto.origin?.vendor),
      toOriginParam("Страна производства:", dto.origin?.manufacture_country),
      toOriginParam("Год производства:", dto.origin?.manufacture_year),
    ].filter((p): p is ProductParam => Boolean(p)),
    // плашка срока выдачи — в строку «Самовывоз» карточки (в parameters не дублируется)
    pickup: toOriginParam("Самовывоз", dto.origin?.delivery_days_after_order),
    // плашка выдачи города — в строку «Доставка до ПВЗ» (у бэка вложена в pick_up_point)
    pvzDelivery: toOriginParam("Доставка до ПВЗ", dto.origin?.pick_up?.pick_up_point),
    // стек баджей товара — как отдал бэк (порядок и дедуп на бэке)
    badges: dto.badges ?? [],
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
    article: toArticleBlock(body.article),
  };
}

// --- Карточка модели шин и дисков: GET /api/catalog/{tire|wheel}-models/{brand}/{model} ---

/** Размеров тянем за один заход: вкладка диаметра целиком (листинг допускает до 100). */
const MODEL_SIZES_PER_PAGE = 100;

/** Категория → сегмент эндпоинта карточки модели; листинг размеров — по имени категории. */
const MODEL_CARD_SEGMENTS = {
  tires: "tire-models",
  wheels: "wheel-models",
} as const;

export interface ModelCardInput {
  category: "tires" | "wheels";
  brandSlug: string;
  modelSlug: string;
  city?: string;
}

export interface ModelSizesInput extends ModelCardInput {
  /** r-ключ вкладки (r17); в query уходит число. */
  diameter?: string;
}

export interface ModelCardResult {
  model: ModelCardData;
  seo: TireListSeo | null;
  article: ArticleBlockData | null;
}

/**
 * Адаптер DTO модели → ModelCardData: диаметры бэка («17») — r-ключами вкладок
 * (?diameter=r17); параметры и описание — как отдал бэк (пустое страница скрывает).
 */
export function toModelCard(dto: ModelCardDto): ModelCardData {
  return {
    slug: dto.slug,
    name: dto.name,
    brandName: dto.brand.name,
    brandSlug: dto.brand.slug,
    image: dto.image_url ?? PRODUCT_PLACEHOLDER,
    params: dto.params,
    description: dto.description,
    diameters: dto.diameters.map((d) => ({
      value: `r${String(d.value).replace(/^r/i, "")}`,
      count: d.count,
    })),
    // стек баджей модели (модель → бренд) — как отдал бэк
    badges: dto.badges ?? [],
  };
}

/** Путь карточки модели: у шин и дисков — зеркальные эндпоинты бэка. */
export function modelCardPath(input: ModelCardInput): string {
  const segment = MODEL_CARD_SEGMENTS[input.category];
  return `/catalog/${segment}/${input.brandSlug}/${input.modelSlug}${cityQuery(input.city)}`;
}

/** Карточка модели: 404 бэка → null (страница отдаёт notFound). */
export async function getModelCard(input: ModelCardInput): Promise<ModelCardResult | null> {
  const res = await fetch(`${apiBase()}${modelCardPath(input)}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`getModelCard: HTTP ${res.status}`);
  }
  const body = (await res.json()) as ModelCardResponseDto;
  return {
    model: toModelCard(body.data),
    seo: body.meta.seo ?? null,
    article: toArticleBlock(body.article),
  };
}

/** URL размеров модели: листинг категории с фильтрами модели и диаметра, город в query. */
export function modelSizesUrl(input: ModelSizesInput): string {
  const params = new URLSearchParams();
  if (input.modelSlug) params.append("model", input.modelSlug);
  if (input.brandSlug) params.append("brand", input.brandSlug);
  // Бэк ждёт диаметр числом: r-префикс вкладки (r18) срезается
  if (input.diameter) params.append("diameter[]", input.diameter.replace(/^r/i, "").toUpperCase());
  if (input.city) params.append("city", input.city);
  params.append("per_page", String(MODEL_SIZES_PER_PAGE));
  // URLSearchParams кодирует [] в %5B%5D — бэк ждёт каноничный вид diameter[]= (PHP parse_str)
  const query = params.toString().replace(/%5B/g, "[").replace(/%5D/g, "]");
  return `/catalog/${input.category}?${query}`;
}

/** Типоразмеры модели одной вкладки диаметра: живой листинг с фильтрами модели. */
export async function getModelSizes(input: ModelSizesInput): Promise<ProductBase[]> {
  const res = await fetch(`${apiBase()}${modelSizesUrl(input)}`);
  if (!res.ok) {
    throw new Error(`getModelSizes: HTTP ${res.status}`);
  }
  if (input.category === "tires") {
    const body = (await res.json()) as TireListDto;
    return body.data.map(toTireProduct);
  }
  const body = (await res.json()) as WheelListDto;
  return body.data.map(toWheelProduct);
}

// --- Диски (живые: GET /api/catalog/wheels, GET /api/reference/filter/wheel) ---

/**
 * Адаптер фасетов фильтра дисков → FilterOptions.
 * Decimal-значения бэка («7.0», «40.0») приводим к каноничному виду URL/селектов
 * (диаметр — префикс `r15`, остальные — числа без хвостовых нулей); label — от бэка.
 */
export function toWheelFilterOptions(data: WheelFilterValuesDto): FilterOptions {
  const opts = (items: WheelFilterValuesDto["width"]): FilterOptions["brands"] =>
    items.map((o) => ({ label: String(o.label), value: String(o.value) }));

  const diameterOpts = (items: WheelFilterValuesDto["diameter"]): FilterOptions["diameters"] =>
    items.map((o) => {
      const value = String(o.value);
      return { label: String(o.label), value: value.startsWith("r") ? value : `r${value}` };
    });

  const decimalOpts = (items: WheelFilterValuesDto["width"]): FilterOptions["widths"] =>
    items.map((o) => ({ label: String(o.label), value: decimal(String(o.value)) }));

  return {
    seasons: [],
    brands: opts(data.brand),
    widths: decimalOpts(data.width),
    profiles: [],
    diameters: diameterOpts(data.diameter),
    studded: [],
    pcds: opts(data.pcd),
    ets: decimalOpts(data.et),
    hubBores: decimalOpts(data.hub_diameter),
    wheelTypes: opts(data.type),
    countries: opts(data.country),
    delivery: opts(data.delivery),
    priceMin: data.price.min,
    priceMax: data.price.max,
  };
}

export async function getWheelsFilters(): Promise<FilterOptions> {
  const res = await fetch(`${apiBase()}/reference/filter/wheel`);
  if (!res.ok) {
    throw new Error(`getWheelsFilters: HTTP ${res.status}`);
  }
  const body = (await res.json()) as { data: WheelFilterValuesDto };
  return toWheelFilterOptions(body.data);
}

/** Фильтр каталога дисков → query листинга: decimal-поля — числами (бэк нормализует). */
export function toWheelListQuery(filter: FilterState, city?: string): string {
  const params = new URLSearchParams();
  if (filter.width !== undefined) params.append("width[]", String(filter.width));
  if (filter.diameter !== undefined) params.append("diameter[]", String(filter.diameter));
  if (filter.pcd) params.append("pcd[]", filter.pcd);
  if (filter.et !== undefined) params.append("et[]", String(filter.et));
  if (filter.hubBore !== undefined) params.append("hub_diameter[]", String(filter.hubBore));
  if (filter.wheelType) params.append("type", filter.wheelType);
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

/** DTO листинга дисков → WheelProduct (как toTireProduct; кода товара у дисков нет). */
export function toWheelProduct(dto: WheelListItemDto): WheelProduct {
  const width = dto.width !== null ? parseFloat(dto.width) : 0;
  const diameter = dto.diameter ?? 0;
  const pcd = dto.pcd ?? "";
  const et = dto.et !== null ? parseFloat(dto.et) : 0;
  const hubBore = dto.hub_diameter !== null ? parseFloat(dto.hub_diameter) : 0;

  return {
    id: String(dto.id),
    category: "wheels",
    ean: "",
    slug: dto.slug,
    brandName: dto.brand.name,
    brandSlug: dto.brand.slug,
    // канонический слаг модели листинга; префикс бренда не срезаем — у LS модель «ls-367»
    modelSlug: dto.model?.slug ?? "",
    modelName: dto.model?.name ?? dto.name,
    width,
    diameter,
    pcd,
    et,
    hubBore,
    wheelType: dto.type?.value ?? "",
    price: dto.price ?? undefined,
    // зачёркнутая цена; карточка рисует её только выше текущей (условие в ProductCard)
    oldPrice: dto.old_price ?? undefined,
    // наличие из листинга; null — бэк не назвал число (строка «Наличие …» скрывается)
    quantity: dto.count_in_stock ?? null,
    image: dto.images[0]?.url ?? PRODUCT_PLACEHOLDER,
    title: dto.name,
    sizeSlug: dto.slug,
    sizeTitle: `${width}J R${diameter} ${pcd} ET${et}`,
    // origin (vendor/country/year с badge+description) → параметры карточки
    parameters: [
      toOriginParam("Производитель:", dto.origin?.vendor),
      toOriginParam("Страна производства:", dto.origin?.manufacture_country),
      toOriginParam("Год производства:", dto.origin?.manufacture_year),
    ].filter((p): p is ProductParam => Boolean(p)),
    // плашки выдачи — в строки «Самовывоз» и «Доставка до ПВЗ» карточки
    pickup: toOriginParam("Самовывоз", dto.origin?.delivery_days_after_order),
    pvzDelivery: toOriginParam("Доставка до ПВЗ", dto.origin?.pick_up?.pick_up_point),
    // стек баджей товара — как отдал бэк (порядок и дедуп на бэке)
    badges: dto.badges ?? [],
  };
}

export async function getWheelsProducts(
  filter: FilterState,
  city?: string,
): Promise<WheelListResult> {
  const query = toWheelListQuery(filter, city);
  const url = `${apiBase()}/catalog/wheels?${query ? `${query}&` : ""}per_page=${CATALOG_PER_PAGE}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`getWheelsProducts: HTTP ${res.status}`);
  }
  const body = (await res.json()) as WheelListDto;
  return {
    items: body.data.map(toWheelProduct),
    total: body.meta.total,
    page: body.meta.current_page,
    perPage: body.meta.per_page,
    seo: body.meta.seo ?? null,
    article: toArticleBlock(body.article),
  };
}
