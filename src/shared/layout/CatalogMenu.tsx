// Выпадающее меню «Каталог»: .catalog-hidden-menu (03.08.2026)
"use client";

import type { NavData } from "@/shared/api/data";
import { useUIStore } from "@/stores/useUIStore";
import { Button } from "@/shared/ui/Button";
import { ChevronRightIcon, CloseIcon, SearchIcon } from "./icons";

interface CatalogMenuProps {
  nav: NavData;
}

export function CatalogMenu({ nav }: CatalogMenuProps) {
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
      {nav.catalogMenuGroups.map((group) => (
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
        <p className="catalog-page-num">{nav.phone.menu}</p>
        <Button className="catalog-page-btn">Заказать звонок</Button>
        <div className="social-links-blk">
          {nav.menuSocials.map((s) => (
            <a href="#" className="social-links-item" key={s}>
              <img src={`/assets/img/${s}.svg`} alt="" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
