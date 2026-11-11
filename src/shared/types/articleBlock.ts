// Блок статьи в зонах витрины: готовая HTML-строка из поля article в корне ответа бэка.

/** Готовый к рендеру блок; null — блока нет (ключа article нет, строка пустая). */
export interface ArticleBlockData {
  contentHtml: string;
}
