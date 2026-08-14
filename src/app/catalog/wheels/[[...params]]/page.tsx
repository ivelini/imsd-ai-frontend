// Каталог дисков: серверная страница с клиентским фильтром (фаза 2)
import { getWheelsFilters, getWheelsProducts, getGeo } from "@/shared/api/data";
import { parseWheelsParams, buildWheelsUrl } from "@/shared/lib/parseParams";
import { resolveCityLabel } from "@/shared/lib/cityUrl";
import { CatalogFilter } from "@/features/catalog/components/CatalogFilter";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Pagination } from "@/features/catalog/components/Pagination";

interface PageProps {
  params: Promise<{ params?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function WheelsCatalogPage({ params, searchParams }: PageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const filter = parseWheelsParams(resolvedParams, resolvedSearchParams);
  const cityValue = typeof resolvedSearchParams.city === "string" ? resolvedSearchParams.city : undefined;

  const [filters, result, geo] = await Promise.all([
    getWheelsFilters(),
    getWheelsProducts(filter, cityValue),
    getGeo(),
  ]);
  const cityLabel = resolveCityLabel(cityValue, geo.cities, geo.defaultCity);

  return (
    <section className="catalog-section container">
      <h2>Диски в Челябинске</h2>
      <div className="main-content-catalog">
        <CatalogFilter options={filters} current={filter} trackUrl category="wheels" />
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
                buildHref={(page) => buildWheelsUrl({ ...filter, page }, cityValue)}
            />
        )}
    </section>
  );
}
