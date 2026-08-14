// Мок-данные каталога (фаза 2, 03.08.2026)
// ~500 товаров, 4 бренда авто, справочники фильтра, SEO
// Мок имитирует ответ бэкенда: value — латинские slug (совпадают с URL),
// label/готовые строки формируются здесь (как это сделает API).
import type { TireProduct, FilterOptions, FilterOption, FilterState, SeoContent } from "@/features/catalog/types";

// ============================================================================
// Словари «бэка»: value → готовый label для отображения
// ============================================================================

export const SEASON_LABELS: Record<string, string> = {
  summer: "Летняя",
  winter: "Зимняя",
  "all-season": "Всесезонная",
};

export const TIRE_TYPE_LABELS: Record<string, string> = {
  passenger: "Легковая",
  suv: "Внедорожная",
  commercial: "Коммерческая",
};

export const COUNTRY_LABELS: Record<string, string> = {
  russia: "Россия",
  france: "Франция",
  finland: "Финляндия",
  japan: "Япония",
  italy: "Италия",
};

// ============================================================================
// Справочники фильтра (в value-формате)
// ============================================================================

export const ALL_DIAMETERS = Array.from({ length: 12 }, (_, i) => 13 + i); // 13..24

// ============================================================================
// Бренды
// ============================================================================

interface BrandDef {
  id: string;
  name: string;
  slug: string;
  country: string; // value-формат ("russia")
  priceBase: number; // базовая цена для самого маленького размера
  priceFactor: number; // множитель на размер
}

const BRANDS: BrandDef[] = [
  { id: "viatti", name: "Viatti", slug: "viatti", country: "russia", priceBase: 8000, priceFactor: 1.0 },
  { id: "michelin", name: "Michelin", slug: "michelin", country: "france", priceBase: 12000, priceFactor: 1.6 },
  { id: "nokian-tyres", name: "Nokian Tyres", slug: "nokian-tyres", country: "finland", priceBase: 10000, priceFactor: 1.3 },
  { id: "bridgestone", name: "Bridgestone", slug: "bridgestone", country: "japan", priceBase: 11000, priceFactor: 1.4 },
  { id: "pirelli", name: "Pirelli", slug: "pirelli", country: "italy", priceBase: 13000, priceFactor: 1.7 },
];

// ============================================================================
// Модели шин по брендам
// ============================================================================

interface ModelDef {
  slug: string;
  name: string;
  season: string;
  tireType: string;
  widths: number[];
  profiles: number[];
  diameters: number[];
  loadIndex: string;
  speedRating: string;
}

const MODELS: Record<string, ModelDef[]> = {
  viatti: [
    {
      slug: "viatti-strada-2",
      name: "V-130 Strada Asimmetrico",
      season: "summer",
      tireType: "passenger",
      widths: [175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315],
      profiles: [30, 35, 40, 45, 50, 55, 60, 65, 70],
      diameters: [14, 15, 16, 17, 18, 19, 20, 21, 22],
      loadIndex: "84",
      speedRating: "H",
    },
    {
      slug: "viatti-bosco",
      name: "V-125 Bosco",
      season: "winter",
      tireType: "passenger",
      widths: [165, 175, 185, 195, 205, 215, 225, 235, 245],
      profiles: [40, 45, 50, 55, 60, 65, 70],
      diameters: [14, 15, 16, 17, 18, 19],
      loadIndex: "88",
      speedRating: "T",
    },
    {
      slug: "viatti-nordico",
      name: "V-134 Nordico",
      season: "all-season",
      tireType: "suv",
      widths: [215, 225, 235, 245, 255, 265, 275, 285],
      profiles: [40, 45, 50, 55, 60, 65],
      diameters: [16, 17, 18, 19, 20, 21],
      loadIndex: "100",
      speedRating: "V",
    },
  ],
  michelin: [
    {
      slug: "michelin-primacy-4",
      name: "Primacy 4+",
      season: "summer",
      tireType: "passenger",
      widths: [185, 195, 205, 215, 225, 235, 245, 255],
      profiles: [35, 40, 45, 50, 55, 60, 65],
      diameters: [15, 16, 17, 18, 19, 20],
      loadIndex: "91",
      speedRating: "W",
    },
    {
      slug: "michelin-pilot-sport-5",
      name: "Pilot Sport 5",
      season: "summer",
      tireType: "passenger",
      widths: [205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305],
      profiles: [30, 35, 40, 45],
      diameters: [17, 18, 19, 20, 21, 22],
      loadIndex: "94",
      speedRating: "Y",
    },
    {
      slug: "michelin-alpin-7",
      name: "Alpin 7",
      season: "winter",
      tireType: "passenger",
      widths: [175, 185, 195, 205, 215, 225, 235, 245],
      profiles: [40, 45, 50, 55, 60, 65],
      diameters: [14, 15, 16, 17, 18, 19],
      loadIndex: "88",
      speedRating: "H",
    },
    {
      slug: "michelin-crossclimate-2",
      name: "CrossClimate 2",
      season: "all-season",
      tireType: "suv",
      widths: [205, 215, 225, 235, 245, 255, 265],
      profiles: [40, 45, 50, 55, 60],
      diameters: [16, 17, 18, 19, 20],
      loadIndex: "98",
      speedRating: "V",
    },
  ],
  "nokian-tyres": [
    {
      slug: "nokian-hakka-10",
      name: "Hakkapeliitta 10",
      season: "winter",
      tireType: "passenger",
      widths: [175, 185, 195, 205, 215, 225, 235, 245],
      profiles: [40, 45, 50, 55, 60, 65, 70],
      diameters: [14, 15, 16, 17, 18, 19],
      loadIndex: "88",
      speedRating: "T",
    },
    {
      slug: "nokian-hakka-blue-3",
      name: "Hakka Blue 3",
      season: "summer",
      tireType: "passenger",
      widths: [185, 195, 205, 215, 225, 235, 245, 255],
      profiles: [35, 40, 45, 50, 55, 60],
      diameters: [15, 16, 17, 18, 19, 20],
      loadIndex: "91",
      speedRating: "V",
    },
  ],
  bridgestone: [
    {
      slug: "bridgestone-turanza-t005",
      name: "Turanza T005",
      season: "summer",
      tireType: "passenger",
      widths: [185, 195, 205, 215, 225, 235, 245, 255],
      profiles: [35, 40, 45, 50, 55, 60, 65],
      diameters: [15, 16, 17, 18, 19, 20],
      loadIndex: "91",
      speedRating: "W",
    },
    {
      slug: "bridgestone-blizzak-lm005",
      name: "Blizzak LM005",
      season: "winter",
      tireType: "passenger",
      widths: [175, 185, 195, 205, 215, 225, 235],
      profiles: [40, 45, 50, 55, 60, 65, 70],
      diameters: [14, 15, 16, 17, 18, 19],
      loadIndex: "88",
      speedRating: "H",
    },
    {
      slug: "bridgestone-weather-control",
      name: "Weather Control A005",
      season: "all-season",
      tireType: "suv",
      widths: [205, 215, 225, 235, 245, 255, 265],
      profiles: [40, 45, 50, 55, 60],
      diameters: [16, 17, 18, 19, 20],
      loadIndex: "100",
      speedRating: "V",
    },
  ],
  pirelli: [
    {
      slug: "pirelli-p-zero",
      name: "P Zero",
      season: "summer",
      tireType: "passenger",
      widths: [205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305, 315],
      profiles: [25, 30, 35, 40, 45],
      diameters: [17, 18, 19, 20, 21, 22],
      loadIndex: "95",
      speedRating: "Y",
    },
    {
      slug: "pirelli-scorpion-verde",
      name: "Scorpion Verde",
      season: "all-season",
      tireType: "suv",
      widths: [215, 225, 235, 245, 255, 265, 275, 285],
      profiles: [40, 45, 50, 55, 60, 65],
      diameters: [16, 17, 18, 19, 20, 21, 22],
      loadIndex: "102",
      speedRating: "V",
    },
    {
      slug: "pirelli-ice-zero-2",
      name: "Ice Zero 2",
      season: "winter",
      tireType: "passenger",
      widths: [175, 185, 195, 205, 215, 225, 235, 245],
      profiles: [40, 45, 50, 55, 60, 65, 70],
      diameters: [14, 15, 16, 17, 18, 19],
      loadIndex: "88",
      speedRating: "T",
    },
  ],
};

// ============================================================================
// Генерация товаров
// ============================================================================

function generateProducts(): TireProduct[] {
  let codeCounter = 75631;
  let idCounter = 0;
  const products: TireProduct[] = [];

  for (const brand of BRANDS) {
    const brandModels = MODELS[brand.id];
    if (!brandModels) continue;

    for (const model of brandModels) {
      for (const diameter of model.diameters) {
        for (const width of model.widths) {
          for (const profile of model.profiles) {
            // Базовые ограничения реалистичности размеров
            if (profile < 25 || profile > 80) continue;
            // Для больших диаметров — более низкий профиль
            if (diameter >= 19 && profile > 55) continue;
            if (diameter <= 14 && profile < 55) continue;
            // Ширина не должна быть чрезмерной для малых диаметров
            if (diameter <= 15 && width > 245) continue;
            if (diameter <= 16 && width > 285) continue;

            const id = `tire-${idCounter++}`;
            const code = `АА-${String(codeCounter++).padStart(6, "0")}`;

            // Цена: базовая × коэффициент бренда × размерный фактор
            const sizeFactor = (width / 185) * (diameter / 15) * (1 + (70 - profile) / 100);
            const price = Math.round(brand.priceBase * brand.priceFactor * sizeFactor * 0.8);
            const oldPrice = Math.round(price * 1.12);

            const sizeSlug = `${width}-${profile}-r${diameter}-${model.loadIndex}${model.speedRating.toLowerCase()}`;
            const countryLabel = COUNTRY_LABELS[brand.country] ?? brand.country;
            const seasonLabel = SEASON_LABELS[model.season] ?? model.season;

            const sizeTitle = `${width}/${profile} R${diameter} ${model.loadIndex}${model.speedRating}`;

            products.push({
              id,
              slug: sizeSlug,
              category: "tires" as const,
              brandId: brand.id,
              brandName: brand.name,
              modelSlug: model.slug,
              modelName: model.name,
              width,
              profile,
              diameter,
              season: model.season,
              loadIndex: model.loadIndex,
              speedRating: model.speedRating,
              price,
              oldPrice,
              code,
              country: brand.country,
              countryLabel,
              year: "2025-2026",
              title: `Шина ${brand.name} ${model.name} ${sizeTitle} ${seasonLabel.toLowerCase()}`,
              sizeSlug,
              sizeTitle,
              quantity: ((idCounter * 7) % 20) + 1,
              image: "/assets/img/wheel-product.png",
              tireType: model.tireType,
              euLabel: {
                rollingResistance: ["A", "B", "C", "D"][idCounter % 4],
                wetGrip: ["A", "B", "C"][idCounter % 3],
                noiseEmission: 68 + (idCounter % 5),
              },
              parameters: [
                { name: "Код товара:", value: code },
                {
                  name: "Производитель:",
                  value: brand.name,
                  badge: true,
                  description: {
                    title: brand.name,
                    text: `${brand.name} — один из ведущих производителей автомобильных шин. Продукция проходит строгий контроль качества и соответствует международным стандартам безопасности.`,
                  },
                },
                {
                  name: "Страна производства:",
                  value: countryLabel,
                  badge: true,
                  description: {
                    title: `Страна производства — ${countryLabel}`,
                    text: `Производство осуществляется на современных заводах. Локализация позволяет оптимизировать издержки и предложить конкурентоспособные цены.`,
                  },
                },
                {
                  name: "Год выпуска:",
                  value: "2025-2026",
                  badge: true,
                  description: {
                    title: "Год выпуска — 2025-2026",
                    text: "Срок службы шин — 5 лет с даты изготовления. Рекомендуется обращать внимание на дату выпуска при покупке.",
                  },
                },
              ],
            });
          }
        }
      }
    }
  }

  return products;
}

export const ALL_PRODUCTS = generateProducts();

// ============================================================================
// Товары каталога (мок ответа бэка)
// ============================================================================

const PER_PAGE = 12;

/**
 * Мок эндпоинта товаров: фильтрация по параметрам + пагинация.
 * city — контекст запроса (региональные цены/наличие на реальном бэке);
 * в моке не влияет на данные — параметр существует для контракта.
 */
export function getCatalogProductsMock(
  filter: FilterState,
  city?: string,
): { items: TireProduct[]; total: number; page: number; perPage: number } {
  let items = [...ALL_PRODUCTS];

  if (filter.season) items = items.filter((p) => p.season === filter.season);
  if (filter.brand) items = items.filter((p) => p.brandId === filter.brand);
  if (filter.width) items = items.filter((p) => p.width === filter.width);
  if (filter.profile) items = items.filter((p) => p.profile === filter.profile);
  // diameter: number (15) или C-строка ("13c")
  if (filter.diameter != null) {
    const diameterNum = typeof filter.diameter === "number" ? filter.diameter : parseInt(filter.diameter, 10);
    items = items.filter((p) => p.diameter === diameterNum);
  }
  if (filter.priceMin != null) items = items.filter((p) => p.price >= filter.priceMin!);
  if (filter.priceMax != null) items = items.filter((p) => p.price <= filter.priceMax!);
  if (filter.country) items = items.filter((p) => p.country === filter.country);
  if (filter.studded) {
    // В моках у товаров нет признака шипов — фильтр не сужает (как delivery)
  }
  if (filter.delivery && filter.delivery.length > 0) {
    // В моках все товары доступны — фильтр delivery не сужает
  }

  const total = items.length;
  const page = filter.page ?? 1;
  const start = (page - 1) * PER_PAGE;
  const paged = items.slice(start, start + PER_PAGE);

  return { items: paged, total, page, perPage: PER_PAGE };
}

// ============================================================================
// Опции фильтра (вычисляются из товаров)
// ============================================================================

// Способы получения: label формирует «бэк», value — латинский slug = query
// Опции фильтра шин приходят с бэка (GET /api/reference/filter/tire);
// DELIVERY_OPTIONS остаётся для мока дисков (src/data/wheels.ts).
export const DELIVERY_OPTIONS: FilterOption[] = [
  { label: "Сегодня", value: "today" },
  { label: "Поставка 1-2 дня", value: "delivery-1-2" },
  { label: "Поставка 2-5 дней", value: "delivery-2-5" },
  { label: "Поставка 5-7 дней", value: "delivery-5-7" },
];

// ============================================================================
// Авто-словарь (4 марки)
// ============================================================================

export interface AutoBrandData {
  id: string;
  name: string;
  models: { slug: string; name: string }[];
}

export interface AutoYearData {
  years: number[];
}

export interface AutoModData {
  id: string;
  name: string;
  sizes: { width: number; profile: number; diameter: number }[];
}

export const AUTO_BRANDS: AutoBrandData[] = [
  {
    id: "bmw",
    name: "BMW",
    models: [
      { slug: "1-series", name: "1 Series" },
      { slug: "3-series", name: "3 Series" },
      { slug: "5-series", name: "5 Series" },
      { slug: "7-series", name: "7 Series" },
      { slug: "x1", name: "X1" },
      { slug: "x3", name: "X3" },
      { slug: "x5", name: "X5" },
      { slug: "x6", name: "X6" },
      { slug: "x7", name: "X7" },
      { slug: "m4", name: "M4" },
      { slug: "i4", name: "i4" },
      { slug: "ix", name: "iX" },
    ],
  },
  {
    id: "audi",
    name: "Audi",
    models: [
      { slug: "a3", name: "A3" },
      { slug: "a4", name: "A4" },
      { slug: "a5", name: "A5" },
      { slug: "a6", name: "A6" },
      { slug: "a7", name: "A7" },
      { slug: "q3", name: "Q3" },
      { slug: "q5", name: "Q5" },
      { slug: "q7", name: "Q7" },
      { slug: "q8", name: "Q8" },
      { slug: "e-tron", name: "e-tron" },
    ],
  },
  {
    id: "mercedes",
    name: "Mercedes-Benz",
    models: [
      { slug: "a-class", name: "A-Class" },
      { slug: "c-class", name: "C-Class" },
      { slug: "e-class", name: "E-Class" },
      { slug: "s-class", name: "S-Class" },
      { slug: "gla", name: "GLA" },
      { slug: "glc", name: "GLC" },
      { slug: "gle", name: "GLE" },
      { slug: "gls", name: "GLS" },
      { slug: "eqe", name: "EQE" },
      { slug: "eqs", name: "EQS" },
    ],
  },
  {
    id: "toyota",
    name: "Toyota",
    models: [
      { slug: "corolla", name: "Corolla" },
      { slug: "camry", name: "Camry" },
      { slug: "rav4", name: "RAV4" },
      { slug: "land-cruiser", name: "Land Cruiser" },
      { slug: "hilux", name: "Hilux" },
      { slug: "yaris", name: "Yaris" },
      { slug: "c-hr", name: "C-HR" },
      { slug: "highlander", name: "Highlander" },
      { slug: "supra", name: "Supra" },
    ],
  },
];

// Годы для всех моделей
export const AUTO_YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];

// Модификации (для BMW X6 2026 — из шаблона, остальные генерируем по запросу)
export const AUTO_MODIFICATIONS_BY_KEY: Record<string, AutoModData[]> = {
  "bmw:x6:2026": [
    {
      id: "xdrive30d",
      name: "xDrive 30d",
      sizes: [
        { width: 265, profile: 50, diameter: 19 },
        { width: 275, profile: 45, diameter: 20 },
        { width: 305, profile: 40, diameter: 20 },
        { width: 275, profile: 40, diameter: 21 },
        { width: 315, profile: 35, diameter: 21 },
        { width: 275, profile: 35, diameter: 22 },
        { width: 315, profile: 30, diameter: 22 },
      ],
    },
    { id: "xdrive40i", name: "xDrive 40i", sizes: [
      { width: 275, profile: 45, diameter: 20 },
      { width: 305, profile: 40, diameter: 20 },
    ] },
    { id: "m60i", name: "M60i", sizes: [
      { width: 275, profile: 40, diameter: 21 },
      { width: 315, profile: 35, diameter: 21 },
    ] },
  ],
  "bmw:x5:2026": [
    { id: "xdrive40i", name: "xDrive 40i", sizes: [
      { width: 255, profile: 55, diameter: 18 },
      { width: 275, profile: 45, diameter: 20 },
      { width: 315, profile: 35, diameter: 21 },
    ] },
  ],
  "audi:q7:2026": [
    { id: "45-tdi", name: "45 TDI quattro", sizes: [
      { width: 255, profile: 55, diameter: 19 },
      { width: 285, profile: 45, diameter: 20 },
      { width: 285, profile: 40, diameter: 21 },
    ] },
    { id: "55-tfsi", name: "55 TFSI quattro", sizes: [
      { width: 285, profile: 40, diameter: 21 },
      { width: 285, profile: 35, diameter: 22 },
    ] },
  ],
  "mercedes:gle:2026": [
    { id: "350d", name: "GLE 350 d", sizes: [
      { width: 255, profile: 55, diameter: 19 },
      { width: 275, profile: 50, diameter: 20 },
    ] },
    { id: "450", name: "GLE 450", sizes: [
      { width: 275, profile: 45, diameter: 21 },
      { width: 285, profile: 40, diameter: 22 },
    ] },
  ],
  "toyota:land-cruiser:2026": [
    { id: "300-v6", name: "Land Cruiser 300 V6", sizes: [
      { width: 265, profile: 65, diameter: 18 },
      { width: 265, profile: 55, diameter: 20 },
    ] },
    { id: "300-gr", name: "Land Cruiser 300 GR Sport", sizes: [
      { width: 265, profile: 55, diameter: 20 },
      { width: 285, profile: 50, diameter: 20 },
    ] },
  ],
};

// Годы для конкретных моделей (используем общий срез при отсутствии в этом объекте)
function getYearsForModel(key: string): number[] {
  if (AUTO_MODIFICATIONS_BY_KEY[key + ":2026"]) return AUTO_YEARS;
  // для моделей без модификаций — тоже возвращаем общий список
  return AUTO_YEARS.slice(0, 4);
}
export { getYearsForModel };

// Генерация модификаций для моделей без явных данных
export function generateModifications(brand: string, model: string, year: number): AutoModData[] {
  const key = `${brand}:${model}:${year}`;
  if (AUTO_MODIFICATIONS_BY_KEY[key]) return AUTO_MODIFICATIONS_BY_KEY[key];

  // Генерируем базовые модификации для SUV-моделей
  const suvModels = new Set(["x1", "x3", "x5", "x6", "x7", "ix", "q3", "q5", "q7", "q8", "e-tron", "gla", "glc", "gle", "gls", "rav4", "land-cruiser", "hilux", "highlander"]);
  const isSuv = suvModels.has(model);

  if (isSuv) {
    return [
      { id: "base", name: "Стандарт", sizes: [
        { width: 235, profile: 55, diameter: 18 },
        { width: 255, profile: 50, diameter: 19 },
      ] },
      { id: "sport", name: "Sport", sizes: [
        { width: 255, profile: 45, diameter: 20 },
        { width: 275, profile: 40, diameter: 21 },
      ] },
    ];
  }

  return [
    { id: "base", name: "Стандарт", sizes: [
      { width: 205, profile: 55, diameter: 16 },
      { width: 225, profile: 50, diameter: 17 },
    ] },
    { id: "sport", name: "Sport", sizes: [
      { width: 225, profile: 45, diameter: 18 },
      { width: 245, profile: 40, diameter: 19 },
    ] },
  ];
}

// ============================================================================
// Модель шины (для /tires/[modelSlug])
// ============================================================================

export interface TireModelData {
  slug: string;
  name: string;
  brandName: string;
  description: string;
  image: string;
  params: { name: string; value: string }[];
  sizesByDiameter: Record<string, TireProduct[]>;
}

export function getTireModel(slug: string): TireModelData | null {
  // Ищем модель в MODELS
  let modelDef: ModelDef | null = null;
  let brandDef: BrandDef | null = null;
  for (const brand of BRANDS) {
    const models = MODELS[brand.id];
    if (models) {
      const found = models.find((m) => m.slug === slug);
      if (found) {
        modelDef = found;
        brandDef = brand;
        break;
      }
    }
  }
  if (!modelDef || !brandDef) return null;

  const products = ALL_PRODUCTS.filter((p) => p.modelSlug === slug);
  const sizesByDiameter: Record<string, TireProduct[]> = {};
  for (const p of products) {
    const key = `r${p.diameter}`;
    if (!sizesByDiameter[key]) sizesByDiameter[key] = [];
    sizesByDiameter[key].push(p);
  }

  return {
    slug,
    name: modelDef.name,
    brandName: brandDef.name,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ante metus dictum at tempor commodo. Neque viverra justo nec ultrices dui. Risus ultricies tristique nulla aliquet enim.",
    image: "/assets/img/large.png",
    params: [
      { name: "Сезонность", value: SEASON_LABELS[modelDef.season] ?? modelDef.season },
      { name: "Назначение", value: TIRE_TYPE_LABELS[modelDef.tireType] ?? modelDef.tireType },
      { name: "Тип протектора", value: modelDef.season === "winter" ? "направленный" : "асимметричный" },
      { name: "Страна бренда", value: COUNTRY_LABELS[brandDef.country] ?? brandDef.country },
      { name: "Страна производства", value: COUNTRY_LABELS[brandDef.country] ?? brandDef.country },
      { name: "Год выпуска", value: "2025-2026" },
      { name: "Шипы", value: modelDef.season === "winter" && brandDef.id === "nokian-tyres" ? "Да" : "Нет" },
      { name: "Run flat", value: brandDef.id === "michelin" || brandDef.id === "pirelli" ? "Да" : "Нет" },
    ],
    sizesByDiameter,
  };
}

// ============================================================================
// Пары шин для auto-selected (результат подбора)
// ============================================================================

export interface AutoResultProduct {
  categorySection: string; // "Рекомендация производителя" | "Лучшая альтернатива"
  items: {
    sizeLabel: string; // "275/45 R20 - 305/40 R20" или "265/50 R19"
    sizeKeys: string[]; // ключи размеров для связи с CarOption.key
    sizes: { front: TireProduct; rear?: TireProduct }[];
  }[];
}

export function getAutoResult(brand: string, model: string, year: number, mod: string, filter?: FilterState): AutoResultProduct[] | null {
  const key = `${brand}:${model}:${year}`;
  const mods = AUTO_MODIFICATIONS_BY_KEY[key];
  if (!mods) return null;

  const modData = mods.find((m) => m.id === mod);
  if (!modData) return null;

  const result: AutoResultProduct[] = [];
  const sizes = modData.sizes;

  const szKey = (s: { width: number; profile: number; diameter: number }) =>
    `${s.width}-${s.profile}-${s.diameter}`;
  const sizeOf = (s: { width: number; profile: number; diameter: number }) =>
    `${s.width}/${s.profile} R${s.diameter}`;

  const matchProduct = (w: number, p: number, d: number) => {
    const product = findMatchingProduct(w, p, d);
    if (!product) return null;
    if (filter) {
      if (filter.priceMin != null && product.price < filter.priceMin) return null;
      if (filter.priceMax != null && product.price > filter.priceMax) return null;
      if (filter.country && product.country !== filter.country) return null;
    }
    return product;
  };

  const recommendedItems: AutoResultProduct["items"] = [];
  const altItems: AutoResultProduct["items"] = [];

  if (sizes[0]) {
    const p = matchProduct(sizes[0].width, sizes[0].profile, sizes[0].diameter);
    if (p) recommendedItems.push({ sizeLabel: sizeOf(sizes[0]), sizeKeys: [szKey(sizes[0])], sizes: [{ front: p }] });
  }

  if (sizes[1] && sizes[2]) {
    const front = matchProduct(sizes[1].width, sizes[1].profile, sizes[1].diameter);
    const rear = matchProduct(sizes[2].width, sizes[2].profile, sizes[2].diameter);
    if (front && rear) {
      recommendedItems.push({
        sizeLabel: `${sizeOf(sizes[1])} - ${sizeOf(sizes[2])}`,
        sizeKeys: [szKey(sizes[1]), szKey(sizes[2])],
        sizes: [{ front, rear }],
      });
    }
  }

  if (recommendedItems.length > 0) {
    result.push({ categorySection: "Рекомендация производителя", items: recommendedItems });
  }

  const alt = sizes.slice(3);
  for (let i = 0; i + 1 < alt.length; i += 2) {
    const front = matchProduct(alt[i].width, alt[i].profile, alt[i].diameter);
    const rear = matchProduct(alt[i + 1].width, alt[i + 1].profile, alt[i + 1].diameter);
    if (front && rear) {
      altItems.push({
        sizeLabel: `${sizeOf(alt[i])} - ${sizeOf(alt[i + 1])}`,
        sizeKeys: [szKey(alt[i]), szKey(alt[i + 1])],
        sizes: [{ front, rear }],
      });
    }
  }

  if (altItems.length > 0) {
    result.push({ categorySection: "Лучшая альтернатива", items: altItems });
  }

  return result.length > 0 ? result : null;
}

// ============================================================================
// CarBlock — блок выбранного авто с чекбоксами размеров (auto-selected)
// ============================================================================

export interface CarOption {
  label: string;
  width: number;
  height?: number; // профиль (для шин), для дисков отсутствует
  diameter: number;
  checked?: boolean;
  key: string; // "w-p-d" для связи с AutoResultProduct.items[].sizeKeys
  pcd?: string; // диски
  et?: number; // диски
}

export interface CarSectionData {
  name: string;
  options: CarOption[];
}

export interface CarBlockData {
  name: string;
  sections: CarSectionData[];
}

export function getCarBlock(brand: string, model: string, year: number, mod: string): CarBlockData | null {
  const key = `${brand}:${model}:${year}`;
  const mods = AUTO_MODIFICATIONS_BY_KEY[key];
  if (!mods) return null;

  const modData = mods.find((m) => m.id === mod);
  if (!modData) return null;

  const carBrand = AUTO_BRANDS.find((b) => b.id === brand);
  const carModel = carBrand?.models.find((m) => m.slug === model);
  const sizes = modData.sizes;

  const szKey = (s: { width: number; profile: number; diameter: number }) =>
    `${s.width}-${s.profile}-${s.diameter}`;
  const sizeOf = (s: { width: number; profile: number; diameter: number }) =>
    `${s.width}/${s.profile} R${s.diameter}`;

  const sections: CarSectionData[] = [];

  const recommended: CarOption[] = [];
  if (sizes[0]) {
    recommended.push({ label: sizeOf(sizes[0]), width: sizes[0].width, height: sizes[0].profile, diameter: sizes[0].diameter, key: szKey(sizes[0]), checked: true });
  }
  if (sizes[1] && sizes[2]) {
    recommended.push({
      label: `${sizeOf(sizes[1])} - ${sizeOf(sizes[2])}`,
      width: sizes[2].width, height: sizes[2].profile, diameter: sizes[2].diameter,
      key: szKey(sizes[1]),
    });
  }
  if (recommended.length) sections.push({ name: "Рекомендовано", options: recommended });

  const alt: CarOption[] = [];
  const rest = sizes.slice(3);
  for (let i = 0; i + 1 < rest.length; i += 2) {
    alt.push({
      label: `${sizeOf(rest[i])} - ${sizeOf(rest[i + 1])}`,
      width: rest[i + 1].width, height: rest[i + 1].profile, diameter: rest[i + 1].diameter,
      key: szKey(rest[i]),
    });
  }
  if (alt.length) sections.push({ name: "Лучшая альтернатива", options: alt });

  return {
    name: `${carBrand?.name ?? brand} ${carModel?.name ?? model} ${modData.name}, ${year} г.`,
    sections,
  };
}

function findMatchingProduct(width: number, profile: number, diameter: number): TireProduct | null {
  return ALL_PRODUCTS.find(
    (p) => p.width === width && p.profile === profile && p.diameter === diameter,
  ) ?? null;
}

// ============================================================================
// SEO-контент (статичный, из шаблона .template/catalog/index.html)
// ============================================================================

export const SEO_CONTENT: SeoContent = {
  title: "Шины в Челябинске",
  subtitle: "Шины Viatti",
  features: [
    "Особенности шин Viatti",
    "Летняя резина Viatti — надёжное сцепление на сухом и мокром асфальте, низкий уровень шума, длительный срок службы.",
    "Зимняя резина Viatti — отличное сцепление на снегу и льду, износостойкий компаунд, устойчивость к низким температурам.",
  ],
  advantages: "Почему выгодно покупать шины у нас: прямые поставки от производителей, гарантия качества, быстрая доставка по Челябинску и области, профессиональный шиномонтаж.",
  sizes: ALL_DIAMETERS.filter((d) => d >= 13 && d <= 18).map((d) => `R${d}`),
};

/**
 * Мок эндпоинта SEO-контента каталога.
 * city — контекст запроса (тексты/преимущества по городу на реальном бэке);
 * в моке контент статичен — параметр существует для контракта.
 */
export function getSeoContentMock(city?: string): SeoContent {
  return SEO_CONTENT;
}
