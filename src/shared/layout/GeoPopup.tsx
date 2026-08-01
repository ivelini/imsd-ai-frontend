// Гео-окно: выбор города (фаза 1). Мокап показывает через body-класс .popup-geo —
// в React условный рендер по state (geoOpen)
"use client";

import { GEO_CITIES, GEO_REGIONS } from "@/data/geo";
import { useUIStore } from "@/stores/useUIStore";

export function GeoPopup() {
  const geoOpen = useUIStore((s) => s.geoOpen);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);
  const city = useUIStore((s) => s.city);
  const setCity = useUIStore((s) => s.setCity);

  if (!geoOpen) return null;

  const selectCity = (name: string) => {
    setCity(name);
    setGeoOpen(false);
  };

  return (
    <div className="geo-wrapper" style={{ display: "block" }}>
      <div className="geo-window">
        <div className="geo-window-panel">
          <div className="geo-title">Ваш город</div>
          <a href="#" className="geo-location-window-exit" onClick={(e) => { e.preventDefault(); setGeoOpen(false); }}>
            <img src="/assets/img/close.svg" alt="" />
          </a>
        </div>
        <div className="geo-location-window-search">
          <div className="geo-location-window-search-text">Выберите город</div>
          <input type="text" className="geo-location-window-search-input" value="" />
        </div>
        <div className="geo-location-window-list">
          {GEO_REGIONS.map((region) => (
            <div className="geo-location-window-list-item" key={region.id}>
              <a href="#" className="geo-location-window-list-item-link" data-id={region.id} data-parse-value={region.name}>
                <span>{region.name}</span>
              </a>
            </div>
          ))}
        </div>
        <div className="geo-location-window__location-list">
          {GEO_REGIONS.map((region, i) => (
            <div
              className={`geo-location-window__city-list geo-location-window__city-list-${i + 1}`}
              key={region.id}
              data-cityid={region.id}
              data-regionid={String(Number(region.id) - 1)}
            >
              {GEO_CITIES.filter((c) => c.regionId === region.id).map((c) => (
                <div className="geo-location-window__city" key={c.id}>
                  <span
                    className={`geo-location-window__link${city === c.name ? " geo-location-window__link_active" : ""}`}
                    title={c.name}
                    data-id={c.id}
                    onClick={() => selectCity(c.name)}
                  >
                    {c.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
