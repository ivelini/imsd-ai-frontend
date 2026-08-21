// Layout: гео (города, регионы) — GET /api/reference/city (контракт public-api.json)
// Город в URL — слаг (value), city_id для бэка резолвится по слагу на стороне бэка
import { apiBase } from "./base";

export interface GeoCity {
  id: string; // числовой id города (для резолва)
  label: string;
  value: string; // слаг города для URL (?city=chelyabinsk)
  regionId: string;
}

export interface GeoRegion {
  id: string;
  name: string;
}

export interface GeoData {
  regions: GeoRegion[];
  cities: GeoCity[];
  defaultCity: string;
  defaultCityValue: string;
}

/** DTO бэка: GET /api/reference/city */
export interface CityReferenceDto {
  label: string;
  value: number;
  slug: string | null;
  region: { id: number; name: string };
}

interface CityReferenceResponse {
  data: CityReferenceDto[];
  meta: { default: { label: string; value: number } | null };
}

/** DTO справочника городов → GeoData (контракт GeoData не менялся для потребителей). */
export function toGeoData(response: CityReferenceResponse): GeoData {
  const regions: GeoRegion[] = [];
  const cities: GeoCity[] = response.data.map((c) => {
    const regionId = String(c.region.id);
    if (!regions.some((r) => r.id === regionId)) {
      regions.push({ id: regionId, name: c.region.name });
    }
    return {
      id: String(c.value),
      label: c.label,
      // slug nullable на бэке — fallback на числовой id (город без слага в URL числом)
      value: c.slug ?? String(c.value),
      regionId,
    };
  });

  const def = response.meta.default;
  const defaultCity = def?.label ?? cities[0]?.label ?? "";
  const defaultCityValue = def
    ? (cities.find((c) => c.id === String(def.value))?.value ?? "")
    : (cities[0]?.value ?? "");

  return { regions, cities, defaultCity, defaultCityValue };
}

export async function getGeo(): Promise<GeoData> {
  const res = await fetch(`${apiBase()}/reference/city`);
  if (!res.ok) {
    throw new Error(`getGeo: HTTP ${res.status}`);
  }
  const body = (await res.json()) as CityReferenceResponse;
  return toGeoData(body);
}
