// Типоразмеры модели по диаметрам .model-sizes (фаза 2; 12.08.2026 — диаметр в URL + «Показать ещё»)
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TireProduct } from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";

const PAGE_SIZE = 24;

interface ModelSizesProps {
  sizesByDiameter: Record<string, TireProduct[]>;
  initialDiameter?: string;
  cityLabel?: string;
  cityValue?: string;
}

export function ModelSizes({ sizesByDiameter, initialDiameter, cityLabel, cityValue }: ModelSizesProps) {
  const router = useRouter();
  const diameters = useMemo(
    () =>
      Object.keys(sizesByDiameter).sort(
        (a, b) => parseInt(a.replace("r", "")) - parseInt(b.replace("r", "")),
      ),
    [sizesByDiameter],
  );

  const validInitial = initialDiameter && diameters.includes(initialDiameter) ? initialDiameter : undefined;
  const [diameter, setDiameter] = useState(validInitial ?? diameters[0]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sizes = sizesByDiameter[diameter] ?? [];
  const shown = sizes.slice(0, visibleCount);

  function selectDiameter(d: string) {
    if (d === diameter) return;
    setDiameter(d);
    setVisibleCount(PAGE_SIZE);
    router.replace(`?diameter=${d}`, { scroll: false });
  }

  return (
    <div className="model-sizes">
      <h2 className="model-sizes-title">Типоразмеры в наличии</h2>

      {/* Вкладки диаметров — выбор пишется в URL (?diameter=r17) */}
      <ul className="model-sizes-nav">
        {diameters.map((d) => (
          <li key={d}>
            <button
              className={d === diameter ? "model-sizes-nav-link model-sizes-nav-link_active" : "model-sizes-nav-link"}
              onClick={() => selectDiameter(d)}
            >
              {d.toUpperCase()}
            </button>
          </li>
        ))}
      </ul>

      {/* Активная секция по диаметру */}
      <div className="model-diameter">
        <h3 className="model-diameter-title">{diameter.toUpperCase()}</h3>
        {shown.map((p) => (
          <ProductCard product={p} showLink={false} key={p.id} cityLabel={cityLabel} cityValue={cityValue} />
        ))}
        {sizes.length > visibleCount && (
          <button className="model-sizes-more" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
            Показать ещё ({sizes.length - visibleCount})
          </button>
        )}
      </div>
    </div>
  );
}
