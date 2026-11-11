// Типы страницы товара (фаза 3, 04.08.2026; живой API 22.10.2026)
// ProductDetailData — готовый к рендеру вид карточки, общий для шин и дисков
// (контракт api-contract.md: все label и тексты формирует бэк)

import type { OriginDto, TireListSeo } from "@/features/catalog/types";
import type { Badge } from "@/shared/types/badge";
import type { ProductParam } from "@/shared/types/product";

export type { ProductParam, ParamDescription } from "@/shared/types/product";

// ============================================================================
// DTO бэкенда
// ============================================================================

/** Ответ карточки: data + SEO-мета (как у листингов) + блок статьи в корне. */
export interface ProductResponseDto<T> {
  data: T;
  meta: { seo: TireListSeo | null };
  /** Блок статьи в корне ответа; поля нет — блока нет. */
  article?: string;
}

/** GET /api/catalog/tires/{brand}/{model}/{size} — поля листинга + товарные. */
export interface TireProductDto {
  id: number;
  ean: string | null;
  name: string;
  /** Nullable на бэке: позиции без слага (заполняется при следующем импорте). */
  slug: string | null;
  brand: { id: number; name: string; slug: string };
  model: { id: number; name: string; slug: string } | null;
  origin: OriginDto | null;
  width: number | null;
  profile: number | null;
  diameter: string | null;
  season: { label: string; value: string } | null;
  is_studded: boolean;
  euro_label: { rollingResistance: string; wetGrip: string; noiseEmission: string } | null;
  price: number | null;
  old_price: number | null;
  promotion: boolean;
  images: { id: number; url: string }[];
  /** Товарные поля, которых нет в листинге. */
  load_index: string | null;
  speed_index: string | null;
  is_runflat: boolean;
  /** Описание модели — plain text (XLSX); null — вкладка «Описание» скрыта. */
  description: string | null;
  delivery: { delivery_min: number; delivery_max: number; delivery_days_after_order: number } | null;
  count_in_stock: number | null;
  /** Стек баджей товара (модель → бренд); optional — на случай отката бэка. */
  badges?: Badge[];
}

/** GET /api/catalog/wheels/{brand}/{size} — модель в слаге не участвует. */
export interface WheelProductDto {
  id: number;
  ean: string | null;
  name: string;
  /** Nullable на бэке: позиции без слага (заполняется при следующем импорте). */
  slug: string | null;
  brand: { id: number; name: string; slug: string };
  model: { id: number; name: string; slug: string } | null;
  origin: OriginDto | null;
  width: string | null;
  diameter: number | null;
  pcd: string | null;
  et: string | null;
  hub_diameter: string | null;
  type: { label: string; value: string } | null;
  color: string | null;
  price: number | null;
  old_price: number | null;
  promotion: boolean;
  images: { id: number; url: string }[];
  description: string | null;
  delivery: { delivery_min: number; delivery_max: number; delivery_days_after_order: number } | null;
  count_in_stock: number | null;
  /** Стек баджей товара; optional — на случай отката бэка. */
  badges?: Badge[];
}

/** GET /api/reference/store — ключи ответа = ключи settings. */
export interface StoreSettingsDto {
  delivery_label: string;
  availability_text: string;
  delivery_text: string;
  warranty_text: string;
}

/** Настройки витрины для рендера (готовые строки). */
export interface StoreSettings {
  deliveryLabel: string;
  availabilityText: string;
  deliveryText: string;
  warrantyText: string;
}

// ============================================================================
// Данные для рендера
// ============================================================================

export interface ProductDetailData {
  id: string;
  category: "tires" | "wheels";
  title: string;
  /** Основное изображение — для корзины. */
  image: string;
  /** Галерея: [0] — основное. */
  images: string[];
  /** Сезон (только шины) — value для иконок сезонности. */
  season?: string;
  euLabel?: {
    rollingResistance: string;
    wetGrip: string;
    noiseEmission: number;
  };
  price?: number;
  oldPrice?: number;
  quantity: number | null;
  /** Параметры для parameters-list (формирует адаптер из DTO). */
  parameters: ProductParam[];
  /** Опции для <select> количества. */
  quantityOptions: Array<{
    value: number;
    label: string; // "29 999 ₽ - 1 шт."
  }>;
  /** Дата выдачи: готовая строка бэка (origin.delivery_days_after_order.badge). */
  pickupDate: string | null;
  /**
   * Блок самовывоза: городозависимый текст бэка (origin.delivery_days_after_order.description)
   * — строки «Адрес:»/«Время работы:» внутри. null — блок скрыт.
   */
  pickupPointText: string | null;
  deliveryLabel: string;
  /** Описание модели — plain text; null — вкладка скрыта. */
  description: string | null;
  availabilityText: string;
  deliveryText: string;
  warrantyText: string;
  /** Для крошек. */
  brandName: string;
  brandSlug: string;
  /** Позиция модели в крошках; null (шина без модели) — крошка не выводится. */
  modelName: string | null;
  modelSlug: string | null;
  sizeTitle: string;
  /** Стек баджей товара (текст, цвет, иконка, ссылка) — готовые данные бэка. */
  badges: Badge[];
}
