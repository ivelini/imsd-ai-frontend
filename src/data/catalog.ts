// Мок-данные каталога из разметки мокапа (.template/catalog/*)
// Фаза 2: заменить на API (Laravel)

export interface EuLabel {
  rolling: string; // A–G
  wet: string; // A–G
  noise: string; // дБ
}

export interface TireProduct {
  id: string;
  modelSlug: string;
  name: string; // полное имя товара
  size: string; // "185/60 R15"
  diameter: number; // 15
  code: string; // "АА-00075632"
  price: number;
  oldPrice: number;
  availability: number;
  eu: EuLabel;
  season: "летняя" | "зимняя" | "всесезонная";
  brand: string; // "Viatti"
  country: string; // "Россия"
  year: string; // "2025-2026"
  image: string;
  linkTitle: boolean; // заголовок-ссылка в карточке каталога
}

export interface TireModel {
  slug: string;
  brand: string;
  name: string; // "Viatti V-130 Strada Asimmetrico"
  fullName: string; // с типоразмером для товара
  description: string;
  params: { name: string; value: string }[];
  sizes: TireProduct[]; // типоразмеры в наличии (группируются по диаметру)
}

let n = 0;
function makeTire(partial: Partial<TireProduct> & { size: string; diameter: number }): TireProduct {
  n += 1;
  return {
    id: partial.id ?? `tire-${n}`,
    modelSlug: "viatti-v130-strada-asimmetrico",
    name: `Шина Viatti V-130 Strada Asimmetrico ${partial.size} 84H летняя`,
    code: `АА-0007${String(n).padStart(4, "0")}`,
    price: 29999,
    oldPrice: 32200,
    availability: 9,
    eu: { rolling: "C", wet: "B", noise: "69" },
    season: "летняя",
    brand: "Viatti",
    country: "Россия",
    year: "2025-2026",
    image: "/assets/img/wheel-product.png",
    linkTitle: false,
    ...partial,
  };
}

export const VIATTI_MODEL: TireModel = {
  slug: "viatti-v130-strada-asimmetrico",
  brand: "Viatti",
  name: "Viatti V-130 Strada Asimmetrico",
  fullName: "Шина летняя Viatti V-130 Strada Asimmetrico 185/60 R15 84H",
  description:
    "Viatti V-130 Strada Asimmetrico — летняя шина с асимметричным рисунком протектора, ориентированная на асфальтовые дороги. Обеспечивает уверенное поведение на мокром и сухом покрытии, низкий уровень шума и износостойкость.",
  params: [
    { name: "Сезонность", value: "летняя" },
    { name: "Назначение", value: "легковые" },
    { name: "Рисунок протектора", value: "асимметричный" },
    { name: "Страна бренда", value: "Россия" },
    { name: "Страна производства", value: "Россия" },
    { name: "Год выпуска", value: "2025" },
    { name: "Шипы", value: "нет" },
    { name: "Run flat", value: "нет" },
  ],
  sizes: [
    makeTire({ id: "viatti-r14-175-70", size: "175/70 R14", diameter: 14, linkTitle: true }),
    makeTire({ id: "viatti-r15-185-60", size: "185/60 R15", diameter: 15, linkTitle: true }),
    makeTire({ id: "viatti-r15-185-65", size: "185/65 R15", diameter: 15, linkTitle: true }),
    makeTire({ id: "viatti-r16-205-55", size: "205/55 R16", diameter: 16, linkTitle: true }),
  ],
};

export const TIRE_MODELS: TireModel[] = [VIATTI_MODEL];

// Фильтр каталога: списки селектов (значения из .template/catalog/filter-applied.html)
export const FILTER_OPTIONS = {
  width: ["175", "185", "195", "205", "215", "225", "235", "245", "255", "265", "275", "285", "295", "305", "315"],
  profile: ["30", "35", "40", "45", "50", "55", "60", "65", "70", "75"],
  diameter: ["R14", "R15", "R16", "R17", "R18", "R19", "R20", "R21", "R22"],
  season: ["летняя", "зимняя", "всесезонная"],
  tireType: ["легковые", "SUV", "грузовые"],
  manufacturer: ["Viatti", "Continental", "Nokian", "Michelin"],
  country: ["Россия", "Китай", "Япония", "Германия"],
};

export const DELIVERY_OPTIONS = [
  { id: "today", label: "Сегодня" },
  { id: "1-2", label: "1-2 дня" },
  { id: "2-5", label: "2-5 дней" },
  { id: "5-7", label: "5-7 дней" },
] as const;

// Подбор по автомобилю (.template/catalog/auto.html, auto-selected.html)
export interface AutoModification {
  slug: string;
  name: string; // "xDrive 30d"
  sizes: string[]; // рекомендованные типоразмеры
}
export interface AutoYear {
  year: number;
  modifications: AutoModification[];
}
export interface AutoModelEntry {
  slug: string;
  name: string; // "X6"
  years: AutoYear[];
}
export interface AutoBrandEntry {
  slug: string;
  name: string;
  models: AutoModelEntry[];
}

const BMW_MODELS = ["1-series", "3-series", "5-series", "7-series", "X1", "X3", "X5", "X6", "X7", "M4", "i4", "iX"];

export const AUTO_BRANDS: AutoBrandEntry[] = [
  {
    slug: "bmw",
    name: "BMW",
    models: BMW_MODELS.map((m) => ({
      slug: m.toLowerCase(),
      name: m,
      years: [2026, 2025, 2024].map((year) => ({
        year,
        modifications:
          m === "x6"
            ? [
                { slug: "xdrive-30d", name: "xDrive 30d", sizes: ["265/50 R19", "275/45 R20", "305/40 R20", "275/40 R21", "315/35 R21", "275/35 R22", "315/30 R22"] },
                { slug: "xdrive40i", name: "xDrive40i", sizes: ["265/45 R20", "275/40 R21"] },
              ]
            : [{ slug: "base", name: "Base", sizes: ["205/60 R16", "225/55 R17"] }],
      })),
    })),
  },
];

// Результат подбора: секции-пары (auto-selected.html): категории + пары из 2 карточек
export interface PairProduct {
  size: string;
  products: [TireProduct, TireProduct]; // 2-я карточка — с product-pair
}

export interface AutoResultCategory {
  title: string; // "Рекомендация производителя" / "Лучшая альтернатива"
  size: string;
  pairs: PairProduct[];
}

function pairOf(size: string, base: Partial<TireProduct> = {}): PairProduct {
  const first = makeTire({ ...base, size, diameter: Number(size.split("/")[1].replace(" R", "")) || 19, price: 29999 });
  const second = makeTire({ ...base, size, diameter: first.diameter, price: 27999, id: `${first.id}-pair` });
  return { size, products: [first, second] };
}

export const AUTO_RESULT: AutoResultCategory[] = [
  {
    title: "Рекомендация производителя",
    size: "265/50 R19",
    pairs: [
      pairOf("265/50 R19"),
      pairOf("275/45 R20"),
      pairOf("275/40 R21"),
      pairOf("275/35 R22"),
    ],
  },
  {
    title: "Лучшая альтернатива",
    size: "275/45 R20",
    pairs: [
      pairOf("275/45 R20", { price: 25999 }),
      pairOf("305/40 R20", { price: 26999 }),
      pairOf("315/35 R21", { price: 28999 }),
      pairOf("315/30 R22", { price: 30999 }),
    ],
  },
];

// SEO-блок (.template/catalog/index.html)
export const SEO_BLOCK = {
  title: "Шины на авто в Челябинске",
  subtitle:
    "В интернет-магазине Автоальянс представлены шины ведущих производителей: летние, зимние и всесезонные. Подберите шины по параметрам автомобиля или типоразмеру — наличие и цены обновляются ежедневно.",
  sizes: ["R13", "R14", "R15", "R16", "R17", "R18", "R19", "R20", "R21", "R22"],
};
