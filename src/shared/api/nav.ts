// Layout: навигация, подвал, меню (плашки-бейджи приходят с данными страницы)
// Меню ссылок на системные статьи — живой API (05.11.2026):
//   GET /api/reference/article-menu → {data: {header, footer}}
import {
  PHONE,
  CATALOG_MENU_GROUPS,
  SOCIALS,
  MENU_SOCIALS,
  FOOTER_COPYRIGHT,
} from "@/data/nav";
import type { MenuGroup } from "@/data/nav";
import type { ArticleMenuDto, ArticleMenuItemDto } from "@/features/articles/types";
import { apiBase } from "./base";

/** Ссылка шапки/футера: адрес и подпись */
export interface ServicePageLink {
  link: string;
  link_name: string;
}

export interface NavData {
  phone: typeof PHONE;
  /** Шапка (navigation-block): фикс-пункты + меню системных статей */
  headerLinks: ServicePageLink[];
  /** Футер: фикс-пункты + меню системных статей */
  footerLinks: ServicePageLink[];
  catalogMenuGroups: MenuGroup[];
  socials: readonly string[];
  menuSocials: readonly string[];
  footerCopyright: string;
}

/** Фиксированные пункты стоят вокруг меню и не зависят от API */
const HEADER_FIXED_START: ServicePageLink[] = [
  { link: "/booking", link_name: "Шиномонтаж" },
];
const HEADER_FIXED_END: ServicePageLink[] = [
  { link: "/articles", link_name: "Статьи" },
];
const FOOTER_FIXED_START: ServicePageLink[] = [
  { link: "/catalog/tires", link_name: "Каталог" },
];
const FOOTER_FIXED_END: ServicePageLink[] = [
  { link: "/articles", link_name: "Статьи" },
];

// Меню шапки висит на layout каждой страницы: зависший бэк не должен вешать SSR
const ARTICLE_MENU_TIMEOUT_MS = 3000;

function toServicePageLink(item: ArticleMenuItemDto): ServicePageLink {
  return { link: `/service-page/${item.slug}`, link_name: item.title };
}

/** Меню → ссылки; без меню (API недоступен) остаются только фикс-пункты */
export function toNavLinks(menu: ArticleMenuDto | null): {
  headerLinks: ServicePageLink[];
  footerLinks: ServicePageLink[];
} {
  const header = menu?.header.map(toServicePageLink) ?? [];
  const footer = menu?.footer.map(toServicePageLink) ?? [];

  return {
    headerLinks: [...HEADER_FIXED_START, ...header, ...HEADER_FIXED_END],
    footerLinks: [...FOOTER_FIXED_START, ...footer, ...FOOTER_FIXED_END],
  };
}

export async function getArticleMenu(): Promise<ArticleMenuDto | null> {
  try {
    const res = await fetch(`${apiBase()}/reference/article-menu`, {
      signal: AbortSignal.timeout(ARTICLE_MENU_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const body: { data: ArticleMenuDto } = await res.json();

    return body.data;
  } catch {
    return null;
  }
}

export async function getNav(): Promise<NavData> {
  const { headerLinks, footerLinks } = toNavLinks(await getArticleMenu());

  return {
    phone: PHONE,
    headerLinks,
    footerLinks,
    catalogMenuGroups: CATALOG_MENU_GROUPS,
    socials: SOCIALS,
    menuSocials: MENU_SOCIALS,
    footerCopyright: FOOTER_COPYRIGHT,
  };
}
