// Подбор дисков по автомобилю: серверный каскад (фаза 2)
import Link from "next/link";
import {
  getWheelsFilters,
  getWheelsProducts,
  getWheelsAutoBrands,
  getWheelsAutoModels,
  getWheelsAutoYears,
  getWheelsAutoModifications,
  fetchWheelsAutoResult,
  getWheelsCarBlock,
} from "@/shared/api/data";
import type { WheelCarBlockData, WheelAutoResultItem } from "@/shared/api/data";
import { CatalogFilter, type AutoFilterData } from "@/features/catalog/components/CatalogFilter";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { Pagination } from "@/features/catalog/components/Pagination";
import { parseWheelsParams, buildWheelsUrl, buildQueryString } from "@/shared/lib/parseParams";
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
    fetchWheelsAutoResult(brand, model, year, mod),
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
          {carBlock && <WheelsCarBlock data={carBlock} />}
          {result.map((section, si) => (
            <WheelsCategorySection key={si} header={section.categorySection || undefined} sizeLabel={section.sizeLabel} products={section.products} cityLabel={cityLabel} cityValue={cityValue} />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Колёсный CarBlock: .car-block с секциями размеров */
function WheelsCarBlock({ data }: { data: WheelCarBlockData }) {
  return (
    <div className="car-block">
      <div className="car-name">{data.name}</div>
      {data.sections.map((section, i) => (
        <div className="car-section" key={i}>
          <div className="car-section-name">{section.name}</div>
          <div className="car-section-options">
            {section.options.map((opt, j) => (
              <div className="custom-checkbox" key={j}>
                <input type="checkbox" defaultChecked={opt.checked} data-width={opt.width} data-diameter={opt.diameter} data-pcd={opt.pcd} data-et={opt.et} />
                <label>{opt.label}</label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Секция категории дисков с парами */
function WheelsCategorySection({ header, sizeLabel, products, cityLabel, cityValue }: {
  header?: string;
  sizeLabel: string;
  products: WheelAutoResultItem["products"];
  cityLabel: string;
  cityValue?: string;
}) {
  return (
    <div className="category-section">
      {header && <div className="category-section-header">{header}</div>}
      <div className="category-section-size">{sizeLabel}</div>
      <div className="pair-group">
        {products.map((p, i) => (
          <ProductCard product={p} key={p.id} showLink={false} pair={i > 0} cityLabel={cityLabel} cityValue={cityValue} />
        ))}
      </div>
    </div>
  );
}
