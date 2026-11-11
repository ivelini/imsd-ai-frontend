// Адаптер блока статьи: article (HTML-строка) из корня ответа → данные рендера.
import type { ArticleBlockData } from "@/shared/types/articleBlock";

/** Нет текста (ключа нет, null или пустая строка) — блока нет. */
export function toArticleBlock(article?: string | null): ArticleBlockData | null {
  if (!article) return null;
  return { contentHtml: article };
}
