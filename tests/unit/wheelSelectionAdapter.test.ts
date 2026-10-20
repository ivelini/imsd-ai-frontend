// Адаптер живого подбора дисков (тест-лист плана auto-selection-live, фаза 2)
// GET /api/catalog/wheels/by-vehicle/{modification}: спецификации → опции → пары front/rear
import { describe, expect, it, vi } from "vitest";
import { getVehicleWheelSelection, toWheelSelection } from "@/shared/api/vehicle";
import type { WheelListItemDto } from "@/features/catalog/types";
import type { VehicleWheelSelectionDto } from "@/features/catalog/types/vehicle";

const wheel = (overrides: Partial<WheelListItemDto> = {}): WheelListItemDto => ({
  id: 11,
  name: "Диск LS 142 16x6,5/5x114,3 D73,1 ET45 BKF",
  slug: "ls-142-16x65-5x1143-d731-et45-bkf",
  brand: { id: 9, name: "LS", slug: "ls" },
  model: { id: 40, name: "142", slug: "ls-142" },
  origin: null,
  width: "6.5",
  diameter: 16,
  pcd: "5*114.3",
  et: "45.0",
  hub_diameter: "73.1",
  type: { label: "Литые", value: "alloy" },
  color: "Черный",
  price: 13000,
  old_price: null,
  promotion: false,
  delivery: { delivery_min: 1, delivery_max: 3, delivery_days_after_order: 1 },
  count_in_stock: 4,
  images: [],
  ...overrides,
});

const selectionDto: VehicleWheelSelectionDto = {
  data: {
    vehicle: {
      make: { id: 1, slug: "acura", name: "Acura" },
      model: { id: 5, slug: "ilx", name: "ILX", label: "ILX", generation: "ILX" },
      modification: { id: 54, slug: "2-0i", name: "2.0i" },
      year: 2017,
      title: "Acura ILX 2.0i, 2017 г.",
    },
    sections: [
      {
        type: "oem",
        car_block_label: "Рекомендовано",
        result_label: "Рекомендация производителя",
        options: [
          {
            key: "16-6.5-5x114.3-64.1-45",
            label: "16x6.5/5x114.3 D64.1 ET45",
            sizes: [
              {
                width: "6.5",
                diameter: 16,
                et: "45",
                pcd: "5*114.3",
                hub_diameter: "64.1",
                bolts: "12*1.5",
                position: null,
              },
            ],
            offers: [{ front: wheel(), rear: null }],
            offers_total: 1,
          },
          {
            key: "17-7.5-5x114.3-64.1-45--17-7.5-5x114.3-64.1-45",
            label: "17x7.5/5x114.3 D64.1 ET45 - 17x7.5/5x114.3 D64.1 ET45",
            sizes: [
              {
                width: "7.5",
                diameter: 17,
                et: "45",
                pcd: "5*114.3",
                hub_diameter: "64.1",
                bolts: "12*1.5",
                position: "Front",
              },
              {
                width: "7.5",
                diameter: 17,
                et: "45",
                pcd: "5*114.3",
                hub_diameter: "64.1",
                bolts: "12*1.5",
                position: "Rear",
              },
            ],
            offers: [
              {
                front: wheel({ id: 201, diameter: 17, width: "7.5" }),
                rear: wheel({ id: 202, diameter: 17, width: "7.5" }),
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
    seo: { title: "Диски на Acura ILX 2.0i, 2017 г. в Челябинске", description: null },
    offers_per_option: 12,
    total_offers: 2,
  },
};

describe("toWheelSelection", () => {
  it("test_map_wheel_selection_keeps_single_and_pair_offers", () => {
    const selection = toWheelSelection(selectionDto);

    expect(selection.vehicle.title).toBe("Acura ILX 2.0i, 2017 г.");
    expect(selection.sections[0].carBlockLabel).toBe("Рекомендовано");
    expect(selection.sections[0].resultLabel).toBe("Рекомендация производителя");

    const single = selection.sections[0].options[0];
    // товар прошёл общий адаптер карточки (toWheelProduct)
    expect(single.offers[0].front.title).toBe("Диск LS 142 16x6,5/5x114,3 D73,1 ET45 BKF");
    expect(single.offers[0].front.pcd).toBe("5*114.3");
    expect(single.offers[0].front.et).toBe(45);
    expect(single.offers[0].rear).toBeNull();
    expect(single.offersTotal).toBe(1);

    const pair = selection.sections[0].options[1];
    expect(pair.offers[0].front.id).toBe("201");
    expect(pair.offers[0].rear?.id).toBe("202");
    expect(pair.sizes).toHaveLength(2);

    expect(selection.totalOffers).toBe(2);
    expect(selection.seo.title).toContain("Диски на Acura ILX");
  });

  it("test_map_wheel_selection_empty_result", () => {
    const selection = toWheelSelection({
      ...selectionDto,
      data: { ...selectionDto.data, sections: [] },
      meta: { ...selectionDto.meta, total_offers: 0 },
    });

    expect(selection.sections).toEqual([]);
    expect(selection.totalOffers).toBe(0);
  });
});

describe("getVehicleWheelSelection", () => {
  it("test_wheel_selection_not_found_returns_null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
    );

    try {
      await expect(
        getVehicleWheelSelection(
          {
            make: "acura",
            model: "ilx",
            year: 2017,
            modification: "2-0i",
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
