// Детали товара: заголовок, параметры, цена, корзина (фаза 3, 04.08.2026)
// Server Component — интерактивные острова: ParamBadge, AddToCartBlock
import { AddToCartBlock } from "./AddToCartBlock";
import { ParamBadge } from "@/shared/ui/ParamBadge";
import type { ProductDetailData } from "../types";

export function ProductDetails({ product }: { product: ProductDetailData }) {
  return (
    <div className="details">
      <h1 className="details-name">{product.title}</h1>
      <div className="product-info">
        <div className="product-parameters">
          <ul className="parameters-list">
            {product.parameters.map((p, i) => (
              <li className="parameter-item" key={i}>
                <span className="parameter-name">{p.name}</span>
                <span className="parameter-dots"></span>
                {p.badge ? (
                  p.description ? (
                    <ParamBadge label={p.value} description={p.description} />
                  ) : (
                    <span className="p-badge">{p.value} {">"}</span>
                  )
                ) : (
                  <span className="parameter-value">{p.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="price-payment-shipping">
          <div className="price-info">
            <span className="current-price">
              {product.price?.toLocaleString("ru-RU") ?? ""} ₽
            </span>
            {product.oldPrice && (
              <span className="old-price">
                {product.oldPrice.toLocaleString("ru-RU")} ₽
              </span>
            )}
          </div>

          <AddToCartBlock product={product} />
        </div>
      </div>
    </div>
  );
}
