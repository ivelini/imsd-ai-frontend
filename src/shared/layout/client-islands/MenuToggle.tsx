// Кнопка открытия CatalogMenu: бургер и кнопка «Каталог»
"use client";

import { useUIStore } from "@/stores/useUIStore";
import { BurgerIcon, CatalogIcon } from "@/shared/layout/icons";

interface MenuToggleProps {
  variant: "burger" | "catalog";
}

export function MenuToggle({ variant }: MenuToggleProps) {
  const setMenuOpen = useUIStore((s) => s.setMenuOpen);

  if (variant === "burger") {
    return (
      <div id="hide-show-catalog" onClick={() => setMenuOpen(true)}>
        <BurgerIcon />
      </div>
    );
  }

  return (
    <div className="catalog-button">
      <CatalogIcon />
      <a href="#" id="get-catalog">
        Каталог
      </a>
    </div>
  );
}
