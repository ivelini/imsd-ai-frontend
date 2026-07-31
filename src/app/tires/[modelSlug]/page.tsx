import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ProductCard } from "@/components/catalog/ProductCard";
import { TIRE_MODELS } from "@/data/catalog";

// Страница модели шины (.template/catalog/model.html): описание + типоразмеры по диаметрам
export default async function ModelPage({ params }: { params: Promise<{ modelSlug: string }> }) {
  const { modelSlug } = await params;
  const model = TIRE_MODELS.find((m) => m.slug === modelSlug);
  if (!model) notFound();

  const diameters = [...new Set(model.sizes.map((s) => s.diameter))].sort((a, b) => a - b);
  const sizesByDiameter = diameters.map((d) => ({
    diameter: d,
    sizes: model.sizes.filter((s) => s.diameter === d),
  }));

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Каталог шин", href: "/catalog/tires" },
          { label: model.name },
        ]}
      />
      <section className="catalog-section container model-page">
        <h2>Шины {model.name}</h2>
        <div className="model-description">
          <div className="model-info">
            <div className="model-description-image">
              <img src="/assets/img/large.png" alt={model.name} />
            </div>
            <div className="model-description-params">
              {model.params.map((p) => (
                <div className="model-param" key={p.name}>
                  <span className="model-param-name">{p.name}</span>
                  <span className="parameter-dots"></span>
                  <span className="model-param-value">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="model-description-text">{model.description}</div>
        </div>
        <div className="main-content-catalog">
          <div className="model-sizes">
            <div className="model-sizes-title">Типоразмеры в наличии</div>
            <ul className="model-sizes-nav">
              {diameters.map((d) => (
                <li key={d}>
                  <Link href={`#diameter-r${d}`}>R{d}</Link>
                </li>
              ))}
            </ul>
            {sizesByDiameter.map((group) => (
              <div id={`diameter-r${group.diameter}`} className="model-diameter" key={group.diameter}>
                <div className="model-diameter-title">R{group.diameter}</div>
                {group.sizes.map((p) => (
                  <ProductCard product={p} key={p.id} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
