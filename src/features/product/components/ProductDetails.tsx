// Детали товара: заголовок, параметры, цена, корзина (фаза 3, 04.08.2026)
// Server Component — интерактивная часть (количество + кнопка) в AddToCartBlock
import { AddToCartBlock } from "./AddToCartBlock";
import type { ProductDetailData } from "../types";

export function ProductDetails({ product }: { product: ProductDetailData }) {
  return (
    <div className="details">
      <h1 className="details-name">{product.title}</h1>
      <div className="product-info">
        <div className="product-parameters">
          <ul className="parameters-list">
            <li className="parameter-item">
              <span className="parameter-name">Код товара:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.code}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Производитель:</span>
              <span className="parameter-dots"></span>
              <span className="p-badge">{product.brandName} &gt;</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Ширина профиля:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.width}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Высота профиля:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.profile}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Посадочный диаметр:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.diameter}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Сезонность:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.seasonLabel}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Страна бренда:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.countryLabel}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Индекс скорости и нагрузки:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.loadSpeedLabel}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Страна производства:</span>
              <span className="parameter-dots"></span>
              <span className="p-badge">{product.productionCountryLabel} &gt;</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Год выпуска:</span>
              <span className="parameter-dots"></span>
              <span className="p-badge">{product.year} &gt;</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Шипы:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.spikesLabel}</span>
            </li>
            <li className="parameter-item">
              <span className="parameter-name">Run flat:</span>
              <span className="parameter-dots"></span>
              <span className="parameter-value">{product.runFlatLabel}</span>
            </li>
          </ul>
        </div>

        <div className="price-payment-shipping">
          <div className="price-info">
            <span className="current-price">
              {product.price.toLocaleString("ru-RU")} ₽
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
