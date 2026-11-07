// Ссылки карточек товара (тест-лист плана product-card-live)
// Шины: три сегмента, sizeSlug — полный слаг позиции (как в API).
// Диски: два сегмента, sizeSlug — слаг позиции без префикса бренда (как в API).
import { describe, expect, it } from "vitest";
import { productUrl } from "@/features/catalog/lib/productUrl";

describe("productUrl", () => {
  it("test_tire_product_url", () => {
    const url = productUrl(
      {
        category: "tires",
        brandSlug: "yokohama",
        modelSlug: "bluearth-e70b",
        sizeSlug: "yokohama-bluearth-e70b-215-55-r17-94v",
      },
      "chelyabinsk",
    );

    expect(url).toBe(
      "/tires/yokohama/bluearth-e70b/yokohama-bluearth-e70b-215-55-r17-94v?city=chelyabinsk",
    );
  });

  it("test_wheel_product_url", () => {
    const stripped = productUrl(
      {
        category: "wheels",
        brandSlug: "ls",
        modelSlug: "ls-367",
        sizeSlug: "ls-disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1",
      },
      "chelyabinsk",
    );
    expect(stripped).toBe(
      "/wheels/ls/disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1?city=chelyabinsk",
    );

    // префикса бренда в слаге нет — slug остаётся как есть
    const asIs = productUrl({
      category: "wheels",
      brandSlug: "ls",
      modelSlug: "ls-367",
      sizeSlug: "disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1",
    });
    expect(asIs).toBe("/wheels/ls/disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1");
  });

  it("test_tire_product_url_without_model", () => {
    const url = productUrl({
      category: "tires",
      brandSlug: "aplus",
      modelSlug: "",
      sizeSlug: "aplus-a503-175-65-r14-86t-studded",
    });

    expect(url).toBe("/tires/aplus/-/aplus-a503-175-65-r14-86t-studded");
  });
});
