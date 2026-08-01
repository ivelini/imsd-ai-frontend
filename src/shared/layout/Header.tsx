// Шапка: город/телефон, меню, бургер, логотип, поиск, user-panel (фаза 1)
"use client";

import { NAV_LINKS, PHONE } from "@/data/nav";
import { useUIStore } from "@/stores/useUIStore";
import { selectCartCount, useCartStore } from "@/stores/useCartStore";
import { ArrowDownRedIcon, BurgerIcon, CatalogIcon, PinHeaderIcon, SearchIcon } from "./icons";

export function Header() {
  const city = useUIStore((s) => s.city);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);
  const setMenuOpen = useUIStore((s) => s.setMenuOpen);
  const count = useCartStore(selectCartCount);

  return (
    <header className="container">
      <div className="header-container">
        <div className="header-location-block">
          <p className="header-location-block-main">
            <span className="choice-city-h">Ваш город:</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setGeoOpen(true); }}>
              <PinHeaderIcon />
              <span className="city-in-header">{city}</span>
              <ArrowDownRedIcon />
            </a>
          </p>
          <p className="header-number">{PHONE.header}</p>
        </div>
        <div className="navigation-block">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Дополнительное меню */}
      <div className="additional-menu">
        <div className="gr1">
          <div id="hide-show-catalog" onClick={() => setMenuOpen(true)}>
            <BurgerIcon />
          </div>
          <div className="logo">
            <img src="/assets/img/logo.svg" alt="" />
          </div>
          <div className="catalog-button">
            <CatalogIcon />
            <a href="#" id="get-catalog">Каталог</a>
          </div>
        </div>
        <div className="gr2">
          <div className="search-input">
            <input type="text" placeholder="Поиск по товарам" />
            <SearchIcon />
          </div>
          <div className="user-panel">
            <div className="status-order header-icon-and-btn" id="order-status">
              <img src="/assets/img/note.svg" alt="" />
              <p className="header-icon-and-btn-text hide-on-mobile">Статус заказа</p>
              <p className="header-icon-and-btn-text show-on-mobile">Мой заказ</p>
            </div>
            <div className="login header-icon-and-btn" id="header-login">
              <img src="/assets/img/login.svg" alt="" />
              <p className="header-icon-and-btn-text">Войти</p>
            </div>
            <div className="cart header-icon-and-btn" id="busket">
              <img src="/assets/img/busket.svg" alt="" />
              <p className="header-icon-and-btn-text">Корзина</p>
              <span id="count-in-busket">{count}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
