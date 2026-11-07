// Адаптер блока статьи: article из корня ответа → данные рендера.
import type { ArticleBlockData, ArticleBlockDto } from "@/shared/types/articleBlock";

/** Нет объекта article (поле отсутствует или null) — блока нет. */
export function toArticleBlock(dto?: ArticleBlockDto | null): ArticleBlockData | null {
  if (!dto) return null;
  return { contentHtml: dto.body };
}
