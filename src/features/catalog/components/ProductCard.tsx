// Карточка товара каталога .catalog-product (фаза 2)
import Link from "next/link";
import type { ProductBase } from "@/features/catalog/types";
import { appendCityParam } from "@/shared/lib/cityUrl";
import { BadgeValue } from "@/shared/ui/BadgeValue";
import { SeasonIcons } from "@/shared/ui/SeasonIcons";
import { BuyButton } from "./BuyButton";
import { EuLabel } from "@/shared/ui/EuLabel";
import { formatPrice } from "@/shared/lib/money";
import { CardCityBadge } from "./CardCityBadge";

interface ProductCardProps {
  product: ProductBase;
  showLink?: boolean; // true в каталоге, false в автоподборе/модели
  pair?: boolean; // вторая шина комплекта → класс product-pair
  cityLabel?: string;
  cityValue?: string;
}

export function ProductCard({ product, showLink = true, pair = false, cityLabel, cityValue }: ProductCardProps) {
  const href = appendCityParam(`/${product.category}/${product.modelSlug}/${product.sizeSlug}`, cityValue ?? "");

  return (
    <div className={`catalog-product${pair ? " product-pair" : ""}`}>
      {/* Изображение */}
      <div className="catalog-product-image">
        <div className="catalog-product-image-panel">
          <SeasonIcons season={product.season} />
        </div>
        <img src={product.image} alt={product.modelName} />
        {product.euLabel && <EuLabel {...product.euLabel} />}
      </div>

      {/* Информация */}
      <div className="catalog-product-details">
        <div className="catalog-product-info">
          <h2 className="catalog-product-title">
            {showLink ? (
              <Link href={href}>{product.title}</Link>
            ) : (
              <span>{product.title}</span>
            )}
          </h2>
          <div className="catalog-product-prices">
            {/* price nullable с бэка (нет цены города) — блок цен скрывается */}
            {typeof product.price === "number" && (
              <p className="catalog-product-new-price">{formatPrice(product.price)}</p>
            )}
            {product.oldPrice && typeof product.price === "number" && product.oldPrice > product.price && (
              <p className="catalog-product-old-price">{formatPrice(product.oldPrice)}</p>
            )}
          </div>
        </div>
        <div className="catalog-product-flex-container">
          <div className="catalog-product-flex-item catalog-product-general-info">
            <p className="country">Код товара: {product.ean}</p>
            {product.parameters.map((p, i) => (
              <p className="country" key={i}>
                {p.name}{" "}
                {p.badge ? (
                  <BadgeValue label={p.value} description={p.description} />
                ) : (
                  <span><b>{p.value}</b></span>
                )}
              </p>
            ))}
          </div>
          <div className="merge-block">
            <div className="catalog-product-flex-item catalog-product-location-info">
              <CardCityBadge cityLabel={cityLabel} />
              {product.pickup && (
                <p className="pickup">
                  {product.pickup.name}{" "}
                  <BadgeValue label={product.pickup.value} description={product.pickup.description} />
                </p>
              )}
              {product.pvzDelivery && (
                <p className="free-shipping">
                  {product.pvzDelivery.name}{" "}
                  <BadgeValue label={product.pvzDelivery.value} description={product.pvzDelivery.description} />
                </p>
              )}
            </div>
            <div className="catalog-product-flex-item catalog-product-purchase-actions">
              <BuyButton product={product} />
              {product.quantity !== null && (
                <p className="availability">Наличие {product.quantity} шт.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
