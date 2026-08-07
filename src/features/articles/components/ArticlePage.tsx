// Статья: .article-section + похожие статьи (фаза 4). Серверный — данные через props.
// Контент — HTML от «бэка» (как descriptionHtml в товаре).
import { NewsCard } from "@/shared/ui/NewsCard";
import type { Article } from "@/features/articles/types";

export function ArticlePage({
  article,
  related,
}: {
  article: Article;
  related: Article[];
}) {
  return (
    <>
      <section className="article-section container">
        <h1 className="article-title">{article.title}</h1>
        <div className="article-meta">{article.date}</div>
        <div className="article-photo">
          <img src="/assets/img/news.png" alt="" />
        </div>
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      </section>
      {related.length > 0 && (
        <section className="news-section container">
          <h2>Похожие статьи</h2>
          <div className="news-list">
            {related.map((a) => (
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
      )}
    </>
  );
}
