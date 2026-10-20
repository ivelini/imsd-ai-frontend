// Адаптеры живого подбора шин по автомобилю (тест-лист плана auto-selection-live)
// GET /api/catalog/tires/by-vehicle/{modification}: секции → опции → пары front/rear
import { describe, expect, it, vi } from "vitest";
import {
  getVehicleTireSelection,
  toVehicleSelection,
  toVehicleSelectionQuery,
} from "@/shared/api/vehicle";
import type { TireListItemDto } from "@/features/catalog/types";
import type { VehicleSelectionDto } from "@/features/catalog/types/vehicle";

const tire = (overrides: Partial<TireListItemDto> = {}): TireListItemDto => ({
  id: 134,
  ean: "4600000000001",
  name: "Шина летняя Sailun Atrezzo ZSR 235/50 R18 101Y",
  slug: "sailun-atrezzo-zsr-235-50-r18-101y",
  brand: { id: 11, name: "Sailun", slug: "sailun" },
  model: { id: 46, name: "Atrezzo ZSR", slug: "atrezzo-zsr" },
  origin: null,
  width: 235,
  profile: 50,
  diameter: "18",
  season: { label: "Летняя", value: "summer" },
  is_studded: false,
  euro_label: null,
  price: 9800,
  old_price: 10500,
  count_in_stock: 4,
  delivery_min: 1,
  delivery_max: 2,
  images: [],
  ...overrides,
});

const selectionDto: VehicleSelectionDto = {
  data: {
    vehicle: {
      make: { id: 1, slug: "acura", name: "Acura" },
      model: { id: 1, slug: "cdx", name: "CDX", label: "CDX", generation: "CDX" },
      modification: { id: 1, slug: "1-5-t", name: "1.5 T" },
      year: 2016,
      title: "Acura CDX 1.5 T, 2016 г.",
    },
    sections: [
      {
        type: "oem",
        car_block_label: "Рекомендовано",
        result_label: "Рекомендация производителя",
        options: [
          {
            key: "235-50-18",
            label: "235/50 R18",
            sizes: [{ width: 235, profile: 50, diameter: "18", position: null }],
            offers: [{ front: tire(), rear: null }],
            offers_total: 4,
          },
          {
            key: "275-45-20--305-40-20",
            label: "275/45 R20 - 305/40 R20",
            sizes: [
              { width: 275, profile: 45, diameter: "20", position: "Front" },
              { width: 305, profile: 40, diameter: "20", position: "Rear" },
            ],
            offers: [
              {
                front: tire({ id: 201, width: 275, profile: 45, diameter: "20" }),
                rear: tire({ id: 202, width: 305, profile: 40, diameter: "20" }),
              },
            ],
            offers_total: 1,
          },
        ],
      },
    ],
  },
  meta: {
    city: { id: 1, slug: "celiabinsk", name: "Челябинск" },
    seo: { title: "Шины на Acura CDX 1.5 T, 2016 г. в Челябинске", description: null },
    offers_per_option: 12,
    total_offers: 5,
  },
};

describe("toVehicleSelection", () => {
  it("test_map_vehicle_selection_keeps_single_and_pair_offers", () => {
    const selection = toVehicleSelection(selectionDto);

    expect(selection.vehicle.title).toBe("Acura CDX 1.5 T, 2016 г.");
    expect(selection.sections[0].carBlockLabel).toBe("Рекомендовано");
    expect(selection.sections[0].resultLabel).toBe("Рекомендация производителя");

    const single = selection.sections[0].options[0];
    // товар прошёл общий адаптер карточки (toTireProduct)
    expect(single.offers[0].front.title).toBe("Шина летняя Sailun Atrezzo ZSR 235/50 R18 101Y");
    expect(single.offers[0].front.price).toBe(9800);
    expect(single.offers[0].rear).toBeNull();
    expect(single.offersTotal).toBe(4);

    const pair = selection.sections[0].options[1];
    expect(pair.offers[0].front.id).toBe("201");
    expect(pair.offers[0].rear?.id).toBe("202");
    expect(pair.offersTotal).toBe(1);

    expect(selection.totalOffers).toBe(5);
    expect(selection.city.name).toBe("Челябинск");
    expect(selection.seo.description).toBeNull();
  });

  it("test_map_vehicle_selection_empty_result", () => {
    const selection = toVehicleSelection({
      ...selectionDto,
      data: { ...selectionDto.data, sections: [] },
      meta: { ...selectionDto.meta, total_offers: 0 },
    });

    expect(selection.sections).toEqual([]);
    expect(selection.totalOffers).toBe(0);
  });
});

describe("toVehicleSelectionQuery", () => {
  it("test_vehicle_selection_query_omits_size_filters", () => {
    const q = toVehicleSelectionQuery(
      {
        priceMin: 5000,
        priceMax: 9000,
        delivery: ["between1and3days"],
        country: "rossiia",
        width: 235,
        profile: 50,
        diameter: 18,
        page: 2,
      },
      "celiabinsk",
    );

    expect(q).toContain("price_min=5000");
    expect(q).toContain("price_max=9000");
    expect(q).toContain("delivery[]=between1and3days");
    expect(q).toContain("country=rossiia");
    expect(q).toContain("city=celiabinsk");
    // размер задаёт автомобиль — размерные параметры и пагинация не уходят
    expect(q).not.toContain("width");
    expect(q).not.toContain("profile");
    expect(q).not.toContain("diameter");
    expect(q).not.toContain("page");
    // каноничный вид скобок для PHP parse_str
    expect(q).not.toContain("%5B%5D");
  });
});

describe("getVehicleTireSelection", () => {
  it("test_vehicle_not_found_returns_null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    try {
      await expect(
        getVehicleTireSelection(
          {
            make: "acura",
            model: "cdx",
            year: 2016,
            modification: "1-5-t",
          },
          {},
          "celiabinsk",
        ),
      ).resolves.toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
