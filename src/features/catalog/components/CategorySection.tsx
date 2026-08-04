// Секция категории шин: .category-section с парами (фаза 2)
// Разметка 1-в-1 с .template/catalog/auto-selected.html
import type { TireProduct } from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";

interface CategorySectionProps {
  header?: string;
  sizeLabel: string;
  products: TireProduct[];
}

export function CategorySection({ header, sizeLabel, products }: CategorySectionProps) {
  return (
    <div className="category-section">
      {header && <div className="category-section-header">{header}</div>}
      <div className="category-section-size">{sizeLabel}</div>
      <div className="pair-group">
        {products.map((p, i) => (
          <ProductCard product={p} key={p.id} showLink={false} pair={i > 0} />
        ))}
      </div>
    </div>
  );
}
