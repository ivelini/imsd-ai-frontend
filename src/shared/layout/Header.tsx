// Шапка: серверная структура + клиентские острова (03.08.2026)
import type { NavData } from "@/shared/api/data";
import { CityBadge } from "./client-islands/CityBadge";
import { MenuToggle } from "./client-islands/MenuToggle";
import { CartBadge } from "./client-islands/CartBadge";
import { LoginBadge } from "./client-islands/LoginBadge";
import { SearchIcon } from "./icons";

interface HeaderProps {
  nav: NavData;
}

export function Header({ nav }: HeaderProps) {
  return (
    <header className="container">
      <div className="header-container">
        <div className="header-location-block">
          <p className="header-location-block-main">
            <CityBadge />
          </p>
          <p className="header-number">{nav.phone.header}</p>
        </div>
        <div className="navigation-block">
          <ul>
            {nav.headerLinks.map((link) => (
              <li key={link.link_name}>
                <a href={link.link}>{link.link_name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Дополнительное меню */}
      <div className="additional-menu">
        <div className="gr1">
          <MenuToggle variant="burger" />
          <div className="logo">
            <img src="/assets/img/logo.svg" alt="" />
          </div>
          <MenuToggle variant="catalog" />
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
            <LoginBadge />
            <div className="cart header-icon-and-btn" id="busket">
              <img src="/assets/img/busket.svg" alt="" />
              <p className="header-icon-and-btn-text">Корзина</p>
              <CartBadge />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
