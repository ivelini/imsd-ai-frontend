// Стартовая страница каталога: .catalog-start-grid + бренды (05.08.2026)
// Данные — getCatalogStart (мок /api/catalog-start): карточки и бренды
// готовыми строками; иконки карточек — на фронте (tire/disk из мокапа).
import type { CatalogStartData } from "@/features/catalog/types";
import { CatalogStartTireIcon, CatalogStartDiskIcon } from "./catalog-start-icons";

export function CatalogStart({ data }: { data: CatalogStartData }) {
  return (
    <section className="catalog-section container">
      <h2>Каталог</h2>
      <div className="catalog-start-grid">
        {data.cards.map((card) => (
          <a href={card.link} className="catalog-start-card" key={card.id}>
            {card.icon === "tire" ? <CatalogStartTireIcon /> : <CatalogStartDiskIcon />}
            <div className="catalog-start-card-info">
              <div className="catalog-start-card-title">{card.title}</div>
              <div className="catalog-start-card-sub">{card.sub}</div>
            </div>
          </a>
        ))}
      </div>
      <div className="catalog-brands">
        <h2 className="catalog-brands-title">Шины по производителям</h2>
        <div className="catalog-brands-list">
          {data.tireBrands.map((b) => (
            <a href={b.link} className="catalog-brand-link" key={b.link_name}>
              {b.link_name}
            </a>
          ))}
        </div>
      </div>
      <div className="catalog-brands">
        <h2 className="catalog-brands-title">Диски по производителям</h2>
        <div className="catalog-brands-list">
          {data.wheelBrands.map((b) => (
            <a href={b.link} className="catalog-brand-link" key={b.link_name}>
              {b.link_name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
