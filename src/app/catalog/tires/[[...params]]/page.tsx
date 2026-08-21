// Каталог шин: серверная страница с клиентским фильтром (фаза 2, API 21.08.2026)
import type { Metadata } from "next";
import { getCatalogFilters, getCatalogProducts, getGeo } from "@/shared/api/data";
import { parseCatalogParams, buildCatalogUrl } from "@/shared/lib/parseParams";
import { resolveCityLabel } from "@/shared/lib/cityUrl";
import { CatalogFilter } from "@/features/catalog/components/CatalogFilter";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Pagination } from "@/features/catalog/components/Pagination";

interface PageProps {
  params: Promise<{ params?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** SEO-мета листинга: title/description от бэка (город — предложный падеж, при brand — «Шины Michelin в Челябинске»). */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const filter = parseCatalogParams(resolvedParams, resolvedSearchParams);
  const cityValue = typeof resolvedSearchParams.city === "string" ? resolvedSearchParams.city : undefined;
  const result = await getCatalogProducts(filter, cityValue);

  return {
    title: result.seo?.title ?? "Каталог шин",
    description: result.seo?.description ?? undefined,
  };
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const filter = parseCatalogParams(resolvedParams, resolvedSearchParams);
  const cityValue = typeof resolvedSearchParams.city === "string" ? resolvedSearchParams.city : undefined;

  // Город в query идёт слагом city= — бэк резолвит сам, поэтому один параллельный RTT
  const [filters, result, geo] = await Promise.all([
    getCatalogFilters(),
    getCatalogProducts(filter, cityValue),
    getGeo(),
  ]);
  const cityLabel = resolveCityLabel(cityValue, geo.cities, geo.defaultCity);

  return (
    <section className="catalog-section container">
      <h2>{result.seo?.title ?? "Шины и диски"}</h2>
      <div className="main-content-catalog">
        <CatalogFilter options={filters} current={filter} trackUrl />
        <div className="catalog-with-products">
          {result.items.length === 0 ? (
            <p className="catalog-empty">Товаров не найдено</p>
          ) : (
            result.items.map((p) => <ProductCard product={p} showLink key={p.id} cityLabel={cityLabel} cityValue={cityValue} />)
          )}
        </div>
      </div>
        {result.total > result.perPage && (
            <Pagination
                current={result.page}
                total={Math.ceil(result.total / result.perPage)}
                buildHref={(page) => buildCatalogUrl({ ...filter, page }, cityValue)}
            />
        )}
    </section>
  );
}
