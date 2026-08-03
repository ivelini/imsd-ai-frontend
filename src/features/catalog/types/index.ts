// Типы каталога (фаза 2, 03.08.2026)

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
  season: string;
  loadIndex: string;
  speedRating: string;
  price: number;
  oldPrice?: number;
  code: string;
  country: string;
  year: string;
  quantity: number;
  image: string;
  tireType: string;
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

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
  country: string;
  count: number;
}

export interface FilterOptions {
  seasons: string[];
  brands: BrandOption[];
  widths: number[];
  profiles: number[];
  diameters: number[];
  tireTypes: string[];
  countries: string[];
  priceMin: number;
  priceMax: number;
}
