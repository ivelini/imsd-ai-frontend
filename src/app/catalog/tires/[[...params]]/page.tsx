// Каталог шин: серверная страница с клиентским фильтром (фаза 2)
import { getCatalogFilters, getCatalogProducts } from "@/shared/api/data";
import { parseCatalogParams, buildCatalogUrl } from "@/shared/lib/parseParams";
import { CatalogFilter } from "@/features/catalog/components/CatalogFilter";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Pagination } from "@/features/catalog/components/Pagination";
import { SeoBlock } from "@/features/catalog/components/SeoBlock";

interface PageProps {
  params: Promise<{ params?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CatalogPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const filter = parseCatalogParams(resolvedParams, resolvedSearchParams);

  const [filters, result] = await Promise.all([
    getCatalogFilters(),
    getCatalogProducts(filter),
  ]);

  return (
    <section className="catalog-section container">
      <h2>Шины на авто в Челябинске</h2>
      <div className="main-content-catalog">
        <CatalogFilter options={filters} current={filter} trackUrl />
        <div className="catalog-with-products">
          {result.items.length === 0 ? (
            <p className="catalog-empty">Товаров не найдено</p>
          ) : (
            result.items.map((p) => <ProductCard product={p} showLink key={p.id} />)
          )}
        </div>
      </div>
        {result.total > result.perPage && (
            <Pagination
                current={result.page}
                total={Math.ceil(result.total / result.perPage)}
                buildHref={(page) => buildCatalogUrl({ ...filter, page })}
            />
        )}
      <SeoBlock brand={filter.brand} season={filter.season} />
    </section>
  );
}
