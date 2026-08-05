// Список статей: .news-list из NewsCard (фаза 4). Серверный — данные через props.
import { NewsCard } from "@/shared/ui/NewsCard";
import type { Article } from "@/shared/api/data";

export function ArticlesList({ articles }: { articles: Article[] }) {
  return (
    <section className="articles-section container">
      <h2>Статьи</h2>
      <div className="news-list">
        {articles.map((a) => (
          <NewsCard
            key={a.slug}
            image="/assets/img/news.png"
            title={a.title}
            text={a.text}
            href={`/articles/${a.slug}`}
          />
        ))}
      </div>
    </section>
  );
}
