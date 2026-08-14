// Регрессионный страж: city в URL каталога (существующая механика, план catalog-city-param)
import { describe, expect, it } from "vitest";
import { buildCatalogUrl } from "@/shared/lib/parseParams";

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
