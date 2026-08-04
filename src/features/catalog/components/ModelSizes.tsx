// Типоразмеры модели по диаметрам .model-sizes (фаза 2)
import type { TireProduct } from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";

interface ModelSizesProps {
  sizesByDiameter: Record<string, TireProduct[]>;
  cityLabel?: string;
  cityValue?: string;
}

export function ModelSizes({ sizesByDiameter, cityLabel, cityValue }: ModelSizesProps) {
  const diameters = Object.keys(sizesByDiameter).sort(
    (a, b) => parseInt(a.replace("r", "")) - parseInt(b.replace("r", "")),
  );

  return (
    <div className="model-sizes">
      <h2 className="model-sizes-title">Типоразмеры в наличии</h2>

      {/* Якоря */}
      <div className="model-sizes-nav">
        {diameters.map((d) => (
          <a key={d} href={`#diameter-${d}`}>
            {d.toUpperCase()}
          </a>
        ))}
      </div>

      {/* Секции по диаметрам */}
      {diameters.map((d) => (
        <div className="model-diameter" id={`diameter-${d}`} key={d}>
          <h3 className="model-diameter-title">{d.toUpperCase()}</h3>
          {sizesByDiameter[d].map((p) => (
            <ProductCard product={p} showLink={false} key={p.id} cityLabel={cityLabel} cityValue={cityValue} />
          ))}
        </div>
      ))}
    </div>
  );
}
