// Единый рендер HTML статьи: тело статьи, системная страница и блоки в зонах витрины.
// Server Component; стили — общий блок .article-content.
import type { ArticleBlockData } from "@/shared/types/articleBlock";

export function ArticleBlock({
  article,
  className,
}: {
  article: ArticleBlockData;
  /** Дополнительный класс зоны (например, article-block в каталогах). */
  className?: string;
}) {
  const classes = ["article-content", className].filter(Boolean).join(" ");

  return <div className={classes} dangerouslySetInnerHTML={{ __html: article.contentHtml }} />;
}
