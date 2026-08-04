// Мок-данные каталога дисков (фаза 2, 04.08.2026)
// ~200 товаров, 4 бренда, справочники фильтра, авто-словарь
// Мок имитирует ответ бэкенда: value — латинские slug (совпадают с URL),
// label/готовые строки формируются здесь (как это сделает API).
import type { WheelProduct, FilterOptions, FilterOption, FilterState } from "@/features/catalog/types";

// ============================================================================
// Словари «бэка»: value → готовый label для отображения
// ============================================================================

const WHEEL_TYPE_LABELS: Record<string, string> = {
  litoy: "Литой",
  shtampovannyy: "Штампованный",
  kovanyy: "Кованый",
};

// Реэкспорт для моков (общие словари)
import { COUNTRY_LABELS, DELIVERY_OPTIONS } from "./catalog";
export { COUNTRY_LABELS };

// ============================================================================
// Бренды
// ============================================================================

interface BrandDef {
  id: string;
  name: string;
  slug: string;
  country: string;
  priceBase: number;
  priceFactor: number;
}

const BRANDS: BrandDef[] = [
  { id: "replica", name: "Replica", slug: "replica", country: "russia", priceBase: 4000, priceFactor: 1.0 },
  { id: "k-and-k", name: "K&K", slug: "k-and-k", country: "russia", priceBase: 5500, priceFactor: 1.2 },
  { id: "skad", name: "Скад", slug: "skad", country: "russia", priceBase: 3500, priceFactor: 0.9 },
  { id: "dezent", name: "Dezent", slug: "dezent", country: "france", priceBase: 7000, priceFactor: 1.5 },
];

// ============================================================================
// Опции фильтра
// ============================================================================

const ALL_DIAMETERS = Array.from({ length: 8 }, (_, i) => 13 + i); // R13-R20
const ALL_WIDTHS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0];
const ALL_PCD = ["4x98", "4x100", "4x108", "5x100", "5x108", "5x112", "5x114.3", "6x139.7"];
const ALL_ET = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const ALL_HUB_BORES = [54.1, 56.1, 57.1, 60.1, 66.6, 67.1, 71.6];
const WHEEL_TYPES: FilterOption[] = [
  { label: WHEEL_TYPE_LABELS.litoy, value: "litoy" },
  { label: WHEEL_TYPE_LABELS.kovanyy, value: "kovanyy" },
  { label: WHEEL_TYPE_LABELS.shtampovannyy, value: "shtampovannyy" },
];

// ============================================================================
// Генерация товаров
// ============================================================================

let _nextId = 1;

export const ALL_WHEELS: WheelProduct[] = [];

for (const brand of BRANDS) {
  for (const diameter of ALL_DIAMETERS) {
    // Для маленьких диаметров — узкие диски, для больших — широкие
    const widths = ALL_WIDTHS.filter((w) => {
      if (diameter <= 14) return w <= 6.5;
      if (diameter <= 16) return w >= 5.0 && w <= 8.0;
      if (diameter <= 18) return w >= 6.0 && w <= 9.0;
      return w >= 6.5 && w <= 10.0;
    });

    for (const width of widths.slice(0, 4)) { // 4 ширины на диаметр
      const pcds = ALL_PCD.filter((_, i) => i % 3 === diameter % 3); // ~2-3 PCD на диаметр
      for (const pcd of pcds.slice(0, 2)) {
        const et = ALL_ET[diameter % ALL_ET.length];
        const hubBore = ALL_HUB_BORES[diameter % ALL_HUB_BORES.length];
        const wheelType = WHEEL_TYPES[diameter % 3].value;

        const sizeSlug = `${width}-r${diameter}-${pcd.replace("x", "-")}-et${et}`;
        const sizeTitle = `${width}J R${diameter} ${pcd} ET${et}`;

        const modelName = `${brand.name} ${sizeTitle}`;
        const price = Math.round(brand.priceBase * brand.priceFactor * (1 + (diameter - 13) * 0.25) * (1 + width * 0.05));

        ALL_WHEELS.push({
          id: `wheel-${_nextId}`,
          slug: sizeSlug,
          category: "wheels" as const,
          brandId: brand.id,
          brandName: brand.name,
          modelSlug: `wheels-${brand.slug}-${sizeSlug}`,
          modelName,
          width,
          diameter,
          pcd,
          et,
          hubBore,
          wheelType,
          price,
          oldPrice: Math.round(price * 1.15),
          code: `W${String(_nextId).padStart(5, "0")}`,
          country: brand.country,
          countryLabel: COUNTRY_LABELS[brand.country] ?? brand.country,
          year: "2026",
          quantity: Math.floor(Math.random() * 20) + 1,
          image: "/assets/img/wheel-product.png",
          title: modelName,
          sizeSlug,
          sizeTitle,
        });
        _nextId++;
      }
    }
  }
}

export function getWheelPriceRange() {
  if (ALL_WHEELS.length === 0) return { min: 0, max: 100000 };
  const prices = ALL_WHEELS.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// ============================================================================
// Опции фильтра
// ============================================================================

export function getWheelsFilterOptions(): FilterOptions {
  const diameters: FilterOption[] = [...new Set(ALL_WHEELS.map((p) => p.diameter))]
    .sort((a, b) => a - b)
    .map((d) => ({ label: `R${d}`, value: String(d) }));

  const widths: FilterOption[] = [...new Set(ALL_WHEELS.map((p) => p.width))]
    .sort((a, b) => Number(a) - Number(b))
    .map((w) => ({ label: `${w}J`, value: String(w) }));

  const pcds: FilterOption[] = ALL_PCD.map((v) => ({ label: v, value: v.toLowerCase() }));
  const ets: FilterOption[] = ALL_ET.map((v) => ({ label: `ET${v}`, value: String(v) }));
  const hubBores: FilterOption[] = ALL_HUB_BORES.map((v) => ({ label: `D${v}`, value: String(v) }));

  const brands: FilterOption[] = BRANDS.map((b) => ({
    label: `${b.name} (${ALL_WHEELS.filter((p) => p.brandId === b.id).length})`,
    value: b.slug,
  }));

  const countries: FilterOption[] = [...new Set(BRANDS.map((b) => b.country))].map((c) => ({
    label: COUNTRY_LABELS[c] ?? c,
    value: c,
  }));

  const priceRange = getWheelPriceRange();

  return {
    seasons: [],
    brands,
    widths,
    profiles: [],
    diameters,
    tireTypes: [],
    pcds,
    ets,
    hubBores,
    wheelTypes: WHEEL_TYPES,
    countries,
    delivery: DELIVERY_OPTIONS,
    priceMin: priceRange.min,
    priceMax: priceRange.max,
  };
}

// ============================================================================
// Авто-словарь (4 марки — BMW, Audi, Mercedes, Toyota)
// ============================================================================

export interface WheelAutoBrand {
  id: string;
  name: string;
  models: { slug: string; name: string }[];
}

interface WheelAutoMod {
  id: string;
  name: string;
  sizes: { width: number; diameter: number; pcd: string; et: number; hubBore: number }[];
}

const WHEEL_AUTO_YEARS = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];

export const WHEEL_AUTO_BRANDS: WheelAutoBrand[] = [
  {
    id: "bmw",
    name: "BMW",
    models: [
      { slug: "3-series", name: "3 серия" },
      { slug: "5-series", name: "5 серия" },
      { slug: "x5", name: "X5" },
    ],
  },
  {
    id: "audi",
    name: "Audi",
    models: [
      { slug: "a4", name: "A4" },
      { slug: "a6", name: "A6" },
      { slug: "q5", name: "Q5" },
    ],
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    models: [
      { slug: "c-class", name: "C-класс" },
      { slug: "e-class", name: "E-класс" },
    ],
  },
  {
    id: "toyota",
    name: "Toyota",
    models: [
      { slug: "camry", name: "Camry" },
      { slug: "rav4", name: "RAV4" },
      { slug: "land-cruiser", name: "Land Cruiser" },
    ],
  },
];

export function generateWheelMods(brand: string, model: string, _year: number): WheelAutoMod[] {
  const key = `${brand}:${model}`;
  const base = (_year % 3);
  const mods: Record<string, WheelAutoMod[]> = {
    "bmw:3-series": [
      { id: `${key}-base`, name: "320i", sizes: [{ width: 6.5, diameter: 16, pcd: "5x112", et: 30, hubBore: 66.6 }] },
      { id: `${key}-sport`, name: "330i M Sport", sizes: [
        { width: 7.5, diameter: 17, pcd: "5x112", et: 30, hubBore: 66.6 },
        { width: 8.0, diameter: 18, pcd: "5x112", et: 30, hubBore: 66.6 },
      ]},
    ],
    "bmw:5-series": [
      { id: `${key}-base`, name: "520d", sizes: [{ width: 7.0, diameter: 17, pcd: "5x112", et: 25, hubBore: 66.6 }] },
      { id: `${key}-lux`, name: "530i Luxury", sizes: [
        { width: 7.5, diameter: 18, pcd: "5x112", et: 25, hubBore: 66.6 },
        { width: 8.5, diameter: 19, pcd: "5x112", et: 25, hubBore: 66.6 },
      ]},
    ],
    "bmw:x5": [
      { id: `${key}-base`, name: "X5 xDrive40i", sizes: [
        { width: 7.5, diameter: 19, pcd: "5x112", et: 40, hubBore: 71.6 },
        { width: 9.0, diameter: 20, pcd: "5x112", et: 40, hubBore: 71.6 },
      ]},
    ],
    "audi:a4": [
      { id: `${key}-base`, name: "A4 2.0 TFSI", sizes: [{ width: 6.5, diameter: 16, pcd: "5x112", et: 35, hubBore: 66.6 }] },
      { id: `${key}-sport`, name: "A4 3.0 TDI Quattro", sizes: [
        { width: 7.0, diameter: 17, pcd: "5x112", et: 35, hubBore: 66.6 },
        { width: 8.0, diameter: 18, pcd: "5x112", et: 35, hubBore: 66.6 },
      ]},
    ],
    "audi:a6": [
      { id: `${key}-base`, name: "A6 2.0 TFSI", sizes: [{ width: 7.0, diameter: 17, pcd: "5x112", et: 30, hubBore: 66.6 }] },
      { id: `${key}-lux`, name: "A6 3.0 TFSI", sizes: [
        { width: 7.5, diameter: 18, pcd: "5x112", et: 30, hubBore: 66.6 },
        { width: 8.5, diameter: 19, pcd: "5x112", et: 30, hubBore: 66.6 },
      ]},
    ],
    "audi:q5": [
      { id: `${key}-base`, name: "Q5 2.0 TFSI", sizes: [
        { width: 7.0, diameter: 18, pcd: "5x112", et: 35, hubBore: 66.6 },
        { width: 8.0, diameter: 19, pcd: "5x112", et: 35, hubBore: 66.6 },
      ]},
    ],
    "mercedes:c-class": [
      { id: `${key}-base`, name: "C 200", sizes: [{ width: 6.5, diameter: 16, pcd: "5x112", et: 37, hubBore: 66.6 }] },
      { id: `${key}-sport`, name: "C 300 AMG", sizes: [
        { width: 7.5, diameter: 18, pcd: "5x112", et: 37, hubBore: 66.6 },
        { width: 8.0, diameter: 19, pcd: "5x112", et: 37, hubBore: 66.6 },
      ]},
    ],
    "mercedes:e-class": [
      { id: `${key}-base`, name: "E 300", sizes: [
        { width: 7.0, diameter: 17, pcd: "5x112", et: 35, hubBore: 66.6 },
        { width: 8.0, diameter: 18, pcd: "5x112", et: 35, hubBore: 66.6 },
      ]},
    ],
    "toyota:camry": [
      { id: `${key}-base`, name: "Camry 2.5", sizes: [{ width: 6.5, diameter: 16, pcd: "5x114.3", et: 35, hubBore: 60.1 }] },
      { id: `${key}-sport`, name: "Camry 3.5", sizes: [
        { width: 7.0, diameter: 17, pcd: "5x114.3", et: 35, hubBore: 60.1 },
        { width: 7.5, diameter: 18, pcd: "5x114.3", et: 35, hubBore: 60.1 },
      ]},
    ],
    "toyota:rav4": [
      { id: `${key}-base`, name: "RAV4 2.0", sizes: [{ width: 6.5, diameter: 17, pcd: "5x114.3", et: 35, hubBore: 60.1 }] },
      { id: `${key}-sport`, name: "RAV4 2.5 Hybrid", sizes: [
        { width: 7.0, diameter: 18, pcd: "5x114.3", et: 35, hubBore: 60.1 },
        { width: 7.5, diameter: 19, pcd: "5x114.3", et: 35, hubBore: 60.1 },
      ]},
    ],
    "toyota:land-cruiser": [
      { id: `${key}-base`, name: "Land Cruiser 200", sizes: [
        { width: 7.0, diameter: 18, pcd: "5x114.3", et: 45, hubBore: 67.1 },
        { width: 8.0, diameter: 19, pcd: "5x114.3", et: 45, hubBore: 67.1 },
      ]},
    ],
  };

  const entry = mods[key];
  if (entry) return entry;

  // fallback: generic mod
  return [
    { id: `${key}-base`, name: "Базовая", sizes: [{ width: 6.5, diameter: 16, pcd: "5x112", et: 35, hubBore: 66.6 }] },
    { id: `${key}-sport`, name: "Спорт", sizes: [
      { width: 7.0, diameter: 17, pcd: "5x112", et: 35, hubBore: 66.6 },
      { width: 7.5, diameter: 18, pcd: "5x112", et: 35, hubBore: 66.6 },
    ]},
  ];
}

// Поиск товара по размерным характеристикам
function findWheel(width: number, diameter: number, pcd: string, et: number, hubBore: number): WheelProduct | undefined {
  return ALL_WHEELS.find(
    (w) => w.width === width && w.diameter === diameter && w.pcd === pcd && w.et === et && w.hubBore === hubBore,
  );
}

export interface WheelAutoResultItem {
  categorySection: string;
  items: {
    sizeLabel: string;
    sizeKeys: string[];
    sizes: { front: WheelProduct; rear?: WheelProduct }[];
  }[];
}

export function getWheelsAutoResult(
  brand: string, model: string, year: number, mod: string, filter?: FilterState,
): WheelAutoResultItem[] | null {
  const key = `${brand}:${model}`;
  const mods = generateWheelMods(brand, model, year);
  const modData = mods.find((m) => m.id === mod);
  if (!modData) return null;

  const result: WheelAutoResultItem[] = [];
  const sizes = modData.sizes;

  const szKey = (s: { width: number; diameter: number; pcd: string; et: number }) =>
    `${s.width}-r${s.diameter}-${s.pcd.replace("x", "-")}-et${s.et}`;
  const sizeLabel = (s: { width: number; diameter: number; pcd: string; et: number }) =>
    `${s.width}J R${s.diameter} ${s.pcd} ET${s.et}`;

  const matchWheel = (w: number, d: number, pcd: string, et: number, hb: number) => {
    const product = findWheel(w, d, pcd, et, hb);
    if (!product) return null;
    if (filter) {
      if (filter.priceMin != null && product.price < filter.priceMin) return null;
      if (filter.priceMax != null && product.price > filter.priceMax) return null;
      if (filter.country && product.country !== filter.country) return null;
    }
    return product;
  };

  const recommendedItems: WheelAutoResultItem["items"] = [];
  const altItems: WheelAutoResultItem["items"] = [];

  if (sizes[0]) {
    const p = matchWheel(sizes[0].width, sizes[0].diameter, sizes[0].pcd, sizes[0].et, sizes[0].hubBore);
    if (p) recommendedItems.push({ sizeLabel: sizeLabel(sizes[0]), sizeKeys: [szKey(sizes[0])], sizes: [{ front: p }] });
  }

  if (sizes[1] && sizes[2]) {
    const front = matchWheel(sizes[1].width, sizes[1].diameter, sizes[1].pcd, sizes[1].et, sizes[1].hubBore);
    const rear = matchWheel(sizes[2].width, sizes[2].diameter, sizes[2].pcd, sizes[2].et, sizes[2].hubBore);
    if (front && rear) {
      recommendedItems.push({
        sizeLabel: `${sizeLabel(sizes[1])} / ${sizeLabel(sizes[2])}`,
        sizeKeys: [szKey(sizes[1]), szKey(sizes[2])],
        sizes: [{ front, rear }],
      });
    }
  }

  if (recommendedItems.length > 0) {
    result.push({ categorySection: "Рекомендация производителя", items: recommendedItems });
  }

  const remaining = sizes.slice(3);
  for (let i = 0; i + 1 < remaining.length; i += 2) {
    const front = matchWheel(remaining[i].width, remaining[i].diameter, remaining[i].pcd, remaining[i].et, remaining[i].hubBore);
    const rear = matchWheel(remaining[i + 1].width, remaining[i + 1].diameter, remaining[i + 1].pcd, remaining[i + 1].et, remaining[i + 1].hubBore);
    if (front && rear) {
      altItems.push({
        sizeLabel: `${sizeLabel(remaining[i])} / ${sizeLabel(remaining[i + 1])}`,
        sizeKeys: [szKey(remaining[i]), szKey(remaining[i + 1])],
        sizes: [{ front, rear }],
      });
    }
  }

  if (altItems.length > 0) {
    result.push({ categorySection: "Лучшая альтернатива", items: altItems });
  }

  return result.length > 0 ? result : null;
}

// CarBlock для колёс
export interface WheelCarBlockData {
  name: string;
  sections: { name: string; options: { label: string; width: number; diameter: number; pcd: string; et: number; checked?: boolean; key: string }[] }[];
}

export function getWheelsCarBlock(brand: string, model: string, year: number, mod: string): WheelCarBlockData | null {
  const key = `${brand}:${model}`;
  const mods = generateWheelMods(brand, model, year);
  const modData = mods.find((m) => m.id === mod);
  if (!modData) return null;

  const brandData = WHEEL_AUTO_BRANDS.find((b) => b.id === brand);
  const modelData = brandData?.models.find((m) => m.slug === model);

  return {
    name: `${brandData?.name ?? brand} ${modelData?.name ?? model} ${modData.name}, ${year} г.`,
    sections: [
      {
        name: "Размеры",
        options: modData.sizes.map((s, i) => ({
          label: `${s.width}J R${s.diameter} ${s.pcd} ET${s.et} D${s.hubBore}`,
          width: s.width,
          diameter: s.diameter,
          pcd: s.pcd,
          et: s.et,
          checked: i === 0,
          key: `${s.width}-r${s.diameter}-${s.pcd.replace("x", "-")}-et${s.et}`,
        })),
      },
    ],
  };
}

export { WHEEL_TYPE_LABELS, WHEEL_AUTO_YEARS };
