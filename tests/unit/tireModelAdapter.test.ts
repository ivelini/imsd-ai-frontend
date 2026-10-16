// Адаптеры живого API модели шин (тест-лист плана tire-model-live)
// GET /api/catalog/tire-models/{brand}/{model} + размеры через листинг
// с фильтрами model/brand/diameter (бэк ждёт короткий слаг модели + бренд)
import { describe, expect, it } from "vitest";
import { toModelSizesQuery, toTireModel } from "@/shared/api/catalog";
import type { TireModelDto } from "@/features/catalog/types";

const modelDto: TireModelDto = {
  slug: "bluearth-ae61",
  name: "BluEarth AE61",
  brand: { id: 4, name: "Yokohama", slug: "yokohama" },
  image_url: "http://localhost:8081/storage/images/a.jpg",
  params: [
    { name: "Сезон", value: "Летняя" },
    { name: "Шипы", value: "Не шипованная" },
    { name: "Страна", value: "Япония" },
  ],
  description: null,
  diameters: [
    { value: "16", count: 2 },
    { value: "18", count: 5 },
  ],
};

describe("toTireModel", () => {
  it("test_model_maps_dto_with_diameter_r_keys", () => {
    const m = toTireModel(modelDto);

    expect(m.slug).toBe("bluearth-ae61");
    expect(m.name).toBe("BluEarth AE61");
    expect(m.brandName).toBe("Yokohama");
    expect(m.brandSlug).toBe("yokohama");
    expect(m.image).toBe("http://localhost:8081/storage/images/a.jpg");
    // параметры и описание едут как есть (description null — блок на странице скрыт)
    expect(m.params).toHaveLength(3);
    expect(m.description).toBeNull();
    // диаметры нормализуются в r-ключи вкладок (count — из модели)
    expect(m.diameters).toEqual([
      { value: "r16", count: 2 },
      { value: "r18", count: 5 },
    ]);
  });
});

describe("toModelSizesQuery", () => {
  it("test_model_sizes_query_maps_filters", () => {
    const q = toModelSizesQuery("bluearth-ae61", "yokohama", "r18", "chelyabinsk");

    expect(q).toContain("model=bluearth-ae61");
    expect(q).toContain("brand=yokohama");
    expect(q).toContain("diameter[]=18");
    expect(q).toContain("city=chelyabinsk");
    expect(q).not.toContain("%5B%5D");
  });
});
