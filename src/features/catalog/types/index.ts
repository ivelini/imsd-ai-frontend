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
  category: "tires" | "wheels";
  season?: string; // только у шин; у дисков нет
  brandId: string;
  brandName: string;
  modelSlug: string;
  modelName: string;
  width: number | string; // ширина (мм для шин, J-width для дисков)
  diameter: number;
  price: number;
  oldPrice?: number;
  code: string;
  country: string; // value: "russia", "france"...
  countryLabel: string; // готовый label от «бэка»
  year: string;
  quantity: number;
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
}

// ============================================================================
// Шины
// ============================================================================

export interface TireProduct extends ProductBase {
  category: "tires";
  slug: string; // = sizeSlug (обратная совместимость)
  season: string; // value: "summer" | "winter" | "all-season"
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

/** SEO-контент под каталогом (готовые строки от «бэка») */
export interface SeoContent {
  title: string;
  subtitle: string;
  features: string[];
  advantages: string;
  sizes: string[];
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
