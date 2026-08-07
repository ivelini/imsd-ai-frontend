// Мок стартовой страницы каталога (05.08.2026)
// Имитация GET /api/catalog-start (карточки + бренды) — из .template/catalog/start.html.
// Ссылки — реальные роуты фронта; бренды — транслит (конвенция slug).
import type {
  CatalogStartCard,
  BrandLink,
  CatalogStartData,
} from "@/features/catalog/types";

export type { CatalogStartCard, BrandLink, CatalogStartData };

const TIRE_BRANDS = [
  "Viatti", "Michelin", "Nokian Tyres", "Bridgestone", "Continental",
  "Pirelli", "Goodyear", "Yokohama", "Hankook", "Dunlop",
  "Cordiant", "Toyo", "Кама", "Matador",
];

const WHEEL_BRANDS = [
  "ЛС", "Replica", "Concept", "Tech Line", "X-Race", "КиК",
  "СКАД", "N4", "Megalit", "YST", "Aero Wheel", "Trebl",
];

// Транслит кириллицы (конвенция: value — всегда латинский slug, см. api-contract)
const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

const slugify = (name: string) =>
  name
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const CATALOG_START: CatalogStartData = {
  cards: [
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
  ],
  tireBrands: TIRE_BRANDS.map((name) => ({
    link: `/catalog/tires/${slugify(name)}`,
    link_name: name,
  })),
  wheelBrands: WHEEL_BRANDS.map((name) => ({
    link: `/catalog/wheels/${slugify(name)}`,
    link_name: name,
  })),
};
