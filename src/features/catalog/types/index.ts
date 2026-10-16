// Типы каталога (фаза 2, 03.08.2026)
import type { ProductParam } from "@/shared/types/product";

/** Единый формат опций фильтра/селекта: label — от бэка, value — латинский slug = URL */
export interface FilterOption {
  label: string;
  value: string;
}

// ============================================================================
// Общие поля отображения (шины и диски)
// ============================================================================

export interface ProductBase {
  id: string;
  ean: string;
  category: "tires" | "wheels";
  season?: string; // только у шин; у дисков нет
  brandId: string;
  brandName: string;
  /** Слаг бренда (листинг) — сегмент URL страницы модели/типоразмера. */
  brandSlug: string;
  /** Короткий слаг модели (без префикса бренда) — сегмент URL страницы модели. */
  modelSlug: string;
  modelName: string;
  width: number | string; // ширина (мм для шин, J-width для дисков)
  diameter: number;
  price?: number; // null с бэка → карточка скрывает блок цен
  oldPrice?: number;
  code: string;
  country: string; // value: "russia", "france"...
  countryLabel: string; // готовый label от «бэка»
  year: string;
  /** Наличие (count_in_stock); null — бэк не назвал число, строка «Наличие …» скрывается. */
  quantity: number | null;
  image: string;
  title: string; // готовый заголовок карточки (формирует «бэк»)
  sizeSlug: string; // URL-сегмент типоразмера
  sizeTitle: string; // читаемое имя типоразмера
  euLabel?: {
    rollingResistance: string;
    wetGrip: string;
    noiseEmission: number;
  };
  /** Параметры для отображения в карточке (формирует «бэк»).
   *  badge + description → ParamBadge с попапом, иначе parameter-value. */
  parameters: ProductParam[];
  /** Плашка строки «Самовывоз» (origin.delivery_days_after_order): дата + текст попапа.
   *  null — плашки у бэка нет, строка скрывается. */
  pickup: ProductParam | null;
  /** Плашка строки «Доставка до ПВЗ» (origin.pick_up.pick_up_point): значение + текст попапа.
   *  null — плашки у бэка нет, строка скрывается. */
  pvzDelivery: ProductParam | null;
}

// ============================================================================
// Шины
// ============================================================================

export interface TireProduct extends ProductBase {
  category: "tires";
  slug: string; // = sizeSlug (обратная совместимость)
  season: string; // value: "summer" | "winter" | "all-season"
  seasonLabel?: string; // русское название сезона (label от бэка)
  isStudded?: boolean; // шипованность (живой листинг)
  deliveryMin?: number | null; // срок доставки города, дни
  deliveryMax?: number | null;
  profile: number;
  loadIndex: string;
  speedRating: string;
  tireType: string; // value: "passenger" | "suv" | "commercial"
}

// ============================================================================
// Диски
// ============================================================================

export interface WheelProduct extends ProductBase {
  category: "wheels";
  slug: string; // = sizeSlug
  pcd: string; // "4x100", "5x114.3"...
  et: number; // вылет
  hubBore: number; // D ступицы
  wheelType: string; // "litoy" | "kovanyy" | "shtampovannyy"
}

// ============================================================================
// Фильтр
// ============================================================================

export interface FilterState {
  season?: string;
  brand?: string;
  width?: number;
  profile?: number;
  diameter?: number | string; // шины/диски: 15 | "13c" (C-размеры)
  studded?: string; // шины: "studded" | "not_studded" (query-параметр)
  pcd?: string; // диски
  et?: number; // диски
  hubBore?: number; // диски
  wheelType?: string; // диски
  priceMin?: number;
  priceMax?: number;
  delivery?: string[];
  country?: string;
  page?: number;
}

// ============================================================================
// Стартовая страница каталога (/api/catalog-start)
// ============================================================================

export interface CatalogStartCard {
  id: "tires-params" | "tires-auto" | "wheels-params" | "wheels-auto";
  /** Какую иконку показать: tire/disk (svg на фронте) */
  icon: "tire" | "disk";
  title: string;
  sub: string;
  link: string;
}

export interface BrandLink {
  /** Путь: /catalog/tires/<slug> или /catalog/wheels/<slug> */
  link: string;
  link_name: string;
}

export interface CatalogStartData {
  cards: CatalogStartCard[];
  tireBrands: BrandLink[];
  wheelBrands: BrandLink[];
}

/** SEO-контент под каталогом (готовые строки от бэка; бренд подставляет бэк) */
export interface SeoContent {
  title: string;
  subtitle: string;
}

export interface FilterOptions {
  seasons: FilterOption[];
  brands: FilterOption[];
  widths: FilterOption[];
  profiles: FilterOption[];
  diameters: FilterOption[];
  studded: FilterOption[]; // шины
  pcds: FilterOption[]; // диски
  ets: FilterOption[]; // диски
  hubBores: FilterOption[]; // диски
  wheelTypes: FilterOption[]; // диски
  countries: FilterOption[];
  delivery: FilterOption[];
  priceMin: number;
  priceMax: number;
}

// ============================================================================
// DTO бэкенда: GET /api/reference/filter/tire (Scramble public-api.json)
// Целевой контракт: brand/country — slug-строки, diameter — r-значения (r15);
// width/profile — int (приводятся к строке адаптером).
// ============================================================================

export interface FilterValueDto {
  label: string | number;
  value: string | number | boolean;
}

export interface TireFilterValuesDto {
  width: FilterValueDto[];
  profile: FilterValueDto[];
  diameter: FilterValueDto[];
  season: FilterValueDto[];
  studded: FilterValueDto[];
  brand: FilterValueDto[];
  country: FilterValueDto[];
  delivery: FilterValueDto[];
  price: { min: number; max: number };
}

// ============================================================================
// DTO бэкенда: GET /api/catalog/tires (Scramble public-api.json, 21.08.2026)
// ============================================================================

/** origin-бейдж: badge — текст бейджа, description — текст попапа (строка от бэка). */
export interface OriginItemDto {
  badge: string;
  description: string | null;
}

/** Происхождение товара (шины и диски): производитель, страна, год + плашки срока и выдачи. */
export interface OriginDto {
  vendor: OriginItemDto | null;
  manufacture_country: OriginItemDto | null;
  manufacture_year: OriginItemDto | null;
  /** Плашка срока: badge — дата словами («10 Окт (Сб)»), description — HTML текста выдачи города. */
  delivery_days_after_order: OriginItemDto | null;
  /** Плашка «Доставка до ПВЗ»: пункт выдачи города (badge «бесплатно» + HTML текста доставки). */
  pick_up: { pick_up_point: OriginItemDto } | null;
}

/** Элемент листинга шин. slug — sizeSlug (brand-name-width-profile-diameter). */
export interface TireListItemDto {
  id: number;
  ean: string;
  name: string;
  slug: string;
  brand: { id: number; name: string; slug: string };
  model: { id: number; name: string; slug: string } | null;
  origin: OriginDto | null;
  width: number | null;
  profile: number | null;
  diameter: string | null; // "17" | "13c"
  season: { label: string; value: string } | null;
  is_studded: boolean;
  euro_label: { rollingResistance: string; wetGrip: string; noiseEmission: string } | null;
  price: number | null;
  old_price: number | null;
  count_in_stock: number | null;
  delivery_min: number | null;
  delivery_max: number | null;
  images: { id: number; url: string }[];
}

/** SEO-мета листинга: title готовый (предложный падеж города), description из бренда/конфига. */
export interface TireListSeo {
  title: string;
  description: string | null;
}

export interface TireListMetaDto {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  seo: TireListSeo | null;
}

export interface TireListDto {
  data: TireListItemDto[];
  meta: TireListMetaDto;
}

/** Результат листинга для страницы: товары + пагинация + seo-мета. */
export interface TireListResult {
  items: TireProduct[];
  total: number;
  page: number;
  perPage: number;
  seo: TireListSeo | null;
}

// ============================================================================
// DTO бэкенда: GET /api/catalog/wheels и /api/reference/filter/wheel
// (Scramble public-api.json, 16.10.2026)
// Decimal-поля — строками из БД («7.0», «40.0»); бэк нормализует вход
// (normalizeDecimal), поэтому в query значения уходят числами.
// ============================================================================

/** Элемент листинга дисков. slug — sizeSlug; origin идентичен шинному. */
export interface WheelListItemDto {
  id: number;
  name: string;
  slug: string;
  brand: { id: number; name: string; slug: string };
  model: { id: number; name: string; slug: string } | null;
  origin: OriginDto | null;
  width: string | null;
  diameter: number | null;
  pcd: string | null;
  et: string | null;
  hub_diameter: string | null;
  type: { label: string; value: string } | null;
  color: string | null;
  price: number | null;
  old_price: number | null;
  promotion: boolean;
  delivery: { delivery_min: number; delivery_max: number; delivery_days_after_order: number } | null;
  count_in_stock: number | null;
  images: { id: number; url: string }[];
}

export interface WheelListDto {
  data: WheelListItemDto[];
  meta: TireListMetaDto; // shape meta у дисков тот же (включая seo)
}

/** Результат листинга дисков для страницы: товары + пагинация + seo-мета. */
export interface WheelListResult {
  items: WheelProduct[];
  total: number;
  page: number;
  perPage: number;
  seo: TireListSeo | null;
}

// ============================================================================
// DTO бэкенда: GET /api/catalog/tire-models/{brand}/{model}
// (Scramble public-api.json, 16.10.2026: {brand} — слаг бренда,
// {model} — короткий слаг модели; диаметры — числами без префикса)
// ============================================================================

export interface TireModelDto {
  slug: string;
  name: string;
  brand: { id: number; name: string; slug: string };
  image_url: string | null;
  params: { name: string; value: string }[];
  description: string | null;
  diameters: { value: string; count: number }[];
}

export interface TireModelResponseDto {
  data: TireModelDto;
  meta: { seo: TireListSeo | null };
}

/** Модель для страницы: диаметры — r-ключами вкладок (?diameter=r17). */
export interface TireModelData {
  slug: string;
  name: string;
  brandName: string;
  brandSlug: string;
  image: string;
  params: { name: string; value: string }[];
  description: string | null;
  /** Вкладки диаметров: value — r-ключ (r17), count — размеров у бэка. */
  diameters: { value: string; count: number }[];
}

/** Фасеты фильтра дисков: label — готовый от бэка, value — значение фасета. */
export interface WheelFilterValuesDto {
  width: FilterValueDto[];
  diameter: FilterValueDto[];
  pcd: FilterValueDto[];
  et: FilterValueDto[];
  hub_diameter: FilterValueDto[];
  type: FilterValueDto[];
  color: FilterValueDto[];
  brand: FilterValueDto[];
  country: FilterValueDto[];
  delivery: FilterValueDto[];
  price: { min: number; max: number };
}
