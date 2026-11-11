// Ссылки карточек товара (тест-лист плана product-card-live; адреса дисков обновлены планом
// wheel-models-live): шины и диски — три сегмента: бренд, модель, слаг позиции.
// Диски: sizeSlug — слаг позиции без префикса бренда; модель — короткий слаг.
import { describe, expect, it } from "vitest";
import { modelUrl, productUrl } from "@/features/catalog/lib/productUrl";

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

  it("test_wheel_product_url_includes_model", () => {
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
      "/wheels/ls/ls-367/disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1?city=chelyabinsk",
    );

    // префикса бренда в слаге нет — slug остаётся как есть
    const asIs = productUrl({
      category: "wheels",
      brandSlug: "ls",
      modelSlug: "ls-367",
      sizeSlug: "disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1",
    });
    expect(asIs).toBe("/wheels/ls/ls-367/disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1");
  });

  it("test_wheel_product_url_without_model", () => {
    // модель неизвестна — сегмент «-»: API модель не сверяет, адрес остаётся рабочим
    const url = productUrl({
      category: "wheels",
      brandSlug: "aplus",
      modelSlug: "",
      sizeSlug: "aplus-disk-16x7-5x1143-et45",
    });

    expect(url).toBe("/wheels/aplus/-/disk-16x7-5x1143-et45");
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

describe("modelUrl", () => {
  it("test_model_url_by_category", () => {
    // modelSlug приходит из адаптеров уже коротким: «ls-367» остаётся как есть,
    // повторное срезание «ls-» увело бы крошку на /wheels/ls/367
    expect(
      modelUrl({ category: "wheels", brandSlug: "ls", modelSlug: "ls-367" }, "chelyabinsk"),
    ).toBe("/wheels/ls/ls-367?city=chelyabinsk");

    expect(
      modelUrl({ category: "tires", brandSlug: "yokohama", modelSlug: "bluearth-ae61" }),
    ).toBe("/tires/yokohama/bluearth-ae61");
  });
});
