# Интеграция: статьи и системные страницы (публичный API бэка)

Проверено 05.11.2026 по Scramble-экспорту `../backend/documentations/scramble/public-api.json`
и коду `../backend/domains/Content/Article/`. Источник истины — экспорт/код бэка, не моки.

Запросы идут через `apiBase()`: сервер — `BACKEND_URL`, браузер — `/api` через
`rewrites()` в `next.config.ts`.

## Эндпоинты

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/api/reference/article-menu` | `{data: {header: [{title, slug}], footer: [...]}}` — ссылки на системные статьи |
| GET | `/api/reference/article-categories` | `{data: [{title, slug, children: [{title, slug}]}]}` — дерево активных категорий (глубина 2) |
| GET | `/api/articles?category&page&per_page` | `{data: [...], meta: {current_page,last_page,per_page,total}}` — список блога |
| GET | `/api/articles/{slug}` | `{data: {id,type,title,slug,excerpt,body,image_url,meta_title,meta_description,published_at,category}}` |

## Правила бэка

- Только опубликованные (`status=published`, `published_at` наступила); черновики — 404.
- Список — `type=blog`; статья — `blog` или `system`; `type=seo` — 404.
- Неактивная категория скрывает свои статьи; прямой заход и фильтр по ней — 404.
- Фильтр по корневой категории включает её подкатегории.
- `excerpt`, `image_url`, `published_at`, `meta_*`, `category` у системной статьи — `null`.
- `per_page` — 1..48, дефолт 12.
- `published_at` — ISO в UTC; бэк живёт в `Asia/Yekaterinburg` (`backend/config/app.php`).
- `image_url` — абсолютный `APP_URL/storage/...` (`backend/config/filesystems.php`);
  `APP_URL` бэка должен быть публичным, иначе картинки не загрузятся из браузера.

## Фронт

- `src/shared/api/articles.ts` — адаптеры DTO → view, `getArticles` (404 категории → `null`),
  `getArticle` (404 → `null`), `getArticleCategories`, `getRelatedArticles` (та же категория,
  3 без текущей).
- `src/shared/api/nav.ts` — `getArticleMenu` (таймаут 3 с, ошибка → `null`), `toNavLinks`
  (фикс-пункты вокруг меню), `getNav`.
- Страницы: `/articles` (категории и пагинация в URL), `/articles/[id]`, `/service-page/[slug]`.
- Ошибки: 404 → `notFound()`; прочие 5xx → `global-error.tsx`. Меню при недоступном API
  не роняет layout — остаются фиксированные ссылки.
- Дата: `formatRuLongDate` (`src/shared/lib/date.ts`) форматирует в `Asia/Yekaterinburg`;
  пустая дата — строка даты не рендерится.
- Обложки: `null` в карточке — заглушка `/assets/img/news.png`; в статье блок фото скрыт.
