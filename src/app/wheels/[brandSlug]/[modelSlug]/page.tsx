// Страница модели дисков: живой API (GET /api/catalog/wheel-models/{brand}/{model}, 10.11.2026)
// Адресация — схемой бэка: слаг бренда + короткий слаг модели (/wheels/hankook/kinergy)
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGeo, getModelCard, getModelSizes } from "@/shared/api/data";
import { resolveCityLabel } from "@/shared/lib/cityUrl";
import { activeDiameter } from "@/features/catalog/lib/modelDiameters";
import { ModelDescription } from "@/features/catalog/components/ModelDescription";
import { ModelSizes } from "@/features/catalog/components/ModelSizes";
import { Badges } from "@/shared/ui/Badge";

interface PageProps {
  params: Promise<{ brandSlug: string; modelSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** SEO-мета модели: title/description от бэка (город — предложный падеж). */
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ brandSlug, modelSlug }, resolvedSearch] = await Promise.all([params, searchParams]);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const result = await getModelCard({ category: "wheels", brandSlug, modelSlug, city: cityValue });

  if (!result) return { title: "Модель не найдена" };

  return {
    title: result.seo?.title ?? `Диски ${result.model.brandName} ${result.model.name}`,
    description: result.seo?.description ?? undefined,
  };
}

export default async function WheelModelPage({ params, searchParams }: PageProps) {
  const [{ brandSlug, modelSlug }, resolvedSearch, geo] = await Promise.all([params, searchParams, getGeo()]);
  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;

  const result = await getModelCard({ category: "wheels", brandSlug, modelSlug, city: cityValue });
  if (!result) notFound();
  const { model } = result;

  // Активный диаметр — из URL (?diameter=r16); неизвестный/отсутствующий — первый у модели
  const requested = typeof resolvedSearch.diameter === "string" ? resolvedSearch.diameter : undefined;
  const active = activeDiameter(model.diameters, requested);
  // Размеры — живым листингом с фильтрами модели (адаптер карточек — общий с каталогом)
  const sizes = active
    ? await getModelSizes({ category: "wheels", brandSlug, modelSlug, diameter: active, city: cityValue })
    : [];

  const cityLabel = resolveCityLabel(cityValue, geo.cities, geo.defaultCity);

  return (
    <section className="catalog-section container model-page">
      {/* Плашки баджей модели (стек «модель → бренд» от бэка) */}
      <Badges badges={model.badges} />
      <h2>
        Диски {model.brandName} {model.name}
      </h2>
      <ModelDescription
        name={model.name}
        brandName={model.brandName}
        image={model.image}
        params={model.params}
        description={model.description}
        article={result.article}
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
