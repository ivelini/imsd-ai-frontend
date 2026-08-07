// Product (страница товара) — сборка DTO; статика контента — в data/products.ts
import type { ProductDetailData } from "@/features/product/types";
import { ALL_PRODUCTS, SEASON_LABELS } from "@/data/catalog";
import {
  PRODUCT_STATIC,
  productDescriptionHtml,
  manufacturerBadgeText,
  productionCountryBadgeText,
  yearBadgeText,
} from "@/data/products";
import { delay } from "./base";

export type { ProductDetailData };

export async function getProduct(
  modelSlug: string,
  sizeSlug: string,
): Promise<ProductDetailData | null> {
  const product = ALL_PRODUCTS.find(
    (p) => p.modelSlug === modelSlug && p.sizeSlug === sizeSlug,
  );
  if (!product) return null;

  const seasonLabel = SEASON_LABELS[product.season] ?? product.season;
  const loadSpeedLabel = `${product.loadIndex}${product.speedRating}`;
  const spikesLabel = product.season === "winter" ? "Да" : "Нет";
  const runFlatLabel = ["michelin", "pirelli"].includes(product.brandId) ? "Да" : "Нет";
  const productionCountryLabel = product.countryLabel;

  const quantityOptions = [1, 2, 3, 4].map((q) => ({
    value: q,
    label: `${(product.price * q).toLocaleString("ru-RU")} ₽ - ${q} шт.`,
  }));

  return delay(50, {
    ...product,
    images: PRODUCT_STATIC.images,
    seasonLabel,
    loadSpeedLabel,
    spikesLabel,
    runFlatLabel,
    productionCountryLabel,
    quantityOptions,
    pickupDate: PRODUCT_STATIC.pickupDate,
    deliveryLabel: PRODUCT_STATIC.deliveryLabel,
    storeAddress: PRODUCT_STATIC.storeAddress,
    storeHours: PRODUCT_STATIC.storeHours,
    descriptionHtml: productDescriptionHtml(product.modelName, product.season),
    availabilityText: PRODUCT_STATIC.availabilityText,
    deliveryText: PRODUCT_STATIC.deliveryText,
    warrantyText: PRODUCT_STATIC.warrantyText,
    reviewCount: PRODUCT_STATIC.reviewCount,
    parameters: [
      { name: "Код товара:", value: product.code },
      {
        name: "Производитель:",
        value: product.brandName,
        badge: true,
        description: {
          title: product.brandName,
          text: manufacturerBadgeText(product.brandName),
        },
      },
      { name: "Ширина профиля:", value: String(product.width) },
      { name: "Высота профиля:", value: String(product.profile) },
      { name: "Посадочный диаметр:", value: String(product.diameter) },
      { name: "Сезонность:", value: seasonLabel },
      { name: "Страна бренда:", value: product.countryLabel },
      { name: "Индекс скорости и нагрузки:", value: loadSpeedLabel },
      {
        name: "Страна производства:",
        value: productionCountryLabel,
        badge: true,
        description: {
          title: `Страна производства — ${product.countryLabel}`,
          text: productionCountryBadgeText(product.countryLabel),
        },
      },
      {
        name: "Год выпуска:",
        value: product.year,
        badge: true,
        description: {
          title: `Год выпуска — ${product.year}`,
          text: yearBadgeText(product.year),
        },
      },
      { name: "Шипы:", value: spikesLabel },
      { name: "Run flat:", value: runFlatLabel },
    ],
  });
}
