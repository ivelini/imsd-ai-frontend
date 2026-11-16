// Регрессионный страж: city в URL каталога (существующая механика, план catalog-city-param)
import { describe, expect, it } from "vitest";
import { buildCatalogUrl } from "@/shared/lib/parseParams";
import { effectiveCitySlug } from "@/shared/lib/cityUrl";

describe("buildCatalogUrl: city", () => {
  it("test_build_catalog_url_with_city", () => {
    const url = buildCatalogUrl({ season: "winter" }, "ekaterinburg");
    expect(url).toContain("city=ekaterinburg");
  });

  it("test_build_catalog_url_without_city", () => {
    const url = buildCatalogUrl({ season: "winter" }, null);
    expect(url).not.toContain("city=");
  });
});

describe("effectiveCitySlug: город, который видит посетитель", () => {
  it("test_effective_city_slug_prefers_chosen", () => {
    // чат не должен отвечать по дефолтному городу, когда посетитель выбрал другой
    expect(effectiveCitySlug("ekaterinburg", "cheljabinsk")).toBe("ekaterinburg");
  });

  it("test_effective_city_slug_falls_back_to_default", () => {
    // без выбора — дефолт geo; пока geo не загружена — пусто (город не передаётся)
    expect(effectiveCitySlug(null, "cheljabinsk")).toBe("cheljabinsk");
    expect(effectiveCitySlug(null, undefined)).toBe("");
  });
});
