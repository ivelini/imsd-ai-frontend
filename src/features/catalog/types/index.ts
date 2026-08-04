// Типы каталога (фаза 2, 03.08.2026)

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
  diameter?: number;
  tireType?: string; // шины
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

export interface FilterOptions {
  seasons: FilterOption[];
  brands: FilterOption[];
  widths: FilterOption[];
  profiles: FilterOption[];
  diameters: FilterOption[];
  tireTypes: FilterOption[]; // шины
  pcds: FilterOption[]; // диски
  ets: FilterOption[]; // диски
  hubBores: FilterOption[]; // диски
  wheelTypes: FilterOption[]; // диски
  countries: FilterOption[];
  delivery: FilterOption[];
  priceMin: number;
  priceMax: number;
}
