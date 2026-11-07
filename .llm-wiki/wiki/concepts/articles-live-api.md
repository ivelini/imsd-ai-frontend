# Статьи и системные страницы: живой API

> Sources: План и реализация articles-live, 2026-11-05; Scramble-экспорт бэка, 2026-11-05
> Raw: [articles-live](../../raw/project/2026-11-05-articles-live.md)

## Overview

С 05.11.2026 статьи блога, системные страницы и меню шапки/футера работают на публичном
API бэка; моки `src/data/articles.ts` и `src/data/servicePages.ts` удалены. Блог и
системные страницы — одна сущность `Article` на бэке (различие — `type: blog|system`),
URL фронта не менялись: блог — `/articles/{slug}`, системные — `/service-page/{slug}`.

## Контракт бэка

| Метод | Путь | Ответ |
|---|---|---|
| GET | `/api/reference/article-menu` | `{data: {header: [{title, slug}], footer: [...]}}` |
| GET | `/api/reference/article-categories` | `{data: [{title, slug, children: [{title, slug}]}]}` |
| GET | `/api/articles?category&page&per_page` | `{data: [ListItem], meta: {current_page,last_page,per_page,total}}` |
| GET | `/api/articles/{slug}` | `{data: {id,type,title,slug,excerpt,body,image_url,meta_title,meta_description,published_at,category}}` |

Правила: только опубликованные; список — `type=blog`, статья — `blog|system`, `seo` и
черновики — 404. Неактивная категория скрывает статьи и даёт 404 на фильтре и прямой
статье. Фильтр по корневой категории включает подкатегории. `per_page` — 1..48, дефолт 12.
`excerpt`/`image_url`/`published_at`/`meta_*` и `category` системной статьи — `null`.
Детали и живой прогон — [integrations/articles.md](../../../documentations/integrations/articles.md).

## Фронт

- `src/shared/api/articles.ts` — чистые адаптеры DTO → view (`toArticleListItem`,
  `toArticle`, `toArticleCategories`, `buildArticlesQuery`) и геттеры: `getArticles`
  (404 категории → `null`), `getArticle` (404 → `null`), `getArticleCategories`,
  `getRelatedArticles` (та же категория или последние, 3 без текущей).
- `src/shared/api/nav.ts` — `getArticleMenu` (таймаут 3 с, ошибка → `null`),
  `toNavLinks` (фикс-пункты вокруг меню), `getNav`. Шапка: «Шиномонтаж» → пункты API →
  «Статьи»; футер: «Каталог» → пункты API → «Статьи».
- `/articles` — серверная страница: `category` и `page` в URL, корневые категории
  ссылками, `.news-list`, общий `Pagination`; `/articles/[id]` — статья с датой,
  категорией в `.article-meta`, обложкой (нет — блок скрыт), meta и похожими;
  `/service-page/[slug]` — системная статья.
- `Pagination` перенесён из `features/catalog` в `shared/ui` (третий потребитель,
  домены не импортируют компоненты друг друга).
- Дата: общий `formatRuLongDate` в `src/shared/lib/date.ts` (второй потребитель —
  booking), формат «31 июля 2026», часовой пояс `Asia/Yekaterinburg`, `null` — пустая
  строка, строка даты не рендерится.

## Ловушки

- `published_at` бэка — ISO в UTC, а бизнес-пояс — `Asia/Yekaterinburg`; без явного
  `timeZone` дата у границы суток «переезжает» на сервере с другим TZ.
- `image_url` — абсолютный `APP_URL/storage/...`; `APP_URL` бэка должен быть публичным.
- 404 списка означает неактивную/неизвестную категорию, а не пустой блог: `getArticles`
  возвращает `null`, страница делает `notFound()`. 5xx — исключение и `global-error.tsx`.
- URL не гейтятся по типу: системная статья, открытая по `/articles/{slug}`, отрендерится
  как блоговая (решение плана — без отдельного 404).
- Пустой блог в dev-БД показывает пустой `.news-list` без сообщения «статей нет» —
  в план не входило.

## See Also

- [project-architecture](project-architecture.md) — карта проекта и состояние подключения бэка
- [backend-error-fallback](backend-error-fallback.md) — поведение при 5xx
- [api-contract](api-contract.md) — правило «данные для отображения формирует бэк»
