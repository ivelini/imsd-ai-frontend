// Карточка товара — живой API (22.10.2026):
//   шины  GET /api/catalog/tires/{brand}/{model}/{size}
//   диски GET /api/catalog/wheels/{brand}/{size}
//   витрина GET /api/reference/store
// Адресация — слагами, как у листинга: {size} — слаг позиции (у диска без префикса бренда).
import { apiBase, cityQuery } from "./base";
import { toOriginParam } from "./origin";
import type { TireListSeo } from "@/features/catalog/types";
import type {
  ProductDetailData,
  ProductResponseDto,
  StoreSettings,
  StoreSettingsDto,
  TireProductDto,
  WheelProductDto,
} from "@/features/product/types";
import { decimal } from "@/shared/lib/decimal";
import { PRODUCT_PLACEHOLDER } from "@/shared/lib/productImage";
import { toArticleBlock } from "@/shared/lib/articleBlock";
import type { ProductParam } from "@/shared/types/product";
import type { ArticleBlockData } from "@/shared/types/articleBlock";

export type { ProductDetailData };

export type TireProductRoute = {
  category: "tires";
  brand: string;
  model: string;
  size: string;
};

export type WheelProductRoute = {
  category: "wheels";
  brand: string;
  size: string;
};

export type ProductRoute = TireProductRoute | WheelProductRoute;

export interface ProductResult {
  product: ProductDetailData;
  seo: TireListSeo | null;
  article: ArticleBlockData | null;
}

/** Количество вариантов для селекта количества (как в макете). */
const QUANTITY_OPTIONS = [1, 2, 3, 4];

const EMPTY_STORE: StoreSettingsDto = {
  delivery_label: "",
  availability_text: "",
  delivery_text: "",
  warranty_text: "",
};

function productPath(route: ProductRoute): string {
  return route.category === "tires"
    ? `/catalog/tires/${encodeURIComponent(route.brand)}/${encodeURIComponent(route.model)}/${encodeURIComponent(route.size)}`
    : `/catalog/wheels/${encodeURIComponent(route.brand)}/${encodeURIComponent(route.size)}`;
}

const toStoreSettings = (dto: StoreSettingsDto): StoreSettings => ({
  deliveryLabel: dto.delivery_label,
  availabilityText: dto.availability_text,
  deliveryText: dto.delivery_text,
  warrantyText: dto.warranty_text,
});

/**
 * Настройки витрины (тексты вкладок, плашка доставки). Сбой эндпоинта не валит
 * карточку: пустая витрина → соответствующие вкладки скрыты на фронте.
 * Адрес/часы самовывоза — не здесь, а в origin карточки (городозависимо).
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const res = await fetch(`${apiBase()}/reference/store`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const body = (await res.json()) as { data: StoreSettingsDto };
    return toStoreSettings(body.data);
  } catch (error) {
    console.warn("getStoreSettings: настройки витрины недоступны", error);
    return toStoreSettings(EMPTY_STORE);
  }
}

/** Карточка товара: 404 → null (страница отдаёт notFound). */
export async function getProduct(
  route: ProductRoute,
  city?: string,
): Promise<ProductResult | null> {
  const [res, store] = await Promise.all([
    fetch(`${apiBase()}${productPath(route)}${cityQuery(city)}`),
    getStoreSettings(),
  ]);

  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`getProduct: HTTP ${res.status}`);
  }

  const body = (await res.json()) as ProductResponseDto<TireProductDto | WheelProductDto>;
  return {
    product: toProductDetail(body.data, store),
    seo: body.meta.seo ?? null,
    article: toArticleBlock(body.article),
  };
}

/** DTO карточки → ProductDetailData (шина/диск — по наличию дисковых полей). */
export function toProductDetail(
  dto: TireProductDto | WheelProductDto,
  store: StoreSettings,
): ProductDetailData {
  return "pcd" in dto ? toWheelDetail(dto, store) : toTireDetail(dto, store);
}

/** Общая часть карточки шины и диска; различия — категория, параметры и строка размера. */
interface DetailBase {
  category: ProductDetailData["category"];
  parameters: ProductParam[];
  sizeTitle: string;
}

function baseDetail(
  dto: TireProductDto | WheelProductDto,
  store: StoreSettings,
  detail: DetailBase,
): ProductDetailData {
  const images = dto.images.map((image) => image.url);
  const price = dto.price ?? undefined;

  // Галерея без изображений — заглушка: основной <img> не должен остаться пустым
  if (images.length === 0) images.push(PRODUCT_PLACEHOLDER);

  return {
    id: String(dto.id),
    category: detail.category,
    title: dto.name,
    image: images[0] ?? PRODUCT_PLACEHOLDER,
    images,
    price,
    oldPrice: dto.old_price ?? undefined,
    quantity: dto.count_in_stock ?? null,
    parameters: detail.parameters,
    quantityOptions: QUANTITY_OPTIONS.map((q) => ({
      value: q,
      label: `${((price ?? 0) * q).toLocaleString("ru-RU")} ₽ - ${q} шт.`,
    })),
    // Дата выдачи — готовая строка бэка; нет плашки — строку скрывает фронт
    pickupDate: dto.origin?.delivery_days_after_order?.badge ?? null,
    // Текст самовывоза с адресом/часами — городозависимый, идёт вместе с товаром
    pickupPointText: dto.origin?.delivery_days_after_order?.description ?? null,
    ...store,
    description: dto.description,
    brandName: dto.brand.name,
    brandSlug: dto.brand.slug,
    modelName: dto.model?.name ?? null,
    modelSlug: dto.model?.slug ?? null,
    sizeTitle: detail.sizeTitle,
    // Стек баджей — готовые данные бэка; поля может не быть (откат бэка) → пустой стек
    badges: dto.badges ?? [],
  };
}

/** Общие параметры шины и диска до специфичных: код товара и производитель. */
function originHeadParameters(dto: TireProductDto | WheelProductDto): ProductParam[] {
  const parameters: ProductParam[] = [];

  // Строку «Страна бренда» не выводим — страны бренда в данных нет (ТЗ product-card-backend §6.6)
  if (dto.ean) parameters.push({ name: "Код товара:", value: dto.ean });

  const vendor = toOriginParam("Производитель:", dto.origin?.vendor);
  if (vendor) parameters.push(vendor);

  return parameters;
}

/** Общие параметры в конце списка: страна производства и год выпуска. */
function originTailParameters(dto: TireProductDto | WheelProductDto): ProductParam[] {
  const country = toOriginParam("Страна производства:", dto.origin?.manufacture_country);
  const year = toOriginParam("Год выпуска:", dto.origin?.manufacture_year);
  return [country, year].filter((p): p is ProductParam => p !== null);
}

function tireParameters(dto: TireProductDto): ProductParam[] {
  const parameters = originHeadParameters(dto);

  if (dto.width !== null) parameters.push({ name: "Ширина профиля:", value: String(dto.width) });
  if (dto.profile !== null) parameters.push({ name: "Высота профиля:", value: String(dto.profile) });
  if (dto.diameter !== null) parameters.push({ name: "Посадочный диаметр:", value: dto.diameter });
  if (dto.season) parameters.push({ name: "Сезонность:", value: dto.season.label });

  const loadSpeed = `${dto.load_index ?? ""}${dto.speed_index ?? ""}`;
  if (loadSpeed) parameters.push({ name: "Индекс скорости и нагрузки:", value: loadSpeed });

  parameters.push(...originTailParameters(dto));

  // «Да/Нет» на фронте — согласовано в ТЗ (§6.5): бэк отдаёт bool
  parameters.push({ name: "Шипы:", value: dto.is_studded ? "Да" : "Нет" });
  parameters.push({ name: "Run flat:", value: dto.is_runflat ? "Да" : "Нет" });

  return parameters;
}

function tireSizeTitle(dto: TireProductDto): string {
  const sizeParts = [dto.width, dto.profile].filter((v) => v !== null);
  return [
    sizeParts.length > 0 ? sizeParts.join("/") : null,
    dto.diameter !== null ? `R${dto.diameter}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function toTireDetail(dto: TireProductDto, store: StoreSettings): ProductDetailData {
  return {
    ...baseDetail(dto, store, {
      category: "tires",
      parameters: tireParameters(dto),
      sizeTitle: tireSizeTitle(dto),
    }),
    season: dto.season?.value,
    euLabel: dto.euro_label
      ? { ...dto.euro_label, noiseEmission: Number(dto.euro_label.noiseEmission) }
      : undefined,
  };
}

function wheelParameters(dto: WheelProductDto): ProductParam[] {
  const parameters = originHeadParameters(dto);

  if (dto.width !== null) parameters.push({ name: "Ширина:", value: `${decimal(dto.width)}J` });
  if (dto.diameter !== null) {
    parameters.push({ name: "Посадочный диаметр:", value: String(dto.diameter) });
  }
  if (dto.pcd !== null) parameters.push({ name: "PCD:", value: dto.pcd.replace(/\*/g, "x") });
  if (dto.et !== null) parameters.push({ name: "Вылет (ET):", value: decimal(dto.et) });
  if (dto.hub_diameter !== null) {
    parameters.push({ name: "Диаметр ступицы:", value: decimal(dto.hub_diameter) });
  }
  if (dto.type) parameters.push({ name: "Тип диска:", value: dto.type.label });
  if (dto.color) parameters.push({ name: "Цвет:", value: dto.color });

  parameters.push(...originTailParameters(dto));

  return parameters;
}

function wheelSizeTitle(dto: WheelProductDto): string {
  return [
    dto.width !== null ? `${decimal(dto.width)}J` : "",
    dto.diameter !== null ? `R${dto.diameter}` : "",
    dto.pcd ?? "",
    dto.et !== null ? `ET${decimal(dto.et)}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function toWheelDetail(dto: WheelProductDto, store: StoreSettings): ProductDetailData {
  return baseDetail(dto, store, {
    category: "wheels",
    parameters: wheelParameters(dto),
    sizeTitle: wheelSizeTitle(dto),
  });
}
