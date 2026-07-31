import Link from "next/link";
import { SEO_BLOCK } from "@/data/catalog";

// SEO-блок под каталогом (.template/catalog/index.html)
export function SeoBlock() {
  return (
    <div className="seo-content container">
      <div className="seo-content-title">{SEO_BLOCK.title}</div>
      <div className="seo-content-subtitle">{SEO_BLOCK.subtitle}</div>
      <div className="seo-content-list">
        <div className="seo-content-sizes">
          {SEO_BLOCK.sizes.map((s) => (
            <Link href={`/catalog/tires/185/60/${s.toLowerCase()}`} className="seo-size-link" key={s}>
              {s}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
