// Статья: .article-section + похожие статьи (живой API 05.11.2026).
// Серверный — данные через props; контент — HTML RichEditor от бэка.
import Link from "next/link";
import { NewsCard } from "@/shared/ui/NewsCard";
import { ArticleBlock } from "@/shared/ui/ArticleBlock";
import type { Article, ArticleListItem } from "@/features/articles/types";

export function ArticlePage({
  article,
  related,
}: {
  article: Article;
  related: ArticleListItem[];
}) {
  return (
    <>
      <section className="article-section container">
        <h1 className="article-title">{article.title}</h1>
        {(article.date || article.category) && (
          <div className="article-meta">
            {article.date}
            {article.date && article.category && " · "}
            {article.category && (
              <Link
                href={`/articles?category=${encodeURIComponent(article.category.slug)}`}
              >
                {article.category.title}
              </Link>
            )}
          </div>
        )}
        {article.image && (
          <div className="article-photo">
            <img src={article.image} alt="" />
          </div>
        )}
        <ArticleBlock article={article} />
      </section>
      {related.length > 0 && (
        <section className="news-section container">
          <h2>Похожие статьи</h2>
          <div className="news-list">
            {related.map((a) => (
              <NewsCard
                key={a.slug}
                image={a.image}
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
