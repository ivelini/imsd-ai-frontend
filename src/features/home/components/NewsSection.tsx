// Новости на главной: серверный, данные через props (03.08.2026)
// Данные — news из /api/service-page/main (image, title, link, description).
import type { HomeNews } from "@/features/home/types";
import { NewsCard } from "@/shared/ui/NewsCard";

interface NewsSectionProps {
  news: HomeNews[];
}

export function NewsSection({ news }: NewsSectionProps) {
  return (
    <section className="news-section container">
      <h2>Новости</h2>
      <div className="news-list">
        {news.map((n, i) => (
          <NewsCard
            key={`${n.link}-${i}`}
            image={n.image}
            title={n.title}
            text={n.description}
            href={n.link}
          />
        ))}
      </div>
    </section>
  );
}
