// Новости на главной (фаза 1)
import { NEWS_ITEMS } from "@/data/products";
import { NewsCard } from "@/shared/ui/NewsCard";

export function NewsSection() {
  return (
    <section className="news-section container">
      <h2>Новости</h2>
      <div className="news-list">
        {NEWS_ITEMS.map((n) => (
          <NewsCard item={n} key={n.id} />
        ))}
      </div>
    </section>
  );
}
