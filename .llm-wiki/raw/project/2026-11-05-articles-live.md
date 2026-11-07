# Статьи и меню на живом API (план articles-live)

> Source: .claude/plans/articles-live.md; documentations/integrations/articles.md; backend/routes/api.php; backend/domains/Content/Article (проект aalyans.ru)
> Collected: 2026-11-05
> Published: 2026-11-05

## Задача

Перевести статьи блога, системные страницы и меню шапки/футера с моков `src/data/`
на публичный API бэка. URL не меняются: блог — `/articles/{slug}`, системные —
`/service-page/{slug}`.

## Контракт бэка (проверен по коду и Scramble 05.11.2026)

```
GET /api/reference/article-menu        → {data: {header: [{title, slug}], footer: [...]}}
GET /api/reference/article-categories  → {data: [{title, slug, children: [{title, slug}]}]}
GET /api/articles?category&page&per_page → {data: [ArticleListItem], meta}
GET /api/articles/{slug}               → {data: Article}
```

- Только опубликованные; список — `type=blog`; статья — `blog|system`; `seo` и черновики — 404.
- Неактивная категория скрывает статьи, фильтр и прямой заход — 404.
- Фильтр по корневой категории включает подкатегории.
- `per_page` — 1..48, дефолт 12.
- `excerpt`, `image_url`, `published_at`, `meta_*`, `category` у системной — nullable.
- `published_at` — ISO UTC; часовой пояс бэка — `Asia/Yekaterinburg`.
- `image_url` — абсолютный `APP_URL/storage/...`.

## Решения фронта

- Меню: пункты из API; фикс-ссылки в коде — шапка «Шиномонтаж» первой и «Статьи»
  последней, футер «Каталог» первым и «Статьи» последней. Меню недоступно/таймаут 3 с —
  остаются только фикс-ссылки, layout не падает.
- Список — серверный; `category` и `page` в URL; 404 категории → `notFound()`; прочие
  ошибки → `global-error.tsx`.
- Фильтр — корневые категории ссылками (макета нет, решение пользователя).
- Категория на странице статьи — в `.article-meta` рядом с датой.
- Похожие — тот же `/api/articles` с категорией, 3 без текущей.
- Дата — общий `formatRuLongDate` (`src/shared/lib/date.ts`), часовой пояс
  `Asia/Yekaterinburg`; `null` — строка даты не рендерится.
- `image_url=null` — заглушка `/assets/img/news.png` в карточке, блок фото скрыт в статье.
- URL не гейтятся по типу: системная статья по `/articles/{slug}` отрендерится.

## Реализация

- `src/shared/api/articles.ts` — адаптеры `toArticleListItem`, `toArticle`,
  `toArticleCategories`, `buildArticlesQuery`; `getArticles` (404 → null), `getArticle`
  (404 → null), `getArticleCategories`, `getRelatedArticles`.
- `src/shared/api/nav.ts` — `getArticleMenu`, `toNavLinks`, `getNav`.
- Страницы: `/articles` (категории + `.pagination`), `/articles/[id]`, `/service-page/[slug]`.
- `Pagination` перенесён `features/catalog` → `shared/ui` (третий потребитель).
- Удалены `src/data/articles.ts`, `src/data/servicePages.ts`,
  `src/shared/api/service-pages.ts`.

## Проверки

- Тесты 147/147 (8 новых в `tests/unit/articlesAdapter.test.ts`), lint 0 ошибок, tsc чисто.
- Живой прогон: меню из API в шапке/футере; `/service-page/dostavka` 200;
  `/articles/unknown`, `/service-page/unknown`, `/articles?category=nope` — 404.
- В dev-БД блоговых статей и категорий нет (0/0) — карточки/фильтр/пагинация визуально
  не проверены, нужен контент.
