// Стартовая /catalog: сборка CatalogStartData из живых фасетов (задача 2 плана
// catalog-product-start-live) — карточки статичны (бэк-эндпоинта нет), бренды из фасетов.
import { describe, expect, it } from "vitest";
import { toCatalogStart } from "@/shared/api/catalog";
import type { FilterOptions } from "@/features/catalog/types";

const tireFacets: FilterOptions = {
  seasons: [],
  brands: [
    { label: "BFGoodrich", value: "bfgoodrich" },
    { label: "Белшина", value: "belsina" },
  ],
  widths: [],
  profiles: [],
  diameters: [],
  studded: [],
  pcds: [],
  ets: [],
  hubBores: [],
  wheelTypes: [],
  countries: [],
  delivery: [],
  priceMin: 0,
  priceMax: 0,
};

const wheelFacets: FilterOptions = {
  ...tireFacets,
  brands: [{ label: "LS", value: "ls" }],
};

describe("toCatalogStart", () => {
  it("test_catalog_start_brands_from_facets", () => {
    const data = toCatalogStart(tireFacets, wheelFacets);

    // value фасета — слаг бренда в URL каталога; label — готовая строка бэка
    expect(data.tireBrands[1]).toEqual({ link: "/catalog/tires/belsina", link_name: "Белшина" });
    expect(data.wheelBrands[0]).toEqual({ link: "/catalog/wheels/ls", link_name: "LS" });
  });

  it("test_catalog_start_cards_static", () => {
    const data = toCatalogStart(tireFacets, wheelFacets);

    // 4 карточки «по параметрам/по автомобилю» — статика фронта, ссылки без города
    expect(data.cards).toHaveLength(4);
    expect(data.cards.map((c) => c.link)).toEqual([
      "/catalog/tires",
      "/catalog/tires/auto",
      "/catalog/wheels",
      "/catalog/wheels/auto",
    ]);
  });

  it("test_catalog_start_city_in_links", () => {
    const data = toCatalogStart(tireFacets, wheelFacets, "celiabinsk");

    // город — контекст запроса (ADR 0004): сохраняется в ссылках брендов и карточек
    expect(data.tireBrands[0]?.link).toBe("/catalog/tires/bfgoodrich?city=celiabinsk");
    expect(data.cards[0]?.link).toBe("/catalog/tires?city=celiabinsk");
  });
});
