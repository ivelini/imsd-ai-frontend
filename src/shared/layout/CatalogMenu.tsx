// Выпадающее меню «Каталог»: .catalog-hidden-menu (фаза 1)
"use client";

import { CATALOG_MENU_GROUPS, MENU_SOCIALS, PHONE } from "@/data/nav";
import { useUIStore } from "@/stores/useUIStore";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon, CloseIcon, SearchIcon } from "./icons";

export function CatalogMenu() {
  const open = useUIStore((s) => s.menuOpen);
  const setOpen = useUIStore((s) => s.setMenuOpen);

  return (
    <div className={`catalog-hidden-menu ${open ? "catalog-page-open" : "catalog-page-hide"}`} id="catalog-menu">
      <div className="catalog-page-panel">
        <div></div>
        <div className="catalog-page-logo">
          <img src="/assets/img/logo.svg" alt="" />
        </div>
        <div className="catalog-page-close" onClick={() => setOpen(false)}>
          <CloseIcon />
        </div>
      </div>
      <div className="search-input catalog-page-seacrh-input">
        <input type="text" placeholder="Поиск по товарам" />
        <SearchIcon />
      </div>
      {CATALOG_MENU_GROUPS.map((group) => (
        <div className="catalog-page-link-group" key={group.title}>
          <h3 className="link-group-title">{group.title}</h3>
          {group.items.map((item) => (
            <a href={item.href} className="link-group-item" key={item.label}>
              {item.label}
              {group.withArrow && <ChevronRightIcon />}
            </a>
          ))}
        </div>
      ))}
      <div className="catalog-page-footer">
        <p className="catalog-page-num">{PHONE.menu}</p>
        <Button className="catalog-page-btn">Заказать звонок</Button>
        <div className="social-links-blk">
          {MENU_SOCIALS.map((s) => (
            <a href="#" className="social-links-item" key={s}>
              <img src={`/assets/img/${s}.svg`} alt="" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
