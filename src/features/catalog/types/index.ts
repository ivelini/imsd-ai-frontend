// Типы каталога (фаза 2, 03.08.2026)

/** Единый формат опций фильтра/селекта: label — от бэка, value — латинский slug = URL */
export interface FilterOption {
  label: string;
  value: string;
}

export interface TireProduct {
  id: string;
  slug: string; // "185-60-r15-84h"
  brandId: string;
  brandName: string;
  modelSlug: string;
  modelName: string;
  width: number;
  profile: number;
  diameter: number;
  season: string; // value: "summer" | "winter" | "all-season"
  loadIndex: string;
  speedRating: string;
  price: number;
  oldPrice?: number;
  code: string;
  country: string; // value: "russia", "france"...
  countryLabel: string; // готовый label от «бэка»
  year: string;
  quantity: number;
  image: string;
  tireType: string; // value: "passenger" | "suv" | "commercial"
  title: string; // готовый заголовок карточки (формирует «бэк»)
  euLabel?: {
    rollingResistance: string;
    wetGrip: string;
    noiseEmission: number;
  };
}

export interface FilterState {
  season?: string;
  brand?: string;
  width?: number;
  profile?: number;
  diameter?: number;
  priceMin?: number;
  priceMax?: number;
  delivery?: string[];
  country?: string;
  tireType?: string;
  page?: number;
}

export interface FilterOptions {
  seasons: FilterOption[];
  brands: FilterOption[];
  widths: FilterOption[];
  profiles: FilterOption[];
  diameters: FilterOption[];
  tireTypes: FilterOption[];
  countries: FilterOption[];
  delivery: FilterOption[];
  priceMin: number;
  priceMax: number;
}
