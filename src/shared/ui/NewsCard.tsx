// Карточка новости: .news — общая для главной (features/home) и статей (features/articles)
import type { NewsItem } from "@/features/home/types";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className="news">
      <img className="news-image" src="/assets/img/news.png" alt="" />
      <h3 className="news-title">{item.title}</h3>
      <h3 className="news-text">{item.text}</h3>
      <a className="go-news-link">Подребнее &gt;</a>
    </div>
  );
}
