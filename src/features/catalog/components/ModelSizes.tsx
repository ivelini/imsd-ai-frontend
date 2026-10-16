// Типоразмеры модели по диаметрам .model-sizes (фаза 2; 12.08.2026 — диаметр в URL;
// 16.10.2026 — живые данные: диаметры и размеры приходят с сервера, вкладка перезапрашивает страницу)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TireProduct } from "@/features/catalog/types";
import { ProductCard } from "./ProductCard";

const PAGE_SIZE = 24;

interface ModelSizesProps {
  /** Вкладки диаметров: value — r-ключ (r17), count — сколько размеров у бэка. */
  diameters: { value: string; count: number }[];
  /** Размеры активного диаметра (живой листинг). */
  sizes: TireProduct[];
  /** Активный диаметр из URL; на смене родитель монтирует компонент заново (key). */
  diameter: string;
  cityLabel?: string;
  cityValue?: string;
}

export function ModelSizes({ diameters, sizes, diameter, cityLabel, cityValue }: ModelSizesProps) {
  const router = useRouter();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shown = sizes.slice(0, visibleCount);

  function selectDiameter(d: string) {
    if (!d || d === diameter) return;
    router.replace(`?diameter=${d}`, { scroll: false });
  }

  return (
    <div className="model-sizes">
      <h2 className="model-sizes-title">Типоразмеры в наличии</h2>

      {/* Вкладки диаметров — выбор пишется в URL (?diameter=r17), страница перезапрашивает размеры */}
      <ul className="model-sizes-nav">
        {diameters.map((d) => (
          <li key={d.value}>
            <button
              className={
                d.value === diameter
                  ? "model-sizes-nav-link model-sizes-nav-link_active"
                  : "model-sizes-nav-link"
              }
              onClick={() => selectDiameter(d.value)}
            >
              {d.value.toUpperCase()}
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
