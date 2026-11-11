// Ссылки каталога: схема дисков с 10.11.2026 — зеркало шин.
//   карточка товара: /{tires|wheels}/{brand}/{model}/{size}
//   страница модели: /{tires|wheels}/{brand}/{model}
// У дисков sizeSlug — слаг позиции без префикса бренда; у шин — полный слаг позиции.
import { appendCityParam } from "@/shared/lib/cityUrl";

export interface ProductLink {
  category: "tires" | "wheels";
  brandSlug: string;
  modelSlug: string;
  sizeSlug: string;
}

/**
 * Адрес страницы товара. Модель неизвестна — сегмент «-»: бэк при model = null
 * модельный сегмент не сверяет, адрес остаётся рабочим.
 */
export function productUrl(product: ProductLink, city?: string): string {
  const size =
    product.category === "tires"
      ? product.sizeSlug
      : stripBrandPrefix(product.sizeSlug, product.brandSlug);
  const model = product.modelSlug || "-";

  return appendCityParam(`/${product.category}/${product.brandSlug}/${model}/${size}`, city ?? "");
}

/** Адрес страницы модели — пара «бренд + короткий слаг модели» (слаг уже без префикса). */
export function modelUrl(
  product: Pick<ProductLink, "category" | "brandSlug" | "modelSlug">,
  city?: string,
): string {
  return appendCityParam(
    `/${product.category}/${product.brandSlug}/${product.modelSlug}`,
    city ?? "",
  );
}

/** Крошка модели в карточке товара: модель есть — ссылка на её страницу, нет — крошки нет. */
export function modelCrumb(
  product: {
    category: "tires" | "wheels";
    brandSlug: string;
    modelSlug: string | null;
    modelName: string | null;
  },
  city?: string,
): { label: string; href: string } | null {
  if (!product.modelName || !product.modelSlug) return null;
  return {
    label: product.modelName,
    href: modelUrl(
      { category: product.category, brandSlug: product.brandSlug, modelSlug: product.modelSlug },
      city,
    ),
  };
}

/** Слаг диска начинается со слага бренда; нет префикса — slug остаётся как есть. */
function stripBrandPrefix(slug: string, brandSlug: string): string {
  const prefix = `${brandSlug}-`;
  return slug.startsWith(prefix) ? slug.slice(prefix.length) : slug;
}
