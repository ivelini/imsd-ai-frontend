// Адаптеры и адреса карточки модели шин и дисков (тест-лист плана wheel-models-live)
// GET /api/catalog/{tire|wheel}-models/{brand}/{model} + размеры через листинг категории
// с фильтрами model/brand/diameter (бэк ждёт короткий слаг модели + бренд)
import { afterEach, describe, expect, it, vi } from "vitest";
import { getModelCard, modelCardPath, modelSizesUrl, toModelCard } from "@/shared/api/catalog";
import { PRODUCT_PLACEHOLDER } from "@/shared/lib/productImage";
import type { ModelCardDto } from "@/features/catalog/types";
import { mockFetch } from "./helpers/mockFetch";

const wheelModelDto: ModelCardDto = {
  slug: "kinergy",
  name: "Kinergy",
  brand: { id: 3, name: "Hankook", slug: "hankook" },
  image_url: "http://localhost:8081/storage/images/w.jpg",
  params: [
    { name: "Тип", value: "Литые, Стальные" },
    { name: "Цвет", value: "Серебристый, Чёрный" },
    { name: "Страна", value: "Германия, Япония" },
  ],
  description: "<p>Описание модели</p>",
  diameters: [
    { value: "16", count: 2 },
    { value: "17", count: 1 },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("toModelCard", () => {
  it("test_model_card_maps_diameters_to_r_keys", () => {
    const m = toModelCard(wheelModelDto);

    expect(m.slug).toBe("kinergy");
    expect(m.name).toBe("Kinergy");
    expect(m.brandName).toBe("Hankook");
    expect(m.brandSlug).toBe("hankook");
    // диаметры нормализуются в r-ключи вкладок (count — из модели)
    expect(m.diameters).toEqual([
      { value: "r16", count: 2 },
      { value: "r17", count: 1 },
    ]);
  });

  it("test_model_card_image_falls_back_to_placeholder", () => {
    const m = toModelCard({ ...wheelModelDto, image_url: null });
    expect(m.image).toBe(PRODUCT_PLACEHOLDER);
  });

  it("test_model_card_params_and_description_pass_through", () => {
    const m = toModelCard({ ...wheelModelDto, description: null });

    expect(m.params).toHaveLength(3);
    expect(m.description).toBeNull();
  });

  it("test_model_card_badges_pass_through", () => {
    const withBadges = toModelCard({
      ...wheelModelDto,
      badges: [
        {
          text: "Хит продаж",
          color: "red",
          icon_key: null,
          link: null,
          owner_type: "brand",
          owner_name: "Hankook",
        },
        {
          text: "Новинка",
          color: "gold",
          icon_key: "gold",
          link: "/promo",
          owner_type: "model",
          owner_name: "Kinergy",
        },
      ],
    });
    // порядок и дедуп — на бэке: фронт переносит стек как есть
    expect(withBadges.badges).toHaveLength(2);
    expect(withBadges.badges[0].text).toBe("Хит продаж");

    expect(toModelCard(wheelModelDto).badges).toEqual([]);
  });
});

describe("modelCardPath", () => {
  it("test_model_card_path_uses_category_endpoint", () => {
    const wheels = modelCardPath({
      category: "wheels",
      brandSlug: "hankook",
      modelSlug: "kinergy",
      city: "chelyabinsk",
    });
    const tires = modelCardPath({
      category: "tires",
      brandSlug: "yokohama",
      modelSlug: "bluearth-ae61",
      city: "chelyabinsk",
    });

    expect(wheels).toBe("/catalog/wheel-models/hankook/kinergy?city=chelyabinsk");
    expect(tires).toBe("/catalog/tire-models/yokohama/bluearth-ae61?city=chelyabinsk");
  });
});

describe("getModelCard", () => {
  it("test_model_card_404_returns_null", async () => {
    mockFetch(() => ({ status: 404 }));

    const result = await getModelCard({
      category: "wheels",
      brandSlug: "hankook",
      modelSlug: "kinergy",
    });

    expect(result).toBeNull();
  });
});

describe("modelSizesUrl", () => {
  it("test_model_sizes_url_maps_filters", () => {
    const url = modelSizesUrl({
      category: "wheels",
      brandSlug: "hankook",
      modelSlug: "kinergy",
      diameter: "r16",
      city: "chelyabinsk",
    });

    expect(url).toContain("/catalog/wheels?");
    expect(url).toContain("model=kinergy");
    expect(url).toContain("brand=hankook");
    expect(url).toContain("diameter[]=16");
    expect(url).toContain("city=chelyabinsk");
    expect(url).toContain("per_page=100");
    expect(url).not.toContain("%5B%5D");
  });
});
