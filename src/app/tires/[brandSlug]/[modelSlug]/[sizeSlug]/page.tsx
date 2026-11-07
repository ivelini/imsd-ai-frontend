// Страница товара шины: живой API (GET /api/catalog/tires/{brand}/{model}/{size}, 22.10.2026)
// {size} — полный слаг позиции из листинга; {brand}/{model} бэк сверяет со слагами товара.
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
  params: Promise<{ brandSlug: string; modelSlug: string; sizeSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function productRoute(params: { brandSlug: string; modelSlug: string; sizeSlug: string }) {
  return {
    category: "tires" as const,
    brand: params.brandSlug,
    model: params.modelSlug,
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

export default async function ProductPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearch] = await Promise.all([params, searchParams]);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const result = await getProduct(productRoute(resolvedParams), cityValue);

  if (!result) notFound();
  const { product } = result;

  const breadcrumbs = [
    { label: "Главная", href: appendCityParam("/", cityValue ?? "") },
    { label: "Каталог шин", href: appendCityParam("/catalog/tires", cityValue ?? "") },
    // Бренд — листинг каталога с фильтром: страницы бренда в схеме роутов нет
    {
      label: product.brandName,
      href: appendCityParam(`/catalog/tires/${product.brandSlug}`, cityValue ?? ""),
    },
    // Модель — страница модели; шина без модели крошку не получает
    ...(product.modelName && product.modelSlug
      ? [
          {
            label: product.modelName,
            href: appendCityParam(
              `/tires/${product.brandSlug}/${product.modelSlug}`,
              cityValue ?? "",
            ),
          },
        ]
      : []),
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
