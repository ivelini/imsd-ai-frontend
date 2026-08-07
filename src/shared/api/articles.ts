// Articles: статьи (список, одна, похожие)
import { ARTICLES } from "@/data/articles";
import type { Article } from "@/features/articles/types";
import { delay } from "./base";

export type { Article };

export async function getArticles(): Promise<Article[]> {
  return delay(30, [...ARTICLES]);
}

export async function getArticle(slug: string): Promise<Article | null> {
  return delay(30, ARTICLES.find((a) => a.slug === slug) ?? null);
}

export async function getRelatedArticles(
  slug: string,
): Promise<Article[]> {
  const related = ARTICLES.filter((a) => a.slug !== slug).slice(0, 3);
  return delay(30, related);
}
