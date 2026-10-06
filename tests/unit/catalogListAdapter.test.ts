// Адаптеры живого листинга GET /api/catalog/tires → TireProduct (тест-лист плана)
// Контракт бэка (21.08.2026): slug (sizeSlug), model.slug, season {label, value}, brand.slug,
// euro_label {rollingResistance, wetGrip, noiseEmission}; город — слагом city= (резолвит бэк)
import { describe, expect, it } from "vitest";
import { toTireListQuery, toTireProduct } from "@/shared/api/catalog";
import type { TireListItemDto } from "@/features/catalog/types";

const baseDto: TireListItemDto = {
  id: 188,
  ean: "4601234567890",
  name: "Bluearth E70B",
  slug: "yokohama-bluearth-e70b-215-55-17",
  brand: { id: 3, name: "Yokohama", slug: "yokohama" },
  model: { id: 60, name: "Bluearth E70B", slug: "yokohama-bluearth-e70b" },
  width: 215,
  profile: 55,
  diameter: "17",
  origin: {
    vendor: { badge: "Yokohama", description: "Японский производитель шин." },
    manufacture_country: { badge: "Япония", description: "Завод в Японии." },
    manufacture_year: { badge: "2025", description: null },
  },
  season: { label: "Летняя", value: "summer" },
  is_studded: false,
  euro_label: { rollingResistance: "C", wetGrip: "B", noiseEmission: "72" },
  price: 11133.15,
  delivery_min: 1,
  delivery_max: 3,
  images: [{ id: 1, url: "/img/1.jpg" }],
};

describe("toTireListQuery", () => {
  it("test_query_empty_filter_sends_only_city_slug", () => {
    expect(toTireListQuery({}, "chelyabinsk")).toBe("city=chelyabinsk");
  });

  it("test_query_without_city_sends_no_city_param", () => {
    expect(toTireListQuery({}, undefined)).toBe("");
  });

  it("test_query_c_diameter_passed_uppercase", () => {
    const q = toTireListQuery({ diameter: "13c" }, undefined);
    expect(q).toContain("diameter[]=13C");
    expect(q).not.toContain("r13c");
  });

  it("test_query_full_filter_maps_all_fields", () => {
    const q = toTireListQuery(
      {
        width: 215,
        profile: 55,
        delivery: ["today", "after5days"],
        priceMin: 1000,
        priceMax: 20000,
        season: "winter",
        studded: "studded",
        brand: "viatti",
        page: 2,
      },
      "chelyabinsk",
    );
    expect(q).toContain("width[]=215");
    expect(q).toContain("profile[]=55");
    expect(q).toContain("delivery[]=today");
    expect(q).toContain("delivery[]=after5days");
    expect(q).toContain("price_min=1000");
    expect(q).toContain("price_max=20000");
    expect(q).toContain("season=winter");
    expect(q).toContain("studded=studded");
    expect(q).toContain("brand=viatti");
    expect(q).toContain("page=2");
    expect(q).toContain("city=chelyabinsk");
  });
});

describe("toTireProduct", () => {
  it("test_product_slug_and_sizeslug_built_from_fields", () => {
    const p = toTireProduct(baseDto);
    expect(p.modelSlug).toBe("yokohama-bluearth-e70b");
    expect(p.modelName).toBe("Bluearth E70B");
    expect(p.sizeSlug).toBe("yokohama-bluearth-e70b-215-55-17");
    expect(p.season).toBe("summer");
    expect(p.seasonLabel).toBe("Летняя");
    expect(p.image).toBe("/img/1.jpg");
    expect(p.price).toBe(11133.15);
    expect(p.brandName).toBe("Yokohama");
  });

  it("test_product_empty_images_use_placeholder", () => {
    const p = toTireProduct({ ...baseDto, images: [] });
    expect(p.image).toBeTruthy();
  });

  it("test_product_null_model_fallback", () => {
    const p = toTireProduct({ ...baseDto, model: null });
    expect(p.modelSlug).toBe("");
    expect(p.modelName).toBe("Bluearth E70B");
    expect(p.title).toBe("Bluearth E70B");
  });

  it("test_product_c_diameter_parsed", () => {
    const p = toTireProduct({ ...baseDto, diameter: "13c" });
    expect(p.diameter).toBe(13);
  });

  it("test_product_maps_euro_label", () => {
    const p = toTireProduct(baseDto);
    expect(p.euLabel).toEqual({
      rollingResistance: "C",
      wetGrip: "B",
      noiseEmission: 72,
    });

    const without = toTireProduct({ ...baseDto, euro_label: null });
    expect(without.euLabel).toBeUndefined();
  });

  it("test_product_maps_origin_to_parameters", () => {
    const p = toTireProduct(baseDto);
    expect(p.parameters).toEqual([
      {
        name: "Производитель:",
        value: "Yokohama",
        badge: true,
        description: { title: "Yokohama", text: "Японский производитель шин." },
      },
      {
        name: "Страна производства:",
        value: "Япония",
        badge: true,
        description: { title: "Япония", text: "Завод в Японии." },
      },
      {
        name: "Год производства:",
        value: "2025",
        badge: true,
        description: undefined,
      },
    ]);
  });

  it("test_product_null_origin_empty_parameters", () => {
    const p = toTireProduct({ ...baseDto, origin: null });
    expect(p.parameters).toEqual([]);
  });

  it("test_product_partial_origin_skips_nulls", () => {
    const p = toTireProduct({
      ...baseDto,
      origin: { vendor: { badge: "Yokohama", description: null }, manufacture_country: null, manufacture_year: null },
    });
    expect(p.parameters).toHaveLength(1);
    expect(p.parameters[0].value).toBe("Yokohama");
    expect(p.parameters[0].description).toBeUndefined();
  });
});
