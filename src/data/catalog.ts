// Мок-данные каталога (фаза 2, 03.08.2026)
// Товары для мок-страницы товара и словари фильтра; авто-каскад шин с 20.10.2026 — живой.
// Мок имитирует ответ бэкенда: value — латинские slug (совпадают с URL),
// label/готовые строки формируются здесь (как это сделает API).
import type { TireProduct } from "@/features/catalog/types";
import type { ProductParam } from "@/shared/types/product";

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
      slug: "strada-2",
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
      slug: "bosco",
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
      slug: "nordico",
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
      slug: "primacy-4",
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
      slug: "pilot-sport-5",
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
      slug: "alpin-7",
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
      slug: "crossclimate-2",
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
      slug: "hakka-10",
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
      slug: "hakka-blue-3",
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
      slug: "turanza-t005",
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
      slug: "blizzak-lm005",
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
      slug: "weather-control",
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
      slug: "p-zero",
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
      slug: "scorpion-verde",
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
      slug: "ice-zero-2",
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

/** Плашка строки «Самовывоз» карточки (у бэка — origin.delivery_days_after_order, город по умолчанию). */
export const PICKUP_BADGE: ProductParam = {
  name: "Самовывоз",
  value: "8 авг (сб)",
  badge: true,
  description: {
    title: "8 авг (сб)",
    text: "Самовывоз осуществляется из центрального офиса.<br>Адрес: Челябинск, Свердловский тракт 3Н (Автоальянс)<br>Время работы: рабочие дни 09:00–19:00, выходные 09:00–17:00",
  },
};

/** Плашка строки «Доставка до ПВЗ» карточки (у бэка — origin.pick_up.pick_up_point, город по умолчанию). */
export const PVZ_BADGE: ProductParam = {
  name: "Доставка до ПВЗ",
  value: "бесплатно",
  badge: true,
  description: {
    title: "бесплатно",
    text: "Доставка осуществляется, по согласованию с заказчиком, с 9:00 до 20:00.<br>Доставка осуществляется в пределах городской черты. Стоимость доставки 400р.<br>Доставка в отдаленные районы города согласно тарифам доставки в удаленные районы.",
  },
};

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
              ean: 'AAA',
              slug: sizeSlug,
              category: "tires" as const,
              brandId: brand.id,
              brandName: brand.name,
              brandSlug: brand.slug,
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
              pickup: PICKUP_BADGE,
              pvzDelivery: PVZ_BADGE,
            });
          }
        }
      }
    }
  }

  return products;
}

export const ALL_PRODUCTS = generateProducts();
