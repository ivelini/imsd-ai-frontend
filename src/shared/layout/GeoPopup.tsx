// Гео-окно: выбор города (03.08.2026)
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGeo } from "@/shared/layout/api/useGeo";
import { useUIStore } from "@/stores/useUIStore";
import { mergeSearchParams } from "@/shared/lib/cityUrl";

export function GeoPopup() {
  const router = useRouter();
  const geoOpen = useUIStore((s) => s.geoOpen);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);
  const cityValue = useUIStore((s) => s.cityValue);
  const setCityValue = useUIStore((s) => s.setCityValue);
  const { data: geo } = useGeo();
  const [searchQuery, setSearchQuery] = useState("");

  // Регион текущего города — для выбора по умолчанию
  const defaultRegionId = geo?.cities.find((c) => c.value === cityValue)?.regionId ?? geo?.regions[0]?.id;
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(undefined);

  // При открытии попапа — сброс на регион текущего города
  useEffect(() => {
    if (geoOpen && defaultRegionId) {
      setSelectedRegionId(undefined);
    }
  }, [geoOpen, defaultRegionId]);

  if (!geoOpen) return null;

  const activeRegionId = selectedRegionId ?? defaultRegionId;

  const selectCity = (c: { value: string }) => {
    setCityValue(c.value);
    const qs = mergeSearchParams(
      new URLSearchParams(window.location.search),
      { city: c.value },
    );
    router.push(`?${qs}`, { scroll: false });
    setGeoOpen(false);
  };

  const filteredCities = geo?.cities.filter((c) =>
    c.label.toLowerCase().includes(searchQuery.toLowerCase()),
  ) ?? [];

  const showSearch = searchQuery.length > 0;

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
          <input
            type="text"
            className="geo-location-window-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {geo && !showSearch && (
          <>
            {/* Регионы — клик переключает список городов */}
            <div className="geo-location-window-list">
              {geo.regions.map((region) => (
                <div className="geo-location-window-list-item" key={region.id}>
                  <a
                    href="#"
                    className={`geo-location-window-list-item-link${region.id === activeRegionId ? " selected" : ""}`}
                    data-id={region.id}
                    data-parse-value={region.name}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedRegionId(region.id);
                    }}
                  >
                    <span>{region.name}</span>
                  </a>
                </div>
              ))}
            </div>
            {/* Города — показываем только активный регион */}
            <div className="geo-location-window__location-list">
              {geo.regions.map((region) => (
                <div
                  className={`geo-location-window__city-list geo-location-window__city-list-${geo.regions.indexOf(region) + 1}`}
                  key={region.id}
                  data-cityid={region.id}
                  data-regionid={String(Number(region.id) - 1)}
                  style={{ display: region.id === activeRegionId ? "block" : "none" }}
                >
                  {geo.cities.filter((c) => c.regionId === region.id).map((c) => (
                    <div className="geo-location-window__city" key={c.id}>
                      <span
                        className={`geo-location-window__link${cityValue === c.value ? " geo-location-window__link_active" : ""}`}
                        title={c.label}
                        data-id={c.id}
                        onClick={() => selectCity(c)}
                      >
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
        {showSearch && (
          <div className="geo-location-window__location-list">
            <div
              className="geo-location-window__city-list geo-location-window__city-list-1"
              style={{ display: "block" }}
            >
              {filteredCities.length === 0 ? (
                <div className="geo-location-window__city">
                  <span className="geo-location-window__link">Ничего не найдено</span>
                </div>
              ) : (
                filteredCities.map((c) => (
                  <div className="geo-location-window__city" key={c.id}>
                    <span
                      className={`geo-location-window__link${cityValue === c.value ? " geo-location-window__link_active" : ""}`}
                      title={c.label}
                      data-id={c.id}
                      onClick={() => selectCity(c)}
                    >
                      {c.label}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
