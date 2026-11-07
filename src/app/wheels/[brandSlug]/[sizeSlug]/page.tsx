// Страница товара диска: живой API (GET /api/catalog/wheels/{brand}/{size}, 22.10.2026)
// Модели в слаге диска нет: {size} — слаг позиции без префикса бренда.
// Макета дискового товара нет — вёрстка шинной карточки, параметры дисков.
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/shared/api/data";
import { appendCityParam } from "@/shared/lib/cityUrl";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { Badges } from "@/shared/ui/Badge";
import { ProductGallery } from "@/features/product/components/ProductGallery";
import { ProductDetails } from "@/features/product/components/ProductDetails";
import { ProductTabs } from "@/features/product/components/ProductTabs";

interface PageProps {
  params: Promise<{ brandSlug: string; sizeSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function productRoute(params: { brandSlug: string; sizeSlug: string }) {
  return {
    category: "wheels" as const,
    brand: params.brandSlug,
    size: params.sizeSlug,
  };
}

/** SEO-мета: title/description от бэка (город — предложный падеж). */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const result = await getProduct(productRoute(resolvedParams), cityValue);

  if (!result) return { title: "Товар не найден" };

  return {
    title: result.seo?.title ?? result.product.title,
    description: result.seo?.description ?? undefined,
  };
}

export default async function WheelProductPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const result = await getProduct(productRoute(resolvedParams), cityValue);

  if (!result) notFound();
  const { product } = result;

  const breadcrumbs = [
    { label: "Главная", href: appendCityParam("/", cityValue ?? "") },
    { label: "Каталог дисков", href: appendCityParam("/catalog/wheels", cityValue ?? "") },
    {
      label: product.brandName,
      href: appendCityParam(`/catalog/wheels/${resolvedParams.brandSlug}`, cityValue ?? ""),
    },
    { label: product.sizeTitle },
  ];

  return (
    <>
      <Badges badges={product.badges} />
      <Breadcrumbs crumbs={breadcrumbs} />
      <div className="container product-container">
        <ProductGallery images={product.images} season={product.season} euLabel={product.euLabel} />
        <ProductDetails product={product} />
      </div>
      {/* key — смена товара пересоздаёт вкладки: активная вкладка не должна остаться от прошлого товара */}
      <ProductTabs key={product.id} product={product} article={result.article} />
    </>
  );
}
