// DTO статей (фаза 4) — контракт ответа бэка

export interface Article {
  /** slug в URL: /articles/[slug] */
  slug: string;
  title: string;
  /** Анонс для карточки (.news-text) */
  text: string;
  /** Дата публикации (.article-meta) — готовая строка от «бэка» */
  date: string;
  /** Контент статьи (.article-content): <p>, <h3>, <ul> */
  contentHtml: string;
}
