# Архитектура проекта (карта)

> Sources: CLAUDE.md, 2026-08-19; catalog-tires-live-api, 2026-08-21
> Raw: [CLAUDE.md](../../raw/project/2026-08-19-claude-md.md); [catalog-tires-live-api](../../raw/project/2026-08-21-catalog-tires-live-api.md)

## Overview

Проект — интернет-магазин шин и дисков aalyans.ru: Next.js 16 приложение (`src/`), переносимое 1-в-1 из статичного HTML-мокапа (`.template/`). Данные — моки `src/data/`, имитирующие ответы Laravel-бэка (`backend/`, соседний проект); подключение API — поэтапное через rewrites. С 21.08.2026 каталог шин полностью живой (листинг, гео, SEO-мета).

## Слои

- **`src/app/`** — роутинг и композиция страниц; **`src/features/`** — домены (каталог, корзина, товар, автоподбор); **`src/shared/`** — ядро (api-баррел, UI, lib, layout); **`src/data/`** — моки; **`src/stores/`** — Zustand (только UI).
- **`.template/`** — эталон вёрстки: 16 страниц, BEM-классы, style.css (4611 строк), без JS.

## Ключевые роуты

- Каталог шин `/catalog/tires/[[...params]]` — сегменты `season/brand/width/profile/rN` (C-размеры `r13c`) + query (`price_min`, `price_max`, `delivery[]`, `studded`, `page`).
- Автоподбор `/catalog/tires/auto/[[...auto]]` — каскад марка→модель→год→модификация.
- Товар `/tires/[modelSlug]`, типоразмер `/tires/[modelSlug]/[sizeSlug]` (`185-60-r15-84h`).
- Сервисные: `/cart`, `/checkout`, `/order/[id]` (localStorage-мок), `/order-status`, `/auth/*`, `/articles/*`, `/service-page/[slug]` (контент из API-мока).

## Данные и состояние

- Моки в `src/data/` (nav, servicePages 10 стр., products, catalog, articles 9, cart, checkout); доступ только через `shared/api/data.ts`.
- Источник истины по маршрутам API — `../backend/documentations/scramble/public-api.json` (Scramble-экспорт, генерится в docker `scramble:export-docs`), не моки.
- **Живое (21.08.2026):** каталог шин целиком — листинг `GET /api/catalog/tires` (адаптеры `toTireListQuery`/`toTireProduct`, город слагом `city=` — резолвит бэк), гео `GET /api/reference/city` (`toGeoData`; мок `data/geo.ts` удалён), опции фильтра `GET /api/reference/filter/tire`. SEO-мета страницы — `meta.seo {title, description}` → generateMetadata/h2. Остальное — моки (модель шины, auto-каскад, диски; SeoBlock {title, subtitle} для auto-страницы). Кэш — на бэке (`tire-list:v5`).
- Zustand — только UI (город, попапы, меню); корзина/сессия — React Query + localStorage (`cart`, `orders`, `session`).
- Кастомный CSS (страницы без макетов) — в конце `src/app/style.css` с датой.

## Разработка

- Dev-сервер через Docker (`make up`, порт 30034), образ с `USER node` uid 1000; build/`npm run dev` не запускать одновременно с контейнером (общий `.next`, кэш turbopack).
- Верификация мокапа: `node .claude/verify/verify.mjs` (скриншоты 5×16), `check-all.mjs`.
- Формат slug: бренды — транслит (`bmw`, `michelin`, `nokian-tyres`), модели — как в данных, типоразмеры — `185-60-r15-84h`.

## Решения

Зафиксированные ADR 0001–0004 — отдельные статьи: [api-barrel-data-ts](api-barrel-data-ts.md), [catalog-url-grammar](catalog-url-grammar.md), [model-sizes-pagination](model-sizes-pagination.md), [city-request-context](city-request-context.md). Состояние подключения каталога — [catalog-live-api](catalog-live-api.md).

## See Also

- [catalog-live-api](catalog-live-api.md) — живой листинг каталога: контракт, адаптеры, city-слаг
- [frontend-architecture-rules](frontend-architecture-rules.md)
- [api-contract](api-contract.md)
- [ui-porting-rules](ui-porting-rules.md)
- [adr-practice](adr-practice.md) — правила записи решений
