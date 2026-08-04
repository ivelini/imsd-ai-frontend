// Страница товара (фаза 3, 04.08.2026)
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct } from "@/shared/api/data";
import { resolveCityLabel, appendCityParam } from "@/shared/lib/cityUrl";
import { Breadcrumbs } from "@/shared/layout/Breadcrumbs";
import { ProductGallery } from "@/features/product/components/ProductGallery";
import { ProductDetails } from "@/features/product/components/ProductDetails";
import { ProductTabs } from "@/features/product/components/ProductTabs";

interface PageProps {
  params: Promise<{ modelSlug: string; sizeSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { modelSlug, sizeSlug } = await params;
  const product = await getProduct(modelSlug, sizeSlug);
  if (!product) return { title: "Товар не найден" };
  return {
    title: product.title,
    description: `Купить ${product.title} в Челябинске. Цена ${product.price.toLocaleString("ru-RU")} ₽.`,
  };
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const [{ modelSlug, sizeSlug }, resolvedSearch] = await Promise.all([params, searchParams]);
  const product = await getProduct(modelSlug, sizeSlug);

  if (!product) notFound();

  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const cityLabel = resolveCityLabel(cityValue);

  const breadcrumbs = [
    { label: "Главная", href: appendCityParam("/", cityValue ?? "") },
    { label: "Каталог шин", href: appendCityParam("/catalog/tires", cityValue ?? "") },
    { label: product.brandName, href: appendCityParam(`/tires/${product.modelSlug}`, cityValue ?? "") },
    { label: product.sizeTitle },
  ];

  return (
    <>
      <Breadcrumbs crumbs={breadcrumbs} />
      <div className="container product-container">
        <ProductGallery images={product.images} euLabel={product.euLabel} />
        <ProductDetails product={product} />
      </div>
      <ProductTabs product={product} />
    </>
  );
}
