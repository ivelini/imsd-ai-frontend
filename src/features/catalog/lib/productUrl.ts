// Ссылка карточки товара — схема API 1:1 (22.10.2026):
//   шины  /tires/{brand}/{model}/{size}  — size = полный слаг позиции
//   диски /wheels/{brand}/{size}         — size = слаг без префикса бренда (модели в слаге нет)
import { appendCityParam } from "@/shared/lib/cityUrl";

export interface ProductLink {
  category: "tires" | "wheels";
  brandSlug: string;
  modelSlug: string;
  sizeSlug: string;
}

/**
 * Адрес страницы товара. У шины без модели сегмент «-»: бэк при model = null
 * модельный сегмент не сверяет, адрес остаётся рабочим.
 */
export function productUrl(product: ProductLink, city?: string): string {
  const base =
    product.category === "tires"
      ? `/tires/${product.brandSlug}/${product.modelSlug || "-"}/${product.sizeSlug}`
      : `/wheels/${product.brandSlug}/${stripBrandPrefix(product.sizeSlug, product.brandSlug)}`;

  return appendCityParam(base, city ?? "");
}

/** Слаг диска начинается со слага бренда; нет префикса — slug остаётся как есть. */
function stripBrandPrefix(slug: string, brandSlug: string): string {
  const prefix = `${brandSlug}-`;
  return slug.startsWith(prefix) ? slug.slice(prefix.length) : slug;
}
