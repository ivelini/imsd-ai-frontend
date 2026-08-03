// Списки товаров главной: карусели со scroll-snap (03.08.2026)
"use client";

import type { SectionProduct as SectionProductData } from "@/features/home/types";
import { SectionProduct } from "./SectionProduct";

interface ProductListProps {
  wheels: SectionProductData[];
  disks: SectionProductData[];
}

export function WheelsList({ products }: { products: SectionProductData[] }) {
  return (
    <div className="wheels-section container">
      <h2>Шины выгодно</h2>
      <div className="product-list responsive">
        {products.map((p) => (
          <SectionProduct product={p} key={p.id} />
        ))}
      </div>
    </div>
  );
}

export function DisksList({ products }: { products: SectionProductData[] }) {
  return (
    <div className="disk-section container">
      <h2 className="pr">
        Диски более <span className="highlight-text">16520</span> наименований
      </h2>
      <div className="product-list responsive2">
        {products.map((p) => (
          <SectionProduct product={p} key={p.id} />
        ))}
      </div>
    </div>
  );
}

export function HomeProductLists({ wheels, disks }: ProductListProps) {
  return (
    <>
      <WheelsList products={wheels} />
      <DisksList products={disks} />
    </>
  );
}
