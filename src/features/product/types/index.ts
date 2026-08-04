// Типы страницы товара (фаза 3, 04.08.2026)
// ProductDetailData расширяет TireProduct готовыми для рендера строками
// (контракт api-contract.md: все label формирует «бэк»)

import type { TireProduct } from "@/features/catalog/types";

export interface ProductDetailData extends TireProduct {
  /** Галерея: массив изображений [0] = основное */
  images: string[];

  /** Готовые label для parameters-list (12 строк) */
  seasonLabel: string;
  loadSpeedLabel: string;
  spikesLabel: string;
  runFlatLabel: string;
  productionCountryLabel: string;

  /** Опции для <select> количества */
  quantityOptions: Array<{
    value: number;
    label: string; // "29 999 ₽ - 1 шт."
  }>;

  /** Информация о доставке/наличии в блоке payment-info */
  pickupDate: string;
  deliveryLabel: string;
  storeAddress: string;
  storeHours: string;

  /** Контент вкладок (готовый HTML/текст от «бэка») */
  descriptionHtml: string;
  availabilityText: string;
  deliveryText: string;
  warrantyText: string;
  reviewCount: number;
}
