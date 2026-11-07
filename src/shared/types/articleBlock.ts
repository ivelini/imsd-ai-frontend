// Блок статьи в зонах витрины: HTML RichEditor из объекта article в корне ответа бэка.

/** DTO: { article: { body } | null } в корне ответов каталога, подбора, модели и карточки. */
export interface ArticleBlockDto {
  body: string;
}

/** Готовый к рендеру блок; null — блока нет (поле article отсутствует). */
export interface ArticleBlockData {
  contentHtml: string;
}
