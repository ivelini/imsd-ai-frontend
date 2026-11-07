// DTO статей — контракт ответа бэка (Scramble 05.11.2026):
//   GET /api/articles, GET /api/articles/{slug},
//   GET /api/reference/article-categories, GET /api/reference/article-menu

export type ArticleType = "blog" | "system" | "seo";

/** Категория в списке и в статье: только подпись и slug */
export interface ArticleCategoryRef {
  title: string;
  slug: string;
}

export interface ArticleCategoryDto extends ArticleCategoryRef {
  children?: ArticleCategoryRef[];
}

export interface ArticleListItemDto {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  category: ArticleCategoryRef;
}

export interface ArticleDto {
  id: number;
  type: ArticleType;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  category: ArticleCategoryRef | null;
}

export interface ArticleMenuItemDto {
  title: string;
  slug: string;
}

export interface ArticleMenuDto {
  header: ArticleMenuItemDto[];
  footer: ArticleMenuItemDto[];
}

export interface ArticlesMetaDto {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Дерево категорий для фильтра: корни с подкатегориями */
export interface ArticleCategory extends ArticleCategoryRef {
  children: ArticleCategoryRef[];
}

/** Карточка списка */
export interface ArticleListItem {
  slug: string;
  title: string;
  /** Анонс (.news-text); excerpt может быть пустым */
  text: string;
  /** Готовая русская строка; пустая — даты нет */
  date: string;
  /** Обложка или заглушка */
  image: string;
  category: ArticleCategoryRef;
}

/** Статья: DTO + HTML-тело, meta и тип */
export interface Article {
  slug: string;
  title: string;
  text: string;
  date: string;
  contentHtml: string;
  /** null — обложки нет, блок фото скрывается */
  image: string | null;
  type: ArticleType;
  metaTitle: string;
  metaDescription: string;
  category: ArticleCategoryRef | null;
}

export interface ArticlesPage {
  items: ArticleListItem[];
  meta: {
    page: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}
