// Подбор дисков по автомобилю на живом API (20.10.2026).
// Сегменты: /catalog/wheels/auto/{makeSlug}/{modelSlug}/{year}/{modificationSlug}.
// Справочники — /api/reference/vehicle/…?category=wheel; результат —
// /api/catalog/wheels/by-vehicle/{make}/{model}/{year}/{modification}
// (допуски width/ET, hub ≥ ступицы, PCD/диаметр точно).
// Числовой id в сегментах — legacy: резолвится и редиректится на слаг.
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  getGeo,
  getVehicleMakes,
  getVehicleModels,
  getVehicleModifications,
  getVehicleWheelSelection,
  getVehicleYears,
  getWheelsFilters,
} from "@/shared/api/data";
import { CatalogFilter, type AutoFilterData } from "@/features/catalog/components/CatalogFilter";
import { AutoModelsList } from "@/features/catalog/components/AutoModelsList";
import { AutoResultView } from "@/features/catalog/components/AutoResultView";
import { SeoBlock } from "@/features/catalog/components/SeoBlock";
import { ArticleBlock } from "@/shared/ui/ArticleBlock";
import { toAutoOptions } from "@/features/catalog/lib/autoOptions";
import { parseWheelsParams, buildQueryString } from "@/shared/lib/parseParams";
import { resolveCityLabel } from "@/shared/lib/cityUrl";
import {
  matchesVehicleRef,
  parseVehicleAutoSegments,
  vehicleAutoPath,
} from "@/shared/lib/autoUrl";
import type { FilterState } from "@/features/catalog/types";
import type { VehicleSelectionRef } from "@/features/catalog/types/vehicle";

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
  const filters = await getWheelsFilters();
  return (
    <div className="main-content-catalog">
      <CatalogFilter
        options={filters}
        current={current}
        initialTab="car"
        autoData={autoData}
        category="wheels"
      />
      <div className="catalog-with-products">{children}</div>
    </div>
  );
}

/** Мета: SEO результата — только на уровне модификации (остальные — общий заголовок). */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [resolved, resolvedSearch] = await Promise.all([params, searchParams]);
  const selection = parseVehicleAutoSegments(resolved.auto ?? []);

  const make = selection?.make;
  const model = selection?.model;
  const year = selection?.year;
  const modification = selection?.modification;

  if (!make || !model || !year || !modification) {
    return { title: "Подбор дисков по автомобилю" };
  }

  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const current = parseWheelsParams({ params: [] }, resolvedSearch);
  const result = await getVehicleWheelSelection(
    { make, model, year, modification },
    current,
    cityValue,
  );

  if (!result) return { title: "Подбор дисков по автомобилю" };

  return {
    title: result.seo.title,
    description: result.seo.description ?? undefined,
  };
}

export default async function WheelsAutoPage({ params, searchParams }: PageProps) {
  const [resolved, resolvedSearch, geo] = await Promise.all([params, searchParams, getGeo()]);
  const selection = parseVehicleAutoSegments(resolved.auto ?? []);
  if (!selection) notFound();

  const current = parseWheelsParams({ params: [] }, resolvedSearch);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const cityLabel = resolveCityLabel(cityValue, geo.cities, geo.defaultCity);
  const qs = buildQueryString(current, false, cityValue);

  const { make, model, year, modification } = selection;

  // Уровень 0: список марок
  if (make === undefined) {
    const makes = await getVehicleMakes("wheel");
    if (!makes) notFound();

    return (
      <section className="catalog-section container">
        <CatalogLayout current={current}>
          <AutoModelsList
            title="Список моделей автомобилей"
            items={makes.map((item) => ({
              key: item.slug,
              label: item.name,
              href: `${vehicleAutoPath({ make: item.slug }, "wheels")}${qs}`,
            }))}
          />
        </CatalogLayout>
      </section>
    );
  }

  // Уровень 1: модели марки
  if (model === undefined) {
    const [makes, models] = await Promise.all([
      getVehicleMakes("wheel"),
      getVehicleModels(make, "wheel"),
    ]);
    if (!makes || !models) notFound();

    const makeRef = makes.find((item) => matchesVehicleRef(item, make));
    if (!makeRef) notFound();
    if (make !== makeRef.slug) {
      redirect(`${vehicleAutoPath({ make: makeRef.slug }, "wheels")}${qs}`);
    }

    return (
      <section className="catalog-section container">
        <CatalogLayout
          current={current}
          autoData={{
            brand: makeRef.slug,
            brandName: makeRef.name,
            models: toAutoOptions(models, (item) => item.slug, (item) => item.label),
          }}
        >
          <AutoModelsList
            title={`Список моделей ${makeRef.name}`}
            items={models.map((item) => ({
              key: item.slug,
              label: item.label,
              href: `${vehicleAutoPath(
                { make: makeRef.slug, model: item.slug },
                "wheels",
              )}${qs}`,
            }))}
          />
        </CatalogLayout>
      </section>
    );
  }

  // Уровень 2: годы модели
  if (year === undefined) {
    const [makes, models, years] = await Promise.all([
      getVehicleMakes("wheel"),
      getVehicleModels(make, "wheel"),
      getVehicleYears(make, model, "wheel"),
    ]);
    if (!makes || !models || !years) notFound();

    const makeRef = makes.find((item) => matchesVehicleRef(item, make));
    const modelRef = models.find((item) => matchesVehicleRef(item, model));
    if (!makeRef || !modelRef) notFound();
    if (make !== makeRef.slug || model !== modelRef.slug) {
      redirect(
        `${vehicleAutoPath(
          { make: makeRef.slug, model: modelRef.slug },
          "wheels",
        )}${qs}`,
      );
    }

    return (
      <section className="catalog-section container">
        <CatalogLayout
          current={current}
          autoData={{
            brand: makeRef.slug,
            brandName: makeRef.name,
            model: modelRef.slug,
            modelName: modelRef.label,
            models: toAutoOptions(models, (item) => item.slug, (item) => item.label),
            years,
          }}
        >
          <AutoModelsList
            title="Выберите год выпуска"
            items={years.map((modelYear) => ({
              key: modelYear,
              label: String(modelYear),
              href: `${vehicleAutoPath(
                {
                  make: makeRef.slug,
                  model: modelRef.slug,
                  year: modelYear,
                },
                "wheels",
              )}${qs}`,
            }))}
          />
        </CatalogLayout>
      </section>
    );
  }

  // Уровень 3: модификации выбранного года
  if (modification === undefined) {
    const [makes, models, years, modifications] = await Promise.all([
      getVehicleMakes("wheel"),
      getVehicleModels(make, "wheel"),
      getVehicleYears(make, model, "wheel"),
      getVehicleModifications({ make, model, year }, "wheel"),
    ]);
    if (!makes || !models || !years || !modifications) notFound();

    const makeRef = makes.find((item) => matchesVehicleRef(item, make));
    const modelRef = models.find((item) => matchesVehicleRef(item, model));
    if (!makeRef || !modelRef) notFound();
    if (make !== makeRef.slug || model !== modelRef.slug) {
      redirect(
        `${vehicleAutoPath(
          { make: makeRef.slug, model: modelRef.slug, year },
          "wheels",
        )}${qs}`,
      );
    }

    return (
      <section className="catalog-section container">
        <CatalogLayout
          current={current}
          autoData={{
            brand: makeRef.slug,
            brandName: makeRef.name,
            model: modelRef.slug,
            modelName: modelRef.label,
            year: String(year),
            models: toAutoOptions(models, (item) => item.slug, (item) => item.label),
            years,
            modifications: toAutoOptions(
              modifications,
              (item) => item.slug,
              (item) => item.label,
            ),
          }}
        >
          <AutoModelsList
            title="Выберите модификацию"
            items={modifications.map((item) => ({
              key: item.slug,
              label: item.label,
              href: `${vehicleAutoPath(
                {
                  make: makeRef.slug,
                  model: modelRef.slug,
                  year,
                  modification: item.slug,
                },
                "wheels",
              )}${qs}`,
            }))}
          />
        </CatalogLayout>
      </section>
    );
  }

  // Уровень 4: результат — спецификации автомобиля и диски с ценой города
  const selectionRef: VehicleSelectionRef = { make, model, year, modification };
  const [result, models, years, modifications] = await Promise.all([
    getVehicleWheelSelection(selectionRef, current, cityValue),
    getVehicleModels(make, "wheel"),
    getVehicleYears(make, model, "wheel"),
    getVehicleModifications({ make, model, year }, "wheel"),
  ]);
  if (!result || !models || !years || !modifications) notFound();

  const canonical: VehicleSelectionRef = {
    make: result.vehicle.make.slug,
    model: result.vehicle.model.slug,
    year: result.vehicle.year ?? year,
    modification: result.vehicle.modification.slug,
  };
  if (
    make !== canonical.make ||
    model !== canonical.model ||
    year !== canonical.year ||
    modification !== canonical.modification
  ) {
    redirect(`${vehicleAutoPath(canonical, "wheels")}${qs}`);
  }

  const autoData: AutoFilterData = {
    brand: canonical.make,
    brandName: result.vehicle.make.name,
    model: canonical.model,
    modelName: result.vehicle.model.label,
    year: String(canonical.year),
    mod: canonical.modification,
    modName: result.vehicle.modification.name,
    models: toAutoOptions(models, (item) => item.slug, (item) => item.label),
    years,
    modifications: toAutoOptions(
      modifications,
      (item) => item.slug,
      (item) => item.label,
    ),
  };

  if (result.sections.length === 0) {
    return (
      <section className="catalog-section container">
        <CatalogLayout current={current} autoData={autoData}>
          <p>Для выбранного автомобиля дисков не найдено.</p>
        </CatalogLayout>
        {result.article && <ArticleBlock article={result.article} className="article-block" />}
      </section>
    );
  }

  // Блок выбранного авто: секции из ответа бэка, чекбокс по умолчанию — первая спецификация OEM
  const firstSection = result.sections[0];
  const carBlock = {
    name: result.vehicle.title,
    sections: result.sections.map((section) => ({
      name: section.carBlockLabel,
      options: section.options.map((option, index) => {
        const size = option.sizes[option.sizes.length - 1];
        return {
          label: option.label,
          width: Number(size.width),
          diameter: size.diameter,
          pcd: size.pcd,
          et: Number(size.et),
          key: option.key,
          checked: section === firstSection && index === 0,
        };
      }),
    })),
  };

  // Результат: заголовок секции + спецификации с карточками (пары front/rear)
  const resultSections = result.sections.map((section) => ({
    categorySection: section.resultLabel,
    items: section.options.map((option) => ({
      sizeLabel: option.label,
      sizeKeys: [option.key],
      sizes: option.offers.map((offer) => ({
        front: offer.front,
        rear: offer.rear ?? undefined,
      })),
    })),
  }));

  return (
    <section className="catalog-section container">
      <h2>{result.seo.title}</h2>

      <CatalogLayout current={current} autoData={autoData}>
        <AutoResultView
          carBlock={carBlock}
          sections={resultSections}
          cityLabel={cityLabel}
          cityValue={cityValue}
        />
      </CatalogLayout>

      {result.seo.description && (
        <SeoBlock
          content={{ title: result.seo.title, subtitle: result.seo.description }}
        />
      )}

      {result.article && <ArticleBlock article={result.article} className="article-block" />}
    </section>
  );
}
