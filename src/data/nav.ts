// Навигация и константы из мокапа (.template/index.html)

export const PHONE_DISPLAY = "+7 (351) 70-00-319";
export const PHONE_FOOTER = "8-351-700-03-19";
export const FOOTER_CITY = "2023 г. Автоальянс";

export interface NavLink {
  label: string;
  href: string;
}

export const HEADER_NAV: NavLink[] = [
  { label: "Отзывы о нас", href: "#" },
  { label: "Новости и акции", href: "#" },
  { label: "Статьи", href: "/articles" },
  { label: "Доставка", href: "#" },
  { label: "Оплата", href: "#" },
  { label: "Возврат", href: "#" },
  { label: "Контакты", href: "#" },
];

export interface MenuGroup {
  title: string;
  chevron: boolean;
  items: NavLink[];
}

export const CATALOG_MENU_GROUPS: MenuGroup[] = [
  {
    title: "Каталог",
    chevron: true,
    items: [
      { label: "Компания", href: "#" },
      { label: "Новости и акции", href: "#" },
      { label: "Статьи", href: "/articles" },
      { label: "Доставка", href: "#" },
      { label: "Оплата", href: "#" },
    ],
  },
  {
    title: "Компания",
    chevron: false,
    items: [
      { label: "Сервис", href: "#" },
      { label: "Доставка и оплата", href: "#" },
      { label: "Гарантия", href: "#" },
      { label: "Отзывы", href: "#" },
      { label: "Магазины", href: "#" },
    ],
  },
];

export const FOOTER_GROUPS: NavLink[][] = [
  [
    { label: "Каталог", href: "/catalog/tires" },
    { label: "Компания", href: "#" },
    { label: "Новости и акции", href: "#" },
    { label: "Статьи", href: "/articles" },
    { label: "Доставка", href: "#" },
    { label: "Оплата", href: "#" },
  ],
  [
    { label: "Компания", href: "#" },
    { label: "Сервис", href: "#" },
    { label: "Доставка и оплата", href: "#" },
    { label: "Гарантия", href: "#" },
    { label: "Отзывы", href: "#" },
    { label: "Магазины", href: "#" },
  ],
];

// Иконки соцсетей: файлы в /assets/img/
export const SOCIALS_MENU = ["tg", "wa", "vib", "vk", "youtube"];
export const SOCIALS_FOOTER = ["tg", "wa", "vib", "vk", "fb", "inst", "youtube"];

export const BENEFITS = [
  { mod: "red", text: "20% на услуги шиномонтажа" },
  { mod: "gold", text: "Сборка комплекта шин и дисков бесплатно" },
  { mod: "green", text: "Хранение до монтажа бесплатно" },
] as const;
