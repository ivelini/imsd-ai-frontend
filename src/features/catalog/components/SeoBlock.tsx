// SEO-блок под каталогом: статичный текст из шаблона (фаза 2)
// Контент приходит через props от серверной страницы (getSeoContent)
import type { SeoContent } from "@/features/catalog/types";

interface SeoBlockProps {
  content: SeoContent;
  brand?: string;
  season?: string;
}

export function SeoBlock({ content, brand, season }: SeoBlockProps) {
  const brandName = brand
    ? content.subtitle.replace("Viatti", brand.charAt(0).toUpperCase() + brand.slice(1))
    : content.subtitle;

  return (
    <div className="seo-content">
      <h2 className="seo-content-title">{content.title}</h2>
      <h3 className="seo-content-subtitle">{brandName}</h3>
      {content.features.map((f, i) => (
        <p key={i} className={i === 0 ? "seo-content-feature" : ""}>{f}</p>
      ))}
      <p className="seo-content-advantages">{content.advantages}</p>
      <div className="seo-content-sizes">
        Шиноразмеры:{" "}
        {content.sizes.map((s) => (
          <a key={s} href={`/catalog/tires/${s.toLowerCase()}`} className="seo-size-link">
            {s}
          </a>
        ))}
      </div>
    </div>
  );
}
