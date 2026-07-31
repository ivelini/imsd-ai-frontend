"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AUTO_BRANDS } from "@/data/catalog";

// Каскад подбора по автомобилю (.template/catalog/auto.html): марка → модель → год → модификация
export function AutoSelectForm() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");

  const models = useMemo(() => AUTO_BRANDS.find((b) => b.slug === brand)?.models ?? [], [brand]);
  const years = useMemo(() => models.find((m) => m.slug === model)?.years ?? [], [models, model]);
  const mods = useMemo(() => years.find((y) => String(y.year) === year)?.modifications ?? [], [years, year]);

  const onMod = (slug: string) => {
    if (slug && brand && model && year) {
      router.push(`/catalog/tires/auto/${brand}/${model}/${year}/${slug}`);
    }
  };

  return (
    <>
      <div className="auto-select">
        <div className="select-row">
          <div className="custom-select-wrapper custom-select-wrapper-cat">
            <select
              className="custom-select custom-select-cat"
              value={brand || "0"}
              onChange={(e) => {
                setBrand(e.target.value);
                setModel("");
                setYear("");
              }}
            >
              <option value="0">Производитель</option>
              {AUTO_BRANDS.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="custom-select-wrapper custom-select-wrapper-cat">
            <select
              className="custom-select custom-select-cat"
              value={model || "0"}
              disabled={!models.length}
              onChange={(e) => {
                setModel(e.target.value);
                setYear("");
              }}
            >
              <option value="0">Модель</option>
              {models.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="custom-select-wrapper custom-select-wrapper-cat">
            <select
              className="custom-select custom-select-cat"
              value={year || "0"}
              disabled={!years.length}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="0">Год выпуска</option>
              {years.map((y) => (
                <option key={y.year} value={String(y.year)}>
                  {y.year}
                </option>
              ))}
            </select>
          </div>
          <div className="custom-select-wrapper custom-select-wrapper-cat">
            <select
              className="custom-select custom-select-cat"
              value="0"
              disabled={!mods.length}
              onChange={(e) => onMod(e.target.value)}
            >
              <option value="0">Модификация</option>
              {mods.map((m) => (
                <option key={m.slug} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {brand && !model && (
        <div className="auto-models">
          <div className="auto-models-title">Список моделей {AUTO_BRANDS.find((b) => b.slug === brand)?.name}</div>
          <div className="auto-models-list">
            {models.map((m) => (
              <Link key={m.slug} href={`/catalog/tires/auto/${brand}/${m.slug}`}>
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
