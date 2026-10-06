// Живой листинг каталога: city-слаг в query, маппинг meta → PaginatedResult, seo из meta
// (тест-лист плана catalog-tires-live-api)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCatalogProducts } from "@/shared/api/catalog";
import type { TireListItemDto, TireListDto } from "@/features/catalog/types";

const tire: TireListItemDto = {
  id: 188,
  ean: "4601234567890",
  name: "Bluearth E70B",
  slug: "yokohama-bluearth-e70b-215-55-17",
  brand: { id: 3, name: "Yokohama", slug: "yokohama" },
  model: { id: 60, name: "Bluearth E70B", slug: "yokohama-bluearth-e70b" },
  origin: null,
  width: 215,
  profile: 55,
  diameter: "17",
  season: { label: "Летняя", value: "summer" },
  is_studded: false,
  euro_label: null,
  price: 11133.15,
  delivery_min: 1,
  delivery_max: 3,
  images: [{ id: 1, url: "/img/1.jpg" }],
};

function mockFetch(body: TireListDto) {
  const fn = vi.fn(async () => ({ ok: true, json: async () => body }));
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getCatalogProducts (живой fetch)", () => {
  it("test_products_fetch_live_api_with_city", async () => {
    const fetchFn = mockFetch({
      data: [tire],
      meta: { current_page: 1, last_page: 1, per_page: 12, total: 1, seo: null },
    });

    await getCatalogProducts({ width: 215 }, "chelyabinsk");

    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining("/catalog/tires?"));
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining("width[]=215"));
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining("city=chelyabinsk"));
    expect(fetchFn).toHaveBeenCalledWith(expect.stringContaining("per_page=12"));
  });

  it("test_products_maps_meta_to_paginated_result", async () => {
    mockFetch({
      data: [tire],
      meta: { current_page: 2, last_page: 3, per_page: 12, total: 30, seo: null },
    });

    const result = await getCatalogProducts({}, "chelyabinsk");
    expect(result.page).toBe(2);
    expect(result.perPage).toBe(12);
    expect(result.total).toBe(30);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].sizeSlug).toBe("yokohama-bluearth-e70b-215-55-17");
  });

  it("test_products_passes_seo_through", async () => {
    mockFetch({
      data: [tire],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 1,
        seo: { title: "Шины и диски в Челябинске", description: "Описание" },
      },
    });

    const result = await getCatalogProducts({}, "chelyabinsk");
    expect(result.seo).toEqual({
      title: "Шины и диски в Челябинске",
      description: "Описание",
    });
  });

  it("test_products_null_seo_returns_null", async () => {
    mockFetch({
      data: [],
      meta: { current_page: 1, last_page: 0, per_page: 12, total: 0, seo: null },
    });

    const result = await getCatalogProducts({}, "chelyabinsk");
    expect(result.seo).toBeNull();
  });
});
