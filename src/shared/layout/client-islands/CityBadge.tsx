// Город в шапке: отображает текущий город, клик открывает GeoPopup
"use client";

import { useCity } from "@/shared/layout/api/useCity";
import { PinHeaderIcon, ArrowDownRedIcon } from "@/shared/layout/icons";

export function CityBadge() {
  const { cityLabel, setGeoOpen } = useCity();

  return (
    <>
      <span className="choice-city-h">Ваш город:</span>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setGeoOpen();
        }}
      >
        <PinHeaderIcon />
        <span className="city-in-header">{cityLabel}</span>
        <ArrowDownRedIcon />
      </a>
    </>
  );
}
