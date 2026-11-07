// Статьи — живой API (05.11.2026):
//   список  GET /api/articles?category&page&per_page
//   статья  GET /api/articles/{slug}
//   дерево  GET /api/reference/article-categories
import { apiBase } from "./base";
import { formatRuLongDate } from "@/shared/lib/date";
import type {
  Article,
  ArticleCategory,
  ArticleCategoryDto,
  ArticleDto,
  ArticleListItem,
  ArticleListItemDto,
  ArticlesMetaDto,
  ArticlesPage,
} from "@/features/articles/types";

export type { Article };

const IMAGE_PLACEHOLDER = "/assets/img/news.png";
const RELATED_LIMIT = 3;
const DEFAULT_PER_PAGE = 12;

interface ArticlesQuery {
  category?: string | null;
  page: number;
  perPage: number;
}

interface ArticlesResponseDto {
  data: ArticleListItemDto[];
  meta: ArticlesMetaDto;
}

export function toArticleListItem(dto: ArticleListItemDto): ArticleListItem {
  return {
    slug: dto.slug,
    title: dto.title,
    text: dto.excerpt ?? "",
    date: toArticleDate(dto.published_at),
    image: dto.image_url ?? IMAGE_PLACEHOLDER,
    category: dto.category,
  };
}

export function toArticle(dto: ArticleDto): Article {
  return {
    slug: dto.slug,
    title: dto.title,
    text: dto.excerpt ?? "",
    date: toArticleDate(dto.published_at),
    contentHtml: dto.body,
    image: dto.image_url,
    type: dto.type,
    metaTitle: dto.meta_title ?? "",
    metaDescription: dto.meta_description ?? "",
    category: dto.category,
  };
}

export function toArticleCategories(
  dtos: ArticleCategoryDto[],
): ArticleCategory[] {
  return dtos.map((dto) => ({
    title: dto.title,
    slug: dto.slug,
    children: dto.children ?? [],
  }));
}

export function buildArticlesQuery({
  category,
  page,
  perPage,
}: ArticlesQuery): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  params.set("page", String(page));
  params.set("per_page", String(perPage));

  return params.toString();
}

function toArticleDate(publishedAt: string | null): string {
  return publishedAt ? formatRuLongDate(new Date(publishedAt)) : "";
}

export async function getArticles(params: {
  category?: string | null;
  page?: number;
  perPage?: number;
}): Promise<ArticlesPage | null> {
  const query = buildArticlesQuery({
    category: params.category,
    page: params.page ?? 1,
    perPage: params.perPage ?? DEFAULT_PER_PAGE,
  });
  const res = await fetch(`${apiBase()}/articles?${query}`);
  // 404 — неизвестная или неактивная категория; страница показывает notFound()
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getArticles: HTTP ${res.status}`);

  const body: ArticlesResponseDto = await res.json();

  return {
    items: body.data.map(toArticleListItem),
    meta: {
      page: body.meta.current_page,
      lastPage: body.meta.last_page,
      perPage: body.meta.per_page,
      total: body.meta.total,
    },
  };
}

export async function getArticle(slug: string): Promise<Article | null> {
  const res = await fetch(
    `${apiBase()}/articles/${encodeURIComponent(slug)}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getArticle: HTTP ${res.status}`);

  const body: { data: ArticleDto } = await res.json();

  return toArticle(body.data);
}

export async function getArticleCategories(): Promise<ArticleCategory[]> {
  const res = await fetch(`${apiBase()}/reference/article-categories`);
  if (!res.ok) throw new Error(`getArticleCategories: HTTP ${res.status}`);

  const body: { data: ArticleCategoryDto[] } = await res.json();

  return toArticleCategories(body.data);
}

/** Похожие: та же категория (для системной — последние), текущая исключена */
export async function getRelatedArticles(
  article: Article,
): Promise<ArticleListItem[]> {
  const page = await getArticles({
    category: article.category?.slug ?? null,
    page: 1,
    perPage: RELATED_LIMIT + 1,
  });

  return (page?.items ?? [])
    .filter((item) => item.slug !== article.slug)
    .slice(0, RELATED_LIMIT);
}
