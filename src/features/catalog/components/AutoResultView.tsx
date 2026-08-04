// Клиентская обёртка: CarBlock с чекбоксами + фильтруемые секции каталога
"use client";

import { useState } from "react";
import type { ProductBase } from "@/features/catalog/types";
import { CarBlock } from "./CarBlock";
import { ProductCard } from "./ProductCard";

type CarBlockOption = { label: string; width: number; diameter: number; checked?: boolean; key: string; pcd?: string; et?: number; height?: number };
type CarBlockSection = { name: string; options: CarBlockOption[] };
type CarBlockData = { name: string; sections: CarBlockSection[] };

type Section = {
  categorySection: string;
  items: {
    sizeLabel: string;
    sizeKeys: string[];
    sizes: { front: ProductBase; rear?: ProductBase }[];
  }[];
};

interface AutoResultViewProps {
  carBlock: CarBlockData;
  sections: Section[];
  cityLabel: string;
  cityValue?: string;
}

export function AutoResultView({ carBlock, sections, cityLabel, cityValue }: AutoResultViewProps) {
  const defaultKeys = carBlock.sections.flatMap((s) =>
    s.options.filter((o) => o.checked).map((o) => o.key),
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(defaultKeys));

  const toggle = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const visible = (sizeKeys: string[]) =>
    sizeKeys.some((k) => selectedKeys.has(k));

  return (
    <>
      <CarBlock data={carBlock} selectedKeys={selectedKeys} onToggle={toggle} />

      {sections.map((section, si) => (
        <div className="category-section" key={si}>
          {section.categorySection && visible(section.items.flatMap((it) => it.sizeKeys)) ? (
            <div className="category-section-header">{section.categorySection}</div>
          ) : null}
          {section.items.map((item, ii) => (
            <div key={ii} style={{ display: visible(item.sizeKeys) ? undefined : "none" }}>
              <div className="category-section-size">{item.sizeLabel}</div>
              {item.sizes.map((sz, pi) =>
                sz.rear ? (
                  <div className="pair-group" key={pi}>
                    <ProductCard product={sz.front} showLink={false} cityLabel={cityLabel} cityValue={cityValue} />
                    <ProductCard product={sz.rear} showLink={false} pair cityLabel={cityLabel} cityValue={cityValue} />
                  </div>
                ) : (
                  <ProductCard key={pi} product={sz.front} showLink={false} cityLabel={cityLabel} cityValue={cityValue} />
                )
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
