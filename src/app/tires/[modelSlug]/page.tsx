// Страница модели шины: описание + типоразмеры (фаза 2)
import { notFound } from "next/navigation";
import { getTireModel } from "@/shared/api/data";
import { ModelDescription } from "@/features/catalog/components/ModelDescription";
import { ModelSizes } from "@/features/catalog/components/ModelSizes";

interface PageProps {
  params: Promise<{ modelSlug: string }>;
}

export default async function ModelPage({ params }: PageProps) {
  const { modelSlug } = await params;
  const model = getTireModel(modelSlug);

  if (!model) notFound();

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
      <ModelSizes sizesByDiameter={model.sizesByDiameter} />
    </section>
  );
}
