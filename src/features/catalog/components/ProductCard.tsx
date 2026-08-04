// Карточка товара каталога .catalog-product (фаза 2)
import Link from "next/link";
import type { ProductBase } from "@/features/catalog/types";
import { appendCityParam } from "@/shared/lib/cityUrl";
import { EuLabel } from "./EuLabel";
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
  const categoryPath = (product as any).category === "wheels" ? "wheels" : "tires";
  const href = appendCityParam(`/${categoryPath}/${product.modelSlug}/${product.sizeSlug}`, cityValue ?? "");

  return (
    <div className={`catalog-product${pair ? " product-pair" : ""}`}>
      {/* Изображение */}
      <div className="catalog-product-image">
        <div className="catalog-product-image-panel">
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M12.5 19.3182C13.8485 19.3182 15.1667 18.9183 16.288 18.1691C17.4092 17.4199 18.2831 16.3551 18.7992 15.1092C19.3152 13.8633 19.4503 12.4924 19.1872 11.1698C18.9241 9.84724 18.2747 8.63236 17.3212 7.67882C16.3676 6.72528 15.1528 6.07591 13.8302 5.81283C12.5076 5.54975 11.1367 5.68477 9.89079 6.20082C8.64493 6.71687 7.58008 7.59078 6.83089 8.71202C6.0817 9.83327 5.68182 11.1515 5.68182 12.5C5.68362 14.3077 6.40254 16.0409 7.68081 17.3192C8.95908 18.5975 10.6923 19.3164 12.5 19.3182Z" fill="#FFC10A" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M25 12.5C25 12.8014 24.8803 13.0904 24.6672 13.3035C24.4541 13.5166 24.165 13.6364 23.8636 13.6364H19.7886L22.3943 16.242C22.6013 16.4564 22.7159 16.7434 22.7133 17.0414C22.7107 17.3393 22.5912 17.6243 22.3805 17.835C22.1698 18.0457 21.8848 18.1652 21.5868 18.1678C21.2889 18.1704 21.0018 18.0559 20.7875 17.8489L16.575 13.6364H13.6364V16.575L17.8489 20.7875C18.0559 21.0018 18.1704 21.2889 18.1678 21.5868C18.1652 21.8848 18.0457 22.1698 17.835 22.3805C17.6243 22.5912 17.3393 22.7107 17.0414 22.7133C16.7434 22.7159 16.4564 22.6013 16.242 22.3943L13.6364 19.7886V23.8636C13.6364 24.165 13.5166 24.4541 13.3035 24.6672C13.0904 24.8803 12.8014 25 12.5 25C12.1986 25 11.9096 24.8803 11.6965 24.6672C11.4834 24.4541 11.3636 24.165 11.3636 23.8636V19.7886L8.75795 22.3943C8.65313 22.5029 8.52774 22.5894 8.3891 22.649C8.25045 22.7085 8.10134 22.7399 7.95046 22.7412C7.79957 22.7425 7.64993 22.7138 7.51028 22.6566C7.37062 22.5995 7.24375 22.5151 7.13705 22.4084C7.03035 22.3017 6.94598 22.1748 6.88884 22.0352C6.8317 21.8955 6.80295 21.7459 6.80426 21.595C6.80557 21.4441 6.83692 21.295 6.89648 21.1564C6.95603 21.0177 7.0426 20.8923 7.15114 20.7875L11.3636 16.575V13.6364H8.425L4.2125 17.8489C3.99818 18.0559 3.71113 18.1704 3.41318 18.1678C3.11523 18.1652 2.83022 18.0457 2.61952 17.835C2.40883 17.6243 2.28932 17.3393 2.28673 17.0414C2.28414 16.7434 2.39868 16.4564 2.60568 16.242L5.21136 13.6364H1.13636C0.834981 13.6364 0.545943 13.5166 0.332833 13.3035C0.119724 13.0904 0 12.8014 0 12.5C0 12.1986 0.119724 11.9096 0.332833 11.6965C0.545943 11.4834 0.834981 11.3636 1.13636 11.3636H5.21136L2.60568 8.75795C2.49715 8.65313 2.41058 8.52774 2.35102 8.3891C2.29147 8.25045 2.26012 8.10134 2.25881 7.95046C2.2575 7.79957 2.28625 7.64993 2.34338 7.51028C2.40052 7.37062 2.4849 7.24375 2.5916 7.13705C2.69829 7.03035 2.82517 6.94598 2.96482 6.88884C3.10448 6.8317 3.25412 6.80295 3.405 6.80426C3.55589 6.80557 3.705 6.83692 3.84364 6.89648C3.98228 6.95603 4.10767 7.0426 4.2125 7.15114L8.425 11.3636H11.3636V8.425L7.15114 4.2125C7.0426 4.10767 6.95603 3.98228 6.89648 3.84364C6.83692 3.705 6.80557 3.55589 6.80426 3.405C6.80295 3.25412 6.8317 3.10448 6.88884 2.96482C6.94598 2.82517 7.03035 2.69829 7.13705 2.5916C7.24375 2.4849 7.37062 2.40052 7.51028 2.34338C7.64993 2.28625 7.79957 2.2575 7.95046 2.25881C8.10134 2.26012 8.25045 2.29147 8.3891 2.35102C8.52774 2.41058 8.65313 2.49715 8.75795 2.60568L11.3636 5.21136V1.13636C11.3636 0.834981 11.4834 0.545943 11.6965 0.332833C11.9096 0.119724 12.1986 0 12.5 0C12.8014 0 13.0904 0.119724 13.3035 0.332833C13.5166 0.545943 13.6364 0.834981 13.6364 1.13636V5.21136L16.242 2.60568C16.3469 2.49715 16.4723 2.41058 16.6109 2.35102C16.7495 2.29147 16.8987 2.26012 17.0495 2.25881C17.2004 2.2575 17.3501 2.28625 17.4897 2.34338C17.6294 2.40052 17.7563 2.4849 17.8629 2.5916C17.9696 2.69829 18.054 2.82517 18.1112 2.96482C18.1683 3.10448 18.1971 3.25412 18.1957 3.405C18.1944 3.55589 18.1631 3.705 18.1035 3.84364C18.044 3.98228 17.9574 4.10767 17.8489 4.2125L13.6364 8.425V11.3636H16.575L20.7875 7.15114C20.8923 7.0426 21.0177 6.95603 21.1564 6.89648C21.295 6.83692 21.4441 6.80557 21.595 6.80426C21.7459 6.80295 21.8955 6.8317 22.0352 6.88884C22.1748 6.94598 22.3017 7.03035 22.4084 7.13705C22.5151 7.24375 22.5995 7.37062 22.6566 7.51028C22.7138 7.64993 22.7425 7.79957 22.7412 7.95046C22.7399 8.10134 22.7085 8.25045 22.649 8.3891C22.5894 8.52774 22.5029 8.65313 22.3943 8.75795L19.7886 11.3636H23.8636C24.165 11.3636 24.4541 11.4834 24.6672 11.6965C24.8803 11.9096 25 12.1986 25 12.5Z" fill="#3059A8" />
          </svg>
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
            <p className="catalog-product-new-price">{formatPrice(product.price)}</p>
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="catalog-product-old-price">{formatPrice(product.oldPrice)}</p>
            )}
          </div>
        </div>
        <div className="catalog-product-flex-container">
          <div className="catalog-product-flex-item catalog-product-general-info">
            <p className="product-code"><b>Код товара:</b> {product.code}</p>
            <p className="country">Производитель: <span className="p-badge">{product.brandName} &gt;</span></p>
            <p className="country">Страна производства: <span className="p-badge">{product.countryLabel} &gt;</span></p>
            <p className="country">Год выпуска: <span className="p-badge">{product.year} &gt;</span></p>
          </div>
          <div className="merge-block">
            <div className="catalog-product-flex-item catalog-product-location-info">
              <CardCityBadge cityLabel={cityLabel} />
              <p className="pickup">Самовывоз <span className="p-badge">8 авг (сб) &gt;</span></p>
              <p className="free-shipping">Доставка до ПВЗ <span className="p-badge">бесплатно &gt;</span></p>
            </div>
            <div className="catalog-product-flex-item catalog-product-purchase-actions">
              <button className="buy-now">
                <p>Купить</p>
                <img src="/assets/img/bag.svg" alt="" />
              </button>
              <p className="availability">Наличие {product.quantity} шт.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
