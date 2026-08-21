// Адаптер GET /api/reference/city → GeoData (тест-лист плана catalog-tires-live-api)
// Контракт: data[{label, value:int, slug|null, region{id:int, name}}], meta.default{label, value:int}|null
import { describe, expect, it } from "vitest";
import { toGeoData } from "@/shared/api/geo";
import type { CityReferenceDto } from "@/shared/api/geo";

const chelyabinsk: CityReferenceDto = {
  label: "Челябинск",
  value: 7,
  slug: "chelyabinsk",
  region: { id: 1, name: "Челябинская обл" },
};

const ekaterinburg: CityReferenceDto = {
  label: "Екатеринбург",
  value: 9,
  slug: "ekaterinburg",
  region: { id: 2, name: "Свердловская обл" },
};

describe("toGeoData", () => {
  it("test_maps_reference_city_to_geodata", () => {
    const geo = toGeoData({
      data: [chelyabinsk, ekaterinburg],
      meta: { default: { label: "Челябинск", value: 7 } },
    });

    expect(geo.cities).toEqual([
      { id: "7", label: "Челябинск", value: "chelyabinsk", regionId: "1" },
      { id: "9", label: "Екатеринбург", value: "ekaterinburg", regionId: "2" },
    ]);
    expect(geo.defaultCity).toBe("Челябинск");
    expect(geo.defaultCityValue).toBe("chelyabinsk");
  });

  it("test_null_default_uses_first_city", () => {
    const geo = toGeoData({ data: [chelyabinsk], meta: { default: null } });
    expect(geo.defaultCity).toBe("Челябинск");
    expect(geo.defaultCityValue).toBe("chelyabinsk");
  });

  it("test_null_slug_falls_back_to_numeric_value", () => {
    const geo = toGeoData({
      data: [{ ...chelyabinsk, slug: null }],
      meta: { default: null },
    });
    expect(geo.cities[0].value).toBe("7");
  });

  it("test_regions_deduplicated", () => {
    const geo = toGeoData({
      data: [chelyabinsk, { ...ekaterinburg, region: { id: 1, name: "Челябинская обл" } }],
      meta: { default: null },
    });
    expect(geo.regions).toEqual([{ id: "1", name: "Челябинская обл" }]);
  });
});
