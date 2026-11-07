// Список статей: .news-list из NewsCard (живой API 05.11.2026). Серверный — данные через props.
import { NewsCard } from "@/shared/ui/NewsCard";
import type { ArticleListItem } from "@/features/articles/types";

export function ArticlesList({ articles }: { articles: ArticleListItem[] }) {
  return (
    <div className="news-list">
      {articles.map((a) => (
        <NewsCard
          key={a.slug}
          image={a.image}
          title={a.title}
          text={a.text}
          href={`/articles/${a.slug}`}
        />
      ))}
    </div>
  );
}
