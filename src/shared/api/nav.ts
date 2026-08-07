// Layout: навигация, подвал, меню, бенефиты
import {
  PHONE,
  CATALOG_MENU_GROUPS,
  SOCIALS,
  MENU_SOCIALS,
  FOOTER_COPYRIGHT,
} from "@/data/nav";
import type { MenuGroup } from "@/data/nav";
import { HOME_DATA } from "@/data/products";
import { SERVICE_PAGES } from "@/data/servicePages";
import type { ServicePageLink, ServicePage } from "@/data/servicePages";
import type { AttentionBlock } from "@/features/home/types";
import { delay } from "./base";

export type { ServicePageLink, ServicePage };

export interface NavData {
  phone: typeof PHONE;
  /** Шапка (navigation-block): items блока type=header из /api/service_pages */
  headerLinks: ServicePageLink[];
  /** Футер: items блока type=footer из /api/service_pages */
  footerLinks: ServicePageLink[];
  catalogMenuGroups: MenuGroup[];
  socials: readonly string[];
  menuSocials: readonly string[];
  /** Плашки .benefits — attention_blocks из /api/service-page/main */
  attentionBlocks: AttentionBlock[];
  footerCopyright: string;
}

export async function getNav(): Promise<NavData> {
  const headerLinks =
    SERVICE_PAGES.find((b) => b.type === "header")?.items ?? [];
  const footerLinks =
    SERVICE_PAGES.find((b) => b.type === "footer")?.items ?? [];
  return delay(50, {
    phone: PHONE,
    headerLinks,
    footerLinks,
    catalogMenuGroups: CATALOG_MENU_GROUPS,
    socials: SOCIALS,
    menuSocials: MENU_SOCIALS,
    attentionBlocks: HOME_DATA.attention_blocks,
    footerCopyright: FOOTER_COPYRIGHT,
  });
}
