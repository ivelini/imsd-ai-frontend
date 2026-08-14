// Грамматика URL каталога: studded (замена tire_type) и диаметр с C-размерами
import { describe, expect, it } from "vitest";
import { buildCatalogUrl, buildQueryString, parseCatalogParams } from "@/shared/lib/parseParams";

describe("parseCatalogParams: studded", () => {
  it("test_parse_studded_query", () => {
    const filter = parseCatalogParams({}, { studded: "studded" });
    expect(filter.studded).toBe("studded");
  });

  it("test_parse_studded_query_empty", () => {
    const filter = parseCatalogParams({}, {});
    expect(filter.studded).toBeUndefined();
  });
});

describe("buildCatalogUrl: studded", () => {
  it("test_build_url_with_studded", () => {
    const url = buildCatalogUrl({ studded: "not_studded" });
    expect(url).toContain("studded=not_studded");
  });

  it("test_build_url_without_studded", () => {
    const url = buildCatalogUrl({ season: "winter" });
    expect(url).not.toContain("studded");
  });
});

describe("диаметр: r-значения и C-размеры", () => {
  it("test_parse_diameter_c_segment", () => {
    const filter = parseCatalogParams({ params: ["r13c"] }, {});
    expect(filter.diameter).toBe("13c");
  });

  it("test_parse_diameter_plain_segment", () => {
    const filter = parseCatalogParams({ params: ["r15"] }, {});
    expect(filter.diameter).toBe(15);
  });

  it("test_build_diameter_c_segment", () => {
    const url = buildCatalogUrl({ diameter: "13c" });
    expect(url).toContain("/r13c");
  });

  it("test_diameter_query_r_value_roundtrip", () => {
    // auto-вкладка: diameter только в query (без сегментов)
    const filter = parseCatalogParams({}, { diameter: "r15" });
    expect(filter.diameter).toBe(15);
  });

  it("test_diameter_query_c_value_roundtrip", () => {
    const filter = parseCatalogParams({}, { diameter: "r13c" });
    expect(filter.diameter).toBe("13c");
  });

  it("test_build_query_string_diameter_c", () => {
    const qs = buildQueryString({ diameter: "13c" }, true);
    expect(qs).toContain("diameter=13c");
  });
});
