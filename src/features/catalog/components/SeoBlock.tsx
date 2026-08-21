// SEO-блок под каталогом: title + subtitle (готовые строки от бэка, 21.08.2026)
import type { SeoContent } from "@/features/catalog/types";

interface SeoBlockProps {
  content: SeoContent;
}

export function SeoBlock({ content }: SeoBlockProps) {
  return (
    <div className="seo-content">
      <h2 className="seo-content-title">{content.title}</h2>
      <h3 className="seo-content-subtitle">{content.subtitle}</h3>
    </div>
  );
}
