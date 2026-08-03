// Новости на главной: серверный, данные через props (03.08.2026)
import type { NewsItem } from "@/features/home/types";
import { NewsCard } from "@/shared/ui/NewsCard";

interface NewsSectionProps {
  news: NewsItem[];
}

export function NewsSection({ news }: NewsSectionProps) {
  return (
    <section className="news-section container">
      <h2>Новости</h2>
      <div className="news-list">
        {news.map((n) => (
          <NewsCard item={n} key={n.id} />
        ))}
      </div>
    </section>
  );
}
