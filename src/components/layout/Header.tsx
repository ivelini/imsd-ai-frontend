"use client";

import Link from "next/link";
import { HEADER_NAV, PHONE_DISPLAY } from "@/data/nav";
import { selectCartCount, useCartStore } from "@/stores/useCartStore";
import { useUIStore } from "@/stores/useUIStore";
import { BurgerIcon, CatalogMenuIcon, ChevronDownIcon, GeoPinIcon, SearchIcon } from "./icons";

export function Header() {
  const { city, setMenuOpen, setGeoOpen } = useUIStore();
  const count = useCartStore(selectCartCount);

  return (
    <header className="container">
      <div className="header-container">
        <div className="header-location-block">
          <p className="header-location-block-main">
            <span className="choice-city-h">Ваш город:</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setGeoOpen(true);
              }}
            >
              <GeoPinIcon />
              <span className="city-in-header">{city.name}</span>
              <ChevronDownIcon />
            </a>
          </p>
          <p className="header-number">{PHONE_DISPLAY}</p>
        </div>
        <div className="navigation-block">
          <ul>
            {HEADER_NAV.map((item) => (
              <li key={item.label}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="additional-menu">
        <div className="gr1">
          <button
            type="button"
            id="hide-show-catalog"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
          >
            <BurgerIcon />
          </button>
          <div className="logo">
            <Link href="/">
              <img src="/assets/img/logo.svg" alt="Автоальянс" />
            </Link>
          </div>
          <div className="catalog-button">
            <CatalogMenuIcon />
            <Link href="/catalog/tires" id="get-catalog">
              Каталог
            </Link>
          </div>
        </div>
        <div className="gr2">
          <div className="search-input">
            <input type="text" placeholder="Поиск по товарам" />
            <SearchIcon />
          </div>
          <div className="user-panel">
            <Link className="status-order header-icon-and-btn" id="order-status" href="/order-status">
              <img src="/assets/img/note.svg" alt="" />
              <p className="header-icon-and-btn-text hide-on-mobile">Статус заказа</p>
              <p className="header-icon-and-btn-text show-on-mobile">Мой заказ</p>
            </Link>
            <Link className="login header-icon-and-btn" id="header-login" href="/auth/login">
              <img src="/assets/img/login.svg" alt="" />
              <p className="header-icon-and-btn-text">Войти</p>
            </Link>
            <Link className="cart header-icon-and-btn" id="busket" href="/cart">
              <img src="/assets/img/busket.svg" alt="" />
              <p className="header-icon-and-btn-text">Корзина</p>
              {count > 0 && <span id="count-in-busket">{count}</span>}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
