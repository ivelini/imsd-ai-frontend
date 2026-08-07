// Layout: гео (города, регионы)
import {
  GEO_REGIONS,
  GEO_CITIES,
  DEFAULT_CITY,
  DEFAULT_CITY_VALUE,
} from "@/data/geo";
import type { GeoRegion, GeoCity } from "@/data/geo";
import { delay } from "./base";

export interface GeoData {
  regions: GeoRegion[];
  cities: GeoCity[];
  defaultCity: string;
  defaultCityValue: string;
}

export async function getGeo(): Promise<GeoData> {
  return delay(50, {
    regions: GEO_REGIONS,
    cities: GEO_CITIES,
    defaultCity: DEFAULT_CITY,
    defaultCityValue: DEFAULT_CITY_VALUE,
  });
}
