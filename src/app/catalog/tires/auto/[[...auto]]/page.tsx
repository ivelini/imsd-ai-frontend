import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { AutoSelectForm } from "@/components/catalog/AutoSelectForm";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Pagination } from "@/components/catalog/Pagination";
import { SeoBlock } from "@/components/catalog/SeoBlock";
import { AUTO_BRANDS, AUTO_RESULT } from "@/data/catalog";

// Подбор по автомобилю: /catalog/tires/auto | /catalog/tires/auto/[brand] | /catalog/tires/auto/[brand]/[model]/[year]/[mod]
export default async function AutoPage({ params }: { params: Promise<{ auto?: string[] }> }) {
  const { auto } = await params;
  const segs = auto ?? [];
  const [brand, model, year, mod] = segs;

  const brandEntry = AUTO_BRANDS.find((b) => b.slug === brand);
  const modelEntry = brandEntry?.models.find((m) => m.slug === model);
  const modEntry = modelEntry?.years.find((y) => String(y.year) === year)?.modifications.find((m) => m.slug === mod);

  const crumbs: Crumb[] = [
    { label: "Главная", href: "/" },
    { label: "Каталог шин", href: "/catalog/tires" },
    { label: "Подбор по автомобилю", href: "/catalog/tires/auto" },
  ];
  if (brandEntry) crumbs.push({ label: brandEntry.name });
  if (modelEntry) crumbs.push({ label: modelEntry.name });
  if (year) crumbs.push({ label: String(year) });
  if (modEntry) crumbs.push({ label: modEntry.name });

  // Шаг: выбор авто (без сегментов)
  if (!brand) {
    return (
      <>
        <Breadcrumbs items={crumbs} />
        <section className="catalog-section container">
          <h2>Подбор шин по автомобилю</h2>
          <div className="main-content-catalog">
            <AutoSelectForm />
          </div>
        </section>
      </>
    );
  }

  // Шаг: выбрана марка — список моделей
  if (brand && !modEntry) {
    return (
      <>
        <Breadcrumbs items={crumbs} />
        <section className="catalog-section container">
          <h2>Подбор шин по автомобилю</h2>
          <div className="main-content-catalog">
            <AutoSelectForm />
          </div>
        </section>
      </>
    );
  }

  // Результат: авто выбрано (.template/catalog/auto-selected.html)
  const carName = `${brandEntry?.name} ${modelEntry?.name} ${modEntry?.name}, ${year} г.`;
  const sectionSizes = [
    { name: "Рекомендовано", sizes: modEntry!.sizes.filter((s) => s.startsWith("265") || s.startsWith("275/45")) },
    { name: "Лучшая альтернатива", sizes: modEntry!.sizes.filter((s) => !s.startsWith("265")) },
  ];

  return (
    <>
      <Breadcrumbs items={crumbs} />
      <section className="catalog-section container">
        <h2>Шины на {carName} в Челябинске</h2>
        <div className="main-content-catalog">
          <div className="car-block">
            <div className="car-name">{carName}</div>
            <div className="car-sections">
              {sectionSizes.map((sec) => (
                <div className="car-section" key={sec.name}>
                  <div className="car-section-name">{sec.name}</div>
                  <div className="car-section-options">
                    {sec.sizes.map((size, i) => {
                      const [w, h, d] = size.replace("-", "/").split("/");
                      const [h2, d2] = h.split(" ");
                      return (
                        <div className="custom-checkbox" key={size}>
                          <div className="custom-checkbox-container">
                            <input
                              type="checkbox"
                              id={`${sec.name === "Рекомендовано" ? "original" : "replace"}-size-${i}`}
                              data-width={w}
                              data-height={h2}
                              data-diameter={d2}
                              defaultChecked={i === 0}
                            />
                            <label htmlFor={`${sec.name === "Рекомендовано" ? "original" : "replace"}-size-${i}`}>
                              {size}
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {AUTO_RESULT.map((cat) => (
            <div className="category-section" key={cat.title}>
              <div className="category-section-header">{cat.title}</div>
              <div className="category-section-size">{cat.size}</div>
              {cat.pairs.map((pair) => (
                <div className="pair-group" key={pair.size}>
                  <ProductCard product={pair.products[0]} />
                  <ProductCard product={pair.products[1]} pair />
                </div>
              ))}
            </div>
          ))}
          <Pagination page={1} total={1} basePath="/catalog/tires" />
        </div>
      </section>
      <SeoBlock />
    </>
  );
}
