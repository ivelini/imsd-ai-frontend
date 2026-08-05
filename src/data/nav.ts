// Меню, подвал, соцсети, бенефиты из .template/*.html
// Фаза 1: заменить на API (Laravel) при появлении страниц.
// NAV_LINKS/FOOTER_GROUPS удалены (05.08.2026): ссылки шапки/футера приходят
// с бэка по GET /api/service_pages → src/data/servicePages.ts.

export interface NavLink {
  label: string;
  href: string;
}

export const PHONE = {
  header: "+7 (351) 70-00-319",
  menu: "8 (351) 7000-319",
  footer: "8-351-700-03-19",
};

export interface MenuGroup {
  title: string;
  items: NavLink[];
  withArrow: boolean; // шеврон у пунктов (группа «Каталог»)
}

export const CATALOG_MENU_GROUPS: MenuGroup[] = [
  {
    title: "Каталог",
    withArrow: true,
    items: [
      { label: "Компания", href: "#" },
      { label: "Новости и акции", href: "#" },
      { label: "Статьи", href: "#" },
      { label: "Доставка", href: "#" },
      { label: "Оплата", href: "#" },
    ],
  },
  {
    title: "Компания",
    withArrow: false,
    items: [
      { label: "Сервис", href: "#" },
      { label: "Доставка и оплата", href: "#" },
      { label: "Гарантия", href: "#" },
      { label: "Отзывы", href: "#" },
      { label: "Магазины", href: "#" },
    ],
  },
];

export const SOCIALS = ["tg", "wa", "vib", "vk", "fb", "inst", "youtube"] as const;

export const MENU_SOCIALS = ["tg", "wa", "vib", "vk", "youtube"] as const;

export interface Benefit {
  type: "red" | "gold" | "green";
  text: string;
}

export const BENEFITS: Benefit[] = [
  { type: "red", text: "20% на услуги шиномонтажа" },
  { type: "gold", text: "Сборка комплекта шин и дисков бесплатно" },
  { type: "green", text: "Хранение до монтажа бесплатно" },
];

export const FOOTER_COPYRIGHT = "2023 г. Автоальянс";
