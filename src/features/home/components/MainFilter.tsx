// Главный фильтр «Шины/Диски» с селектами (фаза 1: статичная разметка из index.html;
// интерактив — фаза 2, CSS :has() управляет видимостью блоков)
"use client";

import { useUIStore } from "@/stores/useUIStore";
import { ArrowDownGrayIcon, ArrowRightBlackIcon } from "@/shared/layout/icons";
import { HelpIcon, PinFilterIcon } from "./main-filter-icons";
import { DiskIcon, WheelIcon } from "./wheel-disk-icons";

function Select({ id, label }: { id: string; label: string }) {
  return (
    <div className="custom-select-wrapper">
      <select className="custom-select" id={id}>
        <option value="0">{label}</option>
      </select>
      <div className="select-arrow">
        <ArrowDownGrayIcon />
      </div>
    </div>
  );
}

export function MainFilter() {
  const city = useUIStore((s) => s.city);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);

  return (
    <section className="filter-block">
      <input type="radio" name="catalog-category" id="cat-wheels" checked hidden readOnly />
      <input type="radio" name="catalog-category" id="cat-disk" hidden readOnly />
      <div className="container filter-block-menu">
        <label className="filter-item for-wheels" htmlFor="cat-wheels">
          <WheelIcon />
          <p>Шины</p>
        </label>
        <label className="filter-item for-disk inactive" htmlFor="cat-disk">
          <DiskIcon />
          <p>Диски</p>
        </label>
      </div>
      <div className="filter-content">
        <input type="checkbox" id="filter-top-switcher" hidden readOnly />
        <div className="filter-menu">
          <div className="switcher-wrap">
            <p className="filter-switcher-option">По параметрам</p>
            <label className="switcher" htmlFor="filter-top-switcher">
              <div className="switcher-circle"></div>
            </label>
            <p className="filter-switcher-option filter-switcher-option_disabled">По автомобилю</p>
          </div>
          <a href="#" className="choice-city" onClick={(e) => { e.preventDefault(); setGeoOpen(true); }}>
            <PinFilterIcon />
            {city}
            <ArrowRightBlackIcon />
          </a>
        </div>
        <div className="filter-content-item disk">
          <div className="select-row">
            <Select id="widthSelect" label="Ширина" />
            <Select id="profileSelect" label="Профиль" />
            <Select id="diameterSelect" label="Диаметр" />
          </div>
          <div className="select-row">
            <Select id="seasonSelect" label="Сезонность" />
            <Select id="typeSelect" label="Тип шин" />
          </div>
          <div className="select-row">
            <Select id="manufacturerSelect" label="Производитель" />
          </div>
        </div>
        <div className="filter-content-item auto">
          <div className="select-row">
            <Select id="manufacturerSelect" label="Производитель" />
            <Select id="modelSelect" label="Модель" />
          </div>
          <div className="select-row">
            <Select id="yearSelect" label="Год выпуска" />
            <Select id="modificationSelect" label="Модификация" />
          </div>
        </div>
        <div className="filter-content-item wheel">
          <div className="select-row">
            <Select id="widthAutoSelect" label="Ширина" />
            <Select id="diameterAutoSelect" label="Диаметр" />
          </div>
          <div className="select-row">
            <Select id="pcdAutoSelect" label="Крепеж (PCD)" />
            <Select id="etAutoSelect" label="Вылет (ET)" />
            <Select id="hubAutoSelect" label="Ступица" />
          </div>
          <div className="select-row">
            <Select id="typeDiskAutoSelect" label="Тип диска" />
          </div>
        </div>
        <button className="submit-filter-button secondary-btn">Подобрать</button>
        <div className="help-block">
          <HelpIcon />
          <a href="#" className="help-process help">Помощь в подборе</a>
        </div>
      </div>
    </section>
  );
}
