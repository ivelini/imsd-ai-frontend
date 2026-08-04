// Подбор дисков по автомобилю: серверный каскад (фаза 2)
import Link from "next/link";
import {
  getWheelsFilters,
  getWheelsAutoBrands,
  getWheelsAutoModels,
  getWheelsAutoYears,
  getWheelsAutoModifications,
  fetchWheelsAutoResult,
  getWheelsCarBlock,
} from "@/shared/api/data";
import { CatalogFilter, type AutoFilterData } from "@/features/catalog/components/CatalogFilter";
import { AutoResultView } from "@/features/catalog/components/AutoResultView";
import { parseWheelsParams, buildQueryString } from "@/shared/lib/parseParams";
import { resolveCityLabel } from "@/shared/lib/cityUrl";
import type { FilterState } from "@/features/catalog/types";

interface PageProps {
  params: Promise<{ auto?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Обёртка: сайдбар фильтра + контент справа */
async function CatalogLayout({
  children,
  autoData,
  current,
}: {
  children: React.ReactNode;
  autoData?: AutoFilterData;
  current: FilterState;
}) {
  const filters = await getWheelsFilters();
  return (
    <div className="main-content-catalog">
      <CatalogFilter options={filters} current={current} initialTab="car" autoData={autoData} category="wheels" />
      <div className="catalog-with-products">{children}</div>
    </div>
  );
}

export default async function WheelsAutoPage({ params, searchParams }: PageProps) {
  const [resolved, resolvedSearch] = await Promise.all([params, searchParams]);
  const segments = resolved.auto ?? [];
  const current = parseWheelsParams({ params: [] }, resolvedSearch);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const cityLabel = resolveCityLabel(cityValue);
  const qs = buildQueryString(current, false, cityValue);

  // Уровень 0: список марок
  if (segments.length === 0) {
    const brands = await getWheelsAutoBrands();
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current}>
          <div className="auto-models">
            <h2 className="auto-models-title">Список моделей автомобилей</h2>
            <div className="auto-models-list">
              {brands.map((b) => (
                <Link key={b.id} href={`/catalog/wheels/auto/${b.id}${qs}`}>
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
      </section>
    );
  }

  const [brand, model, yearStr, mod] = segments;

  // Уровень 1: список моделей
  if (!model) {
    const [models, brands] = await Promise.all([getWheelsAutoModels(brand), getWheelsAutoBrands()]);
    const brandData = brands.find((b) => b.id === brand);
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current} autoData={{ brand, brandName: brandData?.name, models }}>
          <div className="auto-models">
            <h2 className="auto-models-title">Список моделей {brandData?.name ?? brand}</h2>
            <div className="auto-models-list">
              {models.map((m) => (
                <Link key={m.slug} href={`/catalog/wheels/auto/${brand}/${m.slug}${qs}`}>{m.name}</Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
      </section>
    );
  }

  // Уровень 2: список годов
  if (!yearStr) {
    const [years, brands, models] = await Promise.all([
      getWheelsAutoYears(brand, model),
      getWheelsAutoBrands(),
      getWheelsAutoModels(brand),
    ]);
    const brandData = brands.find((b) => b.id === brand);
    const modelData = brandData?.models.find((m) => m.slug === model);
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current} autoData={{ brand, brandName: brandData?.name, model, modelName: modelData?.name, models, years }}>
          <div className="auto-models">
            <h2 className="auto-models-title">Выберите год выпуска</h2>
            <div className="auto-models-list">
              {years.map((y) => (
                <Link key={y} href={`/catalog/wheels/auto/${brand}/${model}/${y}${qs}`}>{y}</Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
      </section>
    );
  }

  const year = parseInt(yearStr, 10);

  // Уровень 3: список модификаций
  if (!mod) {
    const [modifications, brands, models, years] = await Promise.all([
      getWheelsAutoModifications(brand, model, year),
      getWheelsAutoBrands(),
      getWheelsAutoModels(brand),
      getWheelsAutoYears(brand, model),
    ]);
    const brandData = brands.find((b) => b.id === brand);
    const modelData = brandData?.models.find((m) => m.slug === model);
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current}
          autoData={{ brand, brandName: brandData?.name, model, modelName: modelData?.name, year: yearStr, models, years, modifications }}>
          <div className="auto-models">
            <h2 className="auto-models-title">Выберите модификацию</h2>
            <div className="auto-models-list">
              {modifications.map((m) => (
                <Link key={m.id} href={`/catalog/wheels/auto/${brand}/${model}/${year}/${m.id}${qs}`}>{m.name}</Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
      </section>
    );
  }

  // Уровень 4: результат с CarBlock + парами дисков
  const [result, carBlock, filters, brands, models, years, modifications] = await Promise.all([
    fetchWheelsAutoResult(brand, model, year, mod, current),
    getWheelsCarBlock(brand, model, year, mod),
    getWheelsFilters(),
    getWheelsAutoBrands(),
    getWheelsAutoModels(brand),
    getWheelsAutoYears(brand, model),
    getWheelsAutoModifications(brand, model, year),
  ]);

  if (!result) {
    return (
      <section className="catalog-section container">
        <p>Для выбранного автомобиля товаров не найдено.</p>
      </section>
    );
  }

  const brandData = brands.find((b) => b.id === brand);
  const modelData = brandData?.models.find((m) => m.slug === model);
  const modData = modifications.find((m) => m.id === mod);

  return (
    <section className="catalog-section container">
      <h2>Диски на {brand.toUpperCase()} {model} {mod}, {year} г. в Челябинске</h2>
      <div className="main-content-catalog">
        <CatalogFilter
          options={filters}
          current={current}
          initialTab="car"
          autoData={{ brand, brandName: brandData?.name, model, modelName: modelData?.name, year: yearStr, mod, modName: modData?.name, models, years, modifications }}
          category="wheels"
        />
        <div className="catalog-with-products">
          {carBlock && (
            <AutoResultView
              carBlock={carBlock}
              sections={result}
              cityLabel={cityLabel}
              cityValue={cityValue}
            />
          )}
        </div>
      </div>
    </section>
  );
}


