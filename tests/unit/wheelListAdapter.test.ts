// Адаптеры живого листинга дисков GET /api/catalog/wheels (тест-лист плана)
// Контракт public-api.json: фасеты {label, value}, decimal-строки («7.0», «40.0»),
// бэк нормализует decimal-вход (normalizeDecimal) — сравнение с БД не строгое
import { describe, expect, it } from "vitest";
import { toWheelFilterOptions, toWheelListQuery, toWheelProduct } from "@/shared/api/catalog";
import type { OriginDto, WheelFilterValuesDto, WheelListItemDto } from "@/features/catalog/types";

const filterDto: WheelFilterValuesDto = {
  width: [{ label: "7.0", value: "7.0" }],
  diameter: [{ label: 15, value: 15 }],
  pcd: [{ label: "4*100", value: "4*100" }],
  et: [{ label: "40.0", value: "40.0" }],
  hub_diameter: [{ label: "73.1", value: "73.1" }],
  type: [{ label: "Литые", value: "alloy" }],
  color: [{ label: "Черный", value: "Черный" }],
  brand: [{ label: "LS", value: "ls" }],
  country: [{ label: "Тайвань", value: "taivan" }],
  delivery: [{ label: "1–3 дня", value: "between1and3days" }],
  price: { min: 10600, max: 18900 },
};

const wheelOrigin: OriginDto = {
  vendor: { badge: "LS", description: "Тайваньский производитель дисков." },
  manufacture_country: { badge: "Тайвань", description: null },
  manufacture_year: { badge: "2026", description: null },
  delivery_days_after_order: {
    badge: "17 Окт (Сб)",
    description: "Самовывоз осуществляется из центрального офиса",
  },
  pick_up: {
    pick_up_point: { badge: "бесплатно", description: "Доставка осуществляется курьером" },
  },
};

const baseDto: WheelListItemDto = {
  id: 195,
  name: "Диск LS 367 16x7/4x100 D73,1 ET40 GMF",
  slug: "ls-disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1",
  brand: { id: 9, name: "LS", slug: "ls" },
  model: { id: 40, name: "367", slug: "ls-367" },
  origin: wheelOrigin,
  width: "7.0",
  diameter: 16,
  pcd: "4*100",
  et: "40.0",
  hub_diameter: "73.1",
  type: { label: "Литые", value: "alloy" },
  color: "Темный (серый)",
  price: 12600,
  old_price: 13900,
  promotion: true,
  delivery: { delivery_min: 1, delivery_max: 3, delivery_days_after_order: 1 },
  count_in_stock: 4,
  images: [],
};

describe("toWheelListQuery", () => {
  it("test_wheel_query_maps_all_facets", () => {
    const q = toWheelListQuery(
      {
        width: 7,
        diameter: 16,
        pcd: "5*112",
        et: 40,
        hubBore: 73.1,
        wheelType: "alloy",
        brand: "ls",
        country: "taivan",
        delivery: ["between1and3days"],
        priceMin: 10000,
        priceMax: 20000,
        page: 2,
      },
      "chelyabinsk",
    );

    expect(q).toContain("width[]=7");
    expect(q).toContain("diameter[]=16");
    expect(q).toContain("pcd[]=5*112");
    expect(q).toContain("et[]=40");
    expect(q).toContain("hub_diameter[]=73.1");
    expect(q).toContain("type=alloy");
    expect(q).toContain("brand=ls");
    expect(q).toContain("country=taivan");
    expect(q).toContain("delivery[]=between1and3days");
    expect(q).toContain("price_min=10000");
    expect(q).toContain("price_max=20000");
    expect(q).toContain("page=2");
    expect(q).toContain("city=chelyabinsk");
    // каноничный вид: скобки не кодируются (%5B%5D), как у шин
    expect(q).not.toContain("%5B%5D");
  });
});

describe("toWheelFilterOptions", () => {
  it("test_wheel_filter_options_normalize_values", () => {
    const o = toWheelFilterOptions(filterDto);

    // значения — под URL/селекты (diameter → r15, decimal → число), метки — с бэка
    expect(o.diameters).toEqual([{ label: "15", value: "r15" }]);
    expect(o.widths).toEqual([{ label: "7.0", value: "7" }]);
    expect(o.pcds).toEqual([{ label: "4*100", value: "4*100" }]);
    expect(o.ets).toEqual([{ label: "40.0", value: "40" }]);
    expect(o.hubBores).toEqual([{ label: "73.1", value: "73.1" }]);
    expect(o.wheelTypes).toEqual([{ label: "Литые", value: "alloy" }]);
    expect(o.brands).toEqual([{ label: "LS", value: "ls" }]);
    expect(o.countries).toEqual([{ label: "Тайвань", value: "taivan" }]);
    expect(o.priceMin).toBe(10600);
    expect(o.priceMax).toBe(18900);
    // шинных фасетов у дисков нет
    expect(o.seasons).toEqual([]);
    expect(o.profiles).toEqual([]);
    expect(o.studded).toEqual([]);
  });
});

describe("toWheelProduct", () => {
  it("test_wheel_product_maps_listing_dto", () => {
    const p = toWheelProduct(baseDto);

    expect(p.category).toBe("wheels");
    expect(p.id).toBe("195");
    expect(p.title).toBe(baseDto.name);
    expect(p.sizeSlug).toBe(baseDto.slug);
    // короткий слаг модели — как у шин (полный «ls-367» срезается префиксом бренда)
    expect(p.modelSlug).toBe("367");
    expect(p.brandName).toBe("LS");
    // origin → параметры карточки (три записи, как у шин)
    expect(p.parameters).toHaveLength(3);
    expect(p.pickup?.value).toBe("17 Окт (Сб)");
    expect(p.pvzDelivery?.value).toBe("бесплатно");
    expect(p.quantity).toBe(4);
    expect(p.oldPrice).toBe(13900);
    expect(p.wheelType).toBe("alloy");
    expect(p.pcd).toBe("4*100");
    // пустые images → заглушка карточки; кода товара у дисков в контракте нет
    expect(p.image).toBe("/assets/img/wheel-product.png");
    expect(p.ean).toBe("");
  });
});
