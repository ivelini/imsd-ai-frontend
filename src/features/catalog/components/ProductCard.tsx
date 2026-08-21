// Карточка товара каталога .catalog-product (фаза 2)
import Link from "next/link";
import type { ProductBase } from "@/features/catalog/types";
import { appendCityParam } from "@/shared/lib/cityUrl";
import { ParamBadge } from "@/shared/ui/ParamBadge";
import { SeasonIcons } from "@/shared/ui/SeasonIcons";
import { BuyButton } from "./BuyButton";
import { EuLabel } from "@/shared/ui/EuLabel";
import { CardCityBadge } from "./CardCityBadge";

function formatPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}

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
                  p.description ? (
                    <ParamBadge label={p.value} description={p.description} />
                  ) : (
                    <span className="p-badge">{p.value} {">"}</span>
                  )
                ) : (
                  <span><b>{p.value}</b></span>
                )}
              </p>
            ))}
          </div>
          <div className="merge-block">
            <div className="catalog-product-flex-item catalog-product-location-info">
              <CardCityBadge cityLabel={cityLabel} />
              <p className="pickup">Самовывоз <span className="p-badge">8 авг (сб) &gt;</span></p>
              <p className="free-shipping">Доставка до ПВЗ <span className="p-badge">бесплатно &gt;</span></p>
            </div>
            <div className="catalog-product-flex-item catalog-product-purchase-actions">
              <BuyButton product={product} />
              <p className="availability">Наличие {product.quantity} шт.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
