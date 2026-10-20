// URL и сегменты авто-подбора: адресация слагами Vehicle (тест-лист плана)
import { describe, expect, it } from "vitest";
import {
  matchesVehicleRef,
  parseVehicleAutoSegments,
  vehicleAutoPath,
} from "@/shared/lib/autoUrl";

describe("vehicleAutoPath", () => {
  it("test_build_vehicle_url_from_slugs", () => {
    expect(
      vehicleAutoPath({
        make: "acura",
        model: "integra",
        year: 1999,
        modification: "1-8i",
      }),
    ).toBe("/catalog/tires/auto/acura/integra/1999/1-8i");
  });

  it("test_build_wheel_vehicle_url_from_slugs", () => {
    expect(
      vehicleAutoPath(
        {
          make: "acura",
          model: "ilx",
          year: 2017,
          modification: "2-0i",
        },
        "wheels",
      ),
    ).toBe("/catalog/wheels/auto/acura/ilx/2017/2-0i");
  });

  it("test_build_partial_vehicle_url", () => {
    expect(vehicleAutoPath({ make: "acura" })).toBe("/catalog/tires/auto/acura");
    expect(vehicleAutoPath({ make: "acura", model: "integra" })).toBe(
      "/catalog/tires/auto/acura/integra",
    );
  });
});

describe("parseVehicleAutoSegments", () => {
  it("test_parse_full_vehicle_segments", () => {
    expect(parseVehicleAutoSegments(["acura", "integra", "1999", "1-8i"])).toEqual({
      make: "acura",
      model: "integra",
      year: 1999,
      modification: "1-8i",
    });
  });

  it("test_parse_partial_vehicle_segments", () => {
    expect(parseVehicleAutoSegments([])).toEqual({});
    expect(parseVehicleAutoSegments(["acura"])).toEqual({ make: "acura" });
    expect(parseVehicleAutoSegments(["acura", "integra"])).toEqual({
      make: "acura",
      model: "integra",
    });
    expect(parseVehicleAutoSegments(["acura", "integra", "1999"])).toEqual({
      make: "acura",
      model: "integra",
      year: 1999,
    });
  });

  it("test_parse_legacy_numeric_segments_as_strings", () => {
    // числовой id принимается как legacy-значение, страница редиректит на слаг
    expect(parseVehicleAutoSegments(["1", "6", "1999", "75"])).toEqual({
      make: "1",
      model: "6",
      year: 1999,
      modification: "75",
    });
  });

  it("test_invalid_vehicle_segment_is_rejected", () => {
    expect(parseVehicleAutoSegments(["Acura"])).toBeNull();
    expect(parseVehicleAutoSegments(["acura", "integra_iv"])).toBeNull();
    expect(parseVehicleAutoSegments(["acura", "integra", "1800"])).toBeNull();
    expect(parseVehicleAutoSegments(["acura", "integra", "1999", "1-8i", "extra"]))
      .toBeNull();
  });
});

describe("matchesVehicleRef", () => {
  it("test_matches_slug_and_legacy_id", () => {
    const ref = { id: 6, slug: "integra" };

    expect(matchesVehicleRef(ref, "integra")).toBe(true);
    expect(matchesVehicleRef(ref, "6")).toBe(true);
    expect(matchesVehicleRef(ref, "integra-iv")).toBe(false);
  });
});
