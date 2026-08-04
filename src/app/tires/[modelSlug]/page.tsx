// Страница модели шины: описание + типоразмеры (фаза 2)
import { notFound } from "next/navigation";
import { getTireModel } from "@/shared/api/data";
import { resolveCityLabel } from "@/shared/lib/cityUrl";
import { ModelDescription } from "@/features/catalog/components/ModelDescription";
import { ModelSizes } from "@/features/catalog/components/ModelSizes";

interface PageProps {
  params: Promise<{ modelSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ModelPage({ params, searchParams }: PageProps) {
  const [{ modelSlug }, resolvedSearch] = await Promise.all([params, searchParams]);
  const model = getTireModel(modelSlug);

  if (!model) notFound();

  const cityValue = typeof resolvedSearch.city === "string" ? resolvedSearch.city : undefined;
  const cityLabel = resolveCityLabel(cityValue);

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
      <ModelSizes sizesByDiameter={model.sizesByDiameter} cityLabel={cityLabel} cityValue={cityValue} />
    </section>
  );
}
