"use client";

import Link from "next/link";
import { CATALOG_MENU_GROUPS, PHONE_DISPLAY, SOCIALS_MENU } from "@/data/nav";
import { useUIStore } from "@/stores/useUIStore";
import { CloseIcon, LinkChevronIcon, SearchIcon } from "./icons";

export function CatalogMenu() {
  const { menuOpen, setMenuOpen } = useUIStore();
  return (
    <div
      className={menuOpen ? "catalog-hidden-menu catalog-page-open" : "catalog-hidden-menu catalog-page-hide"}
    >
      <div className="catalog-page-panel">
        <div></div>
        <div className="catalog-page-logo">
          <img src="/assets/img/logo.svg" alt="Автоальянс" />
        </div>
        <button
          type="button"
          className="catalog-page-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Закрыть меню"
        >
          <CloseIcon />
        </button>
      </div>
      <div className="search-input catalog-page-seacrh-input">
        <input type="text" placeholder="Поиск по товарам" />
        <SearchIcon />
      </div>
      {CATALOG_MENU_GROUPS.map((group) => (
        <div className="catalog-page-link-group" key={group.title}>
          <h3 className="link-group-title">{group.title}</h3>
          {group.items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="link-group-item"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              {group.chevron && <LinkChevronIcon />}
            </Link>
          ))}
        </div>
      ))}
      <div className="catalog-page-footer">
        <p className="catalog-page-num">{PHONE_DISPLAY}</p>
        <button className="catalog-page-btn" type="button">
          Заказать звонок
        </button>
        <div className="social-links-blk">
          {SOCIALS_MENU.map((s) => (
            <a key={s} href="#" className="social-links-item">
              <img src={`/assets/img/${s}.svg`} alt="" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
