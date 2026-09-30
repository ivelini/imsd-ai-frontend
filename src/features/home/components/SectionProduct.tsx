// Карточка товара главной: .section-product (фаза 1, обновлено 05.08.2026)
// Данные — slider.tires/wheels из /api/service-page/main: price/old_price —
// числа, rating убран (нет в API), link ведёт на товар/каталог.
// Сезонность — SeasonIcons по season (есть только у шин; дискам сезон
// нужно запросить у бэка, если иконки нужны и там).
import type { SliderProduct, SliderTire } from "@/features/home/types";
import { SeasonIcons } from "@/shared/ui/SeasonIcons";
import { formatPrice } from "@/shared/lib/money";


export function SectionProduct({
  product,
}: {
  product: SliderProduct | SliderTire;
}) {
  const season = "season" in product ? product.season : undefined;

  return (
    <div className="section-product">
      <div className="product-photo-blk">
        <img src={product.image} alt="Wheel Product Image" />
      </div>
      {/* link из API; стили .product-title a — под макет (без подчёркивания) */}
      <h3 className="product-title">
        <a href={product.link}>{product.title}</a>
      </h3>
      <div className="product-details">
        <div className="icons">
          <SeasonIcons season={season} />
        </div>
      </div>
      <div className="price-info">
        <span className="current-price">{formatPrice(product.price)}</span>
        {product.old_price > 0 && (
          <span className="old-price">{formatPrice(product.old_price)}</span>
        )}
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
