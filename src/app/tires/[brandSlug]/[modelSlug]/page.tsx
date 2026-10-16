// Страница модели шины: живой API (GET /api/catalog/tire-models/{brand}/{model}, 16.10.2026)
// Адресация — схемой бэка: слаг бренда + короткий слаг модели (/tires/yokohama/bluearth-ae61)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGeo, getTireModel, getTireModelSizes } from "@/shared/api/data";
import { resolveCityLabel } from "@/shared/lib/cityUrl";
import { ModelDescription } from "@/features/catalog/components/ModelDescription";
import { ModelSizes } from "@/features/catalog/components/ModelSizes";

interface PageProps {
  params: Promise<{ brandSlug: string; modelSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** SEO-мета модели: title/description от бэка (город — предложный падеж). */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ brandSlug, modelSlug }, resolvedSearch] = await Promise.all([params, searchParams]);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const result = await getTireModel(brandSlug, modelSlug, cityValue);

  if (!result) return { title: "Модель не найдена" };

  return {
    title: result.seo?.title ?? `Шины ${result.model.brandName} ${result.model.name}`,
    description: result.seo?.description ?? undefined,
  };
}

export default async function ModelPage({ params, searchParams }: PageProps) {
  const [{ brandSlug, modelSlug }, resolvedSearch, geo] = await Promise.all([params, searchParams, getGeo()]);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;

  const result = await getTireModel(brandSlug, modelSlug, cityValue);
  if (!result) notFound();
  const { model } = result;

  // Активный диаметр — из URL (?diameter=r17); неизвестный/отсутствующий — первый у модели
  const requested = typeof resolvedSearch.diameter === "string" ? resolvedSearch.diameter : undefined;
  const active =
    requested && model.diameters.some((d) => d.value === requested)
      ? requested
      : model.diameters[0]?.value ?? "";
  // Размеры — живым листингом с фильтрами модели (адаптер карточек — общий с каталогом)
  const sizes = active ? await getTireModelSizes(brandSlug, modelSlug, active, cityValue) : [];

  const cityLabel = resolveCityLabel(cityValue, geo.cities, geo.defaultCity);

  return (
    <section className="catalog-section container model-page">
      <h2>
        Шины {model.brandName} {model.name}
      </h2>
      <ModelDescription
        name={model.name}
        brandName={model.brandName}
        image={model.image}
        params={model.params}
        description={model.description}
      />
      <ModelSizes
        key={active}
        diameters={model.diameters}
        sizes={sizes}
        diameter={active}
        cityLabel={cityLabel}
        cityValue={cityValue}
      />
    </section>
  );
}
