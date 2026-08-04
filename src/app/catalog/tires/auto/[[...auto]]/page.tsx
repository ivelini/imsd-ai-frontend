// Подбор шин по автомобилю: серверный каскад brand→model→year→mod→result (фаза 2)
// На всех уровнях — сайдбар фильтра (.main-content-catalog), как в шаблоне auto.html
import Link from "next/link";
import {
  getAutoBrands,
  getAutoModels,
  getAutoYears,
  getAutoModifications,
  fetchAutoResult,
  getCarBlock,
  getCatalogFilters,
} from "@/shared/api/data";
import { CarBlock } from "@/features/catalog/components/CarBlock";
import { CatalogFilter, type AutoFilterData } from "@/features/catalog/components/CatalogFilter";
import { CategorySection } from "@/features/catalog/components/CategorySection";
import { SeoBlock } from "@/features/catalog/components/SeoBlock";
import { parseCatalogParams, buildQueryString } from "@/shared/lib/parseParams";
import type { FilterState } from "@/features/catalog/types";

interface PageProps {
  params: Promise<{ auto?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Обёртка: сайдбар фильтра + контент справа (структура шаблона) */
async function CatalogLayout({
  children,
  autoData,
  current,
}: {
  children: React.ReactNode;
  autoData?: AutoFilterData;
  current: FilterState;
}) {
  const filters = await getCatalogFilters();
  return (
    <div className="main-content-catalog">
      <CatalogFilter options={filters} current={current} initialTab="car" autoData={autoData} />
      <div className="catalog-with-products">{children}</div>
    </div>
  );
}

export default async function AutoPage({ params, searchParams }: PageProps) {
  const [resolved, resolvedSearch] = await Promise.all([params, searchParams]);
  const segments = resolved.auto ?? [];
  // Query-фильтры вкладки «По автомобилю» (цена/доставка/страна) — в URL каскада;
  // параметры шин в каскад не попадают (хранятся в сторе filterParams)
  const current = parseCatalogParams({ params: [] }, resolvedSearch);
  const qs = buildQueryString(current);
  // segments: [brand?, model?, year?, mod?]

  // Уровень 0: список марок
  if (segments.length === 0) {
    const brands = await getAutoBrands();
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current}>
          <div className="auto-models">
            <h2 className="auto-models-title">Список моделей автомобилей</h2>
            <div className="auto-models-list">
              {brands.map((b) => (
                <Link key={b.id} href={`/catalog/tires/auto/${b.id}${qs}`}>
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
        <SeoBlock />
      </section>
    );
  }

  const [brand, model, yearStr, mod] = segments;

  // Уровень 1: список моделей бренда
  if (!model) {
    const [models, brands] = await Promise.all([getAutoModels(brand), getAutoBrands()]);
    const brandData = brands.find((b) => b.id === brand);
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current}
          autoData={{ brand, brandName: brandData?.name, models }}
        >
          <div className="auto-models">
            <h2 className="auto-models-title">
              Список моделей {brandData?.name ?? brand}
            </h2>
            <div className="auto-models-list">
              {models.map((m) => (
                <Link key={m.slug} href={`/catalog/tires/auto/${brand}/${m.slug}${qs}`}>
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
        <SeoBlock />
      </section>
    );
  }

  // Уровень 2: список годов
  if (!yearStr) {
    const [years, brands, models] = await Promise.all([
      getAutoYears(brand, model),
      getAutoBrands(),
      getAutoModels(brand),
    ]);
    const brandData = brands.find((b) => b.id === brand);
    const modelData = brandData?.models.find((m) => m.slug === model);
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current}
          autoData={{ brand, brandName: brandData?.name, model, modelName: modelData?.name, models, years }}
        >
          <div className="auto-models">
            <h2 className="auto-models-title">Выберите год выпуска</h2>
            <div className="auto-models-list">
              {years.map((y) => (
                <Link key={y} href={`/catalog/tires/auto/${brand}/${model}/${y}${qs}`}>
                  {y}
                </Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
        <SeoBlock />
      </section>
    );
  }

  const year = parseInt(yearStr, 10);

  // Уровень 3: список модификаций
  if (!mod) {
    const [modifications, brands, models, years] = await Promise.all([
      getAutoModifications(brand, model, year),
      getAutoBrands(),
      getAutoModels(brand),
      getAutoYears(brand, model),
    ]);
    const brandData = brands.find((b) => b.id === brand);
    const modelData = brandData?.models.find((m) => m.slug === model);
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current}
          autoData={{
            brand,
            brandName: brandData?.name,
            model,
            modelName: modelData?.name,
            year: yearStr,
            models,
            years,
            modifications,
          }}
        >
          <div className="auto-models">
            <h2 className="auto-models-title">Выберите модификацию</h2>
            <div className="auto-models-list">
              {modifications.map((m) => (
                <Link key={m.id} href={`/catalog/tires/auto/${brand}/${model}/${year}/${m.id}${qs}`}>
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
        </CatalogLayout>
        <SeoBlock />
      </section>
    );
  }

  // Уровень 4: результат с CarBlock + парами шин
  const [result, carBlock, filters, brands, models, years, modifications] = await Promise.all([
    fetchAutoResult(brand, model, year, mod),
    getCarBlock(brand, model, year, mod),
    getCatalogFilters(),
    getAutoBrands(),
    getAutoModels(brand),
    getAutoYears(brand, model),
    getAutoModifications(brand, model, year),
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
      <h2>
        Шины на {brand.toUpperCase()} {model} {mod}, {year} г. в Челябинске
      </h2>

      <div className="main-content-catalog">
        <CatalogFilter
          options={filters}
          current={current}
          initialTab="car"
          autoData={{
            brand,
            brandName: brandData?.name,
            model,
            modelName: modelData?.name,
            year: yearStr,
            mod,
            modName: modData?.name,
            models,
            years,
            modifications,
          }}
        />
        <div className="catalog-with-products">
          {carBlock && <CarBlock data={carBlock} />}

          {result.map((section, si) => (
            <CategorySection
              key={si}
              header={section.categorySection || undefined}
              sizeLabel={section.sizeLabel}
              products={section.products}
            />
          ))}
        </div>
      </div>

      <SeoBlock />
    </section>
  );
}
