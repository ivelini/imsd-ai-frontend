// Хук доступа к текущему городу: value (slug для URL) + label (русское имя)
// Дефолты города — из GeoData (React Query), не из моков напрямую (правило 7)
"use client";

import { useUIStore } from "@/stores/useUIStore";
import { useGeo } from "@/shared/layout/api/useGeo";
import { effectiveCitySlug } from "@/shared/lib/cityUrl";

export function useCity() {
  const cityValue = useUIStore((s) => s.cityValue);
  const setGeoOpen = useUIStore((s) => s.setGeoOpen);
  const { data: geo } = useGeo();

  // null = город не выбран (по умолчанию — дефолт города из API)
  const citySlug = effectiveCitySlug(cityValue, geo?.defaultCityValue);

  const cityLabel = geo
    ? (geo.cities.find((c) => c.value === citySlug)?.label ?? geo.defaultCity)
    : "";

  return {
    cityValue, // null если не выбран, иначе slug
    citySlug, // город, который видит посетитель: выбранный или дефолт geo
    cityLabel,
    setGeoOpen: () => setGeoOpen(true),
    isReady: !!geo,
  };
}
