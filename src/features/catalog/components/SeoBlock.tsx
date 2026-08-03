// SEO-блок под каталогом: статичный текст из шаблона (фаза 2)
import { SEO_CONTENT } from "@/shared/api/data";

interface SeoBlockProps {
  brand?: string;
  season?: string;
}

export function SeoBlock({ brand, season }: SeoBlockProps) {
  const brandName = brand
    ? SEO_CONTENT.subtitle.replace("Viatti", brand.charAt(0).toUpperCase() + brand.slice(1))
    : SEO_CONTENT.subtitle;

  return (
    <div className="seo-content">
      <h2 className="seo-content-title">{SEO_CONTENT.title}</h2>
      <h3 className="seo-content-subtitle">{brandName}</h3>
      {SEO_CONTENT.features.map((f, i) => (
        <p key={i} className={i === 0 ? "seo-content-feature" : ""}>{f}</p>
      ))}
      <p className="seo-content-advantages">{SEO_CONTENT.advantages}</p>
      <div className="seo-content-sizes">
        Шиноразмеры:{" "}
        {SEO_CONTENT.sizes.map((s) => (
          <a key={s} href={`/catalog/tires/${s.toLowerCase()}`} className="seo-size-link">
            {s}
          </a>
        ))}
      </div>
    </div>
  );
}
