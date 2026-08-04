// Хук доступа к текущему городу: value (slug для URL) + label (русское имя)
"use client";

import { useUIStore } from "@/stores/useUIStore";
import { useGeo } from "@/shared/layout/api/useGeo";
import { DEFAULT_CITY, DEFAULT_CITY_VALUE } from "@/data/geo";

export function useCity() {
  const cityValue = useUIStore((s) => s.cityValue);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);
  const { data: geo } = useGeo();

  // null = город не выбран (по умолчанию Челябинск для отображения)
  const slug = cityValue ?? DEFAULT_CITY_VALUE;

  const cityLabel = geo
    ? (geo.cities.find((c) => c.value === slug)?.label ?? DEFAULT_CITY)
    : DEFAULT_CITY;

  return {
    cityValue, // null если не выбран, иначе slug
    cityLabel,
    setGeoOpen: () => setGeoOpen(true),
    isReady: true,
  };
}
