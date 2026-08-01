// Списки товаров главной: «Шины выгодно» + «Диски более N наименований» (фаза 1)
import { DISK_PRODUCTS, WHEELS_PRODUCTS } from "@/data/products";
import { SectionProduct } from "./SectionProduct";

export function WheelsList() {
  return (
    <div className="wheels-section container">
      <h2>Шины выгодно</h2>
      <div className="product-list responsive">
        {WHEELS_PRODUCTS.map((p) => (
          <SectionProduct product={p} key={p.id} />
        ))}
      </div>
    </div>
  );
}

export function DisksList() {
  return (
    <div className="disk-section container">
      <h2 className="pr">
        Диски более <span className="highlight-text">16520</span> наименований
      </h2>
      <div className="product-list responsive2">
        {DISK_PRODUCTS.map((p) => (
          <SectionProduct product={p} key={p.id} />
        ))}
      </div>
    </div>
  );
}
