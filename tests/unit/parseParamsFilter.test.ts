// Грамматика URL каталога: studded (замена tire_type) и диаметр с C-размерами
import { describe, expect, it } from "vitest";
import {
  buildCatalogUrl,
  buildQueryString,
  InvalidCatalogUrlError,
  parseCatalogParams,
} from "@/shared/lib/parseParams";

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

describe("префиксные размеры w/p", () => {
  /** Сегменты URL → params-аргумент parseCatalogParams (round-trip) */
  const segments = (url: string) => url.replace(/^\/catalog\/tires\/?/, "").split("/").filter(Boolean);

  it("test_parse_profile_without_width", () => {
    const filter = parseCatalogParams({ params: ["p60", "r15"] }, {});
    expect(filter.profile).toBe(60);
    expect(filter.width).toBeUndefined();
    expect(filter.diameter).toBe(15);
  });

  it("test_parse_width_without_profile", () => {
    const filter = parseCatalogParams({ params: ["w185", "r15"] }, {});
    expect(filter.width).toBe(185);
    expect(filter.profile).toBeUndefined();
  });

  it("test_roundtrip_profile_only", () => {
    const url = buildCatalogUrl({ profile: 60, diameter: 15 });
    expect(url).toContain("/p60/r15");
    expect(url).not.toContain("/w");

    const filter = parseCatalogParams({ params: segments(url) }, {});
    expect(filter.profile).toBe(60);
    expect(filter.diameter).toBe(15);
    expect(filter.width).toBeUndefined();
  });

  it("test_roundtrip_full_filter", () => {
    const filter = { season: "summer", brand: "michelin", width: 185, profile: 60, diameter: 15 };
    const url = buildCatalogUrl(filter);
    expect(url).toBe("/catalog/tires/summer/michelin/w185/p60/r15");

    expect(parseCatalogParams({ params: segments(url) }, {})).toEqual(filter);
  });

  it("test_plain_number_throws_invalid", () => {
    expect(() => parseCatalogParams({ params: ["185", "60", "r15"] }, {})).toThrow(
      InvalidCatalogUrlError,
    );
  });

  it("test_unknown_segment_throws_invalid", () => {
    expect(() => parseCatalogParams({ params: ["summer", "michelin", "w185", "foo"] }, {})).toThrow(
      InvalidCatalogUrlError,
    );
  });

  it("test_segment_over_query_priority", () => {
    const filter = parseCatalogParams({ params: ["w185"] }, { width: "w195" });
    expect(filter.width).toBe(185);
  });

  it("test_parse_width_profile_query", () => {
    const filter = parseCatalogParams({}, { width: "w185", profile: "p60" });
    expect(filter.width).toBe(185);
    expect(filter.profile).toBe(60);
  });

  it("test_build_url_skips_zero_sizes", () => {
    const url = buildCatalogUrl({ diameter: 0, width: 0, profile: 0 });
    expect(url).not.toContain("r0");
    expect(url).not.toContain("w0");
    expect(url).not.toContain("p0");
  });
});
