// Карточка товара главной: .section-product (фаза 1)
import type { SectionProduct as SectionProductData } from "@/data/products";

export function SectionProduct({ product }: { product: SectionProductData }) {
  return (
    <div className="section-product">
      <div className="product-photo-blk">
        <img src={product.image} alt="Wheel Product Image" />
      </div>
      <h3 className="product-title">{product.title}</h3>
      <div className="product-details">
        <div className="icons">
          <img src="/assets/img/day.svg" alt="" />
          <img src="/assets/img/snw.svg" alt="" />
          <img src="/assets/img/sh.svg" alt="" />
        </div>
        <div className="star-rating">
          <img src="/assets/img/sm-star.svg" alt="Star" className="sm-star" /> <span className="rating-value">{product.rating}</span>
        </div>
      </div>
      <div className="price-info">
        <span className="current-price">{product.price}</span>
        <span className="old-price">{product.oldPrice}</span>
      </div>
      <div className="buy-button-blk">
        <button className="buy-button">
          Купить <span>сейчас</span>
          <img src="/assets/img/bag.svg" alt="" />
        </button>
      </div>
    </div>
  );
}
