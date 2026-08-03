// Подбор шин по автомобилю: серверный каскад brand→model→year→mod→result (фаза 2)
import Link from "next/link";
import {
  getAutoBrands,
  getAutoModels,
  getAutoYears,
  getAutoModifications,
  fetchAutoResult,
} from "@/shared/api/data";
import { ProductCard } from "@/features/catalog/components/ProductCard";
import { SeoBlock } from "@/features/catalog/components/SeoBlock";

interface PageProps {
  params: Promise<{ auto?: string[] }>;
}

export default async function AutoPage({ params }: PageProps) {
  const resolved = await params;
  const segments = resolved.auto ?? [];
  // segments: [brand?, model?, year?, mod?]

  // Уровень 0: список марок
  if (segments.length === 0) {
    const brands = await getAutoBrands();
    return (
      <section className="catalog-section container">
        <div className="auto-models">
          <h2 className="auto-models-title">Список моделей автомобилей</h2>
          <div className="auto-models-list">
            {brands.map((b) => (
              <Link key={b.id} href={`/catalog/tires/auto/${b.id}`}>
                {b.name}
              </Link>
            ))}
          </div>
        </div>
        <SeoBlock />
      </section>
    );
  }

  const [brand, model, yearStr, mod] = segments;

  // Уровень 1: список моделей бренда
  if (!model) {
    const models = await getAutoModels(brand);
    const brandData = (await getAutoBrands()).find((b) => b.id === brand);
    return (
      <section className="catalog-section container">
        <div className="auto-models">
          <h2 className="auto-models-title">
            Список моделей {brandData?.name ?? brand}
          </h2>
          <div className="auto-models-list">
            {models.map((m) => (
              <Link key={m.slug} href={`/catalog/tires/auto/${brand}/${m.slug}`}>
                {m.name}
              </Link>
            ))}
          </div>
        </div>
        <SeoBlock />
      </section>
    );
  }

  // Уровень 2: список годов
  if (!yearStr) {
    const years = await getAutoYears(brand, model);
    return (
      <section className="catalog-section container">
        <div className="auto-models">
          <h2 className="auto-models-title">Выберите год выпуска</h2>
          <div className="auto-models-list">
            {years.map((y) => (
              <Link key={y} href={`/catalog/tires/auto/${brand}/${model}/${y}`}>
                {y}
              </Link>
            ))}
          </div>
        </div>
        <SeoBlock />
      </section>
    );
  }

  const year = parseInt(yearStr, 10);

  // Уровень 3: список модификаций
  if (!mod) {
    const modifications = await getAutoModifications(brand, model, year);
    return (
      <section className="catalog-section container">
        <div className="auto-models">
          <h2 className="auto-models-title">Выберите модификацию</h2>
          <div className="auto-models-list">
            {modifications.map((m) => (
              <Link key={m.id} href={`/catalog/tires/auto/${brand}/${model}/${year}/${m.id}`}>
                {m.name}
              </Link>
            ))}
          </div>
        </div>
        <SeoBlock />
      </section>
    );
  }

  // Уровень 4: результат с CarBlock + парами шин
  const result = await fetchAutoResult(brand, model, year, mod);
  if (!result) {
    return (
      <section className="catalog-section container">
        <p>Для выбранного автомобиля товаров не найдено.</p>
      </section>
    );
  }

  return (
    <section className="catalog-section container">
      <h2>
        Шины на {brand.toUpperCase()} {model} {mod}, {year} г. в Челябинске
      </h2>

      {result.map((section, si) => (
        <div className="category-section" key={si}>
          <div className="category-section-header">{section.categorySection}</div>
          <div className="category-section-size">{section.sizeLabel}</div>
          {section.products.map((p) => (
            <ProductCard
              product={p}
              showLink
              key={p.id}
            />
          ))}
        </div>
      ))}

      <SeoBlock />
    </section>
  );
}
