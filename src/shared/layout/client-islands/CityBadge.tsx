// Город в шапке: отображает текущий город, клик открывает GeoPopup
"use client";

import { useUIStore } from "@/stores/useUIStore";
import { PinHeaderIcon, ArrowDownRedIcon } from "@/shared/layout/icons";

export function CityBadge() {
  const city = useUIStore((s) => s.city);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);

  return (
    <>
      <span className="choice-city-h">Ваш город:</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setGeoOpen(true);
        }}
      >
        <PinHeaderIcon />
        <span className="city-in-header">{city}</span>
        <ArrowDownRedIcon />
      </a>
    </>
  );
}
