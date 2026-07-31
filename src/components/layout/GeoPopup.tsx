"use client";

import { useState } from "react";
import { CITIES, REGIONS } from "@/data/geo";
import { useUIStore } from "@/stores/useUIStore";

export function GeoPopup() {
  const { geoOpen, city, setCity, setGeoOpen } = useUIStore();
  const [activeRegionId, setActiveRegionId] = useState(REGIONS[0].id);

  if (!geoOpen) return null;

  const activeCities = CITIES.filter((c) => c.regionId === activeRegionId);

  const chooseCity = (id: number, name: string) => {
    setCity({ id, name, regionId: activeRegionId });
    setGeoOpen(false);
  };

  return (
    <div className="geo-wrapper">
      <div className="geo-window">
        <div className="geo-window-panel">
          <div className="geo-title">Ваш город</div>
          <a href="#" className="geo-location-window-exit" onClick={(e) => { e.preventDefault(); setGeoOpen(false); }}>
            <img src="/assets/img/close.svg" alt="Закрыть" />
          </a>
        </div>
        <div className="geo-location-window-search">
          <div className="geo-location-window-search-text">Выберите город</div>
          <input type="text" className="geo-location-window-search-input" value="" onChange={() => {}} />
        </div>
        <div className="geo-location-window-list">
          {REGIONS.map((region) => (
            <div className="geo-location-window-list-item" key={region.id}>
              <a
                href="#"
                className="geo-location-window-list-item-link"
                data-id={region.id}
                data-parse-value={region.parseValue}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveRegionId(region.id);
                }}
              >
                <span>{region.name}</span>
              </a>
            </div>
          ))}
        </div>
        <div className="geo-location-window__location-list">
          <div
            className="geo-location-window__city-list"
            data-cityid={activeRegionId}
            data-regionid={activeRegionId - 1}
          >
            {activeCities.map((c) => (
              <div className="geo-location-window__city" key={c.id}>
                <span
                  className={
                    c.id === city.id
                      ? "geo-location-window__link geo-location-window__link_active"
                      : "geo-location-window__link"
                  }
                  title={c.name}
                  data-id={c.id}
                  onClick={() => chooseCity(c.id, c.name)}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
