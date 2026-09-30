# Архитектура проекта (карта)

> Sources: CLAUDE.md, 2026-08-19; catalog-tires-live-api, 2026-08-21; Перенос мокапа шиномонтажа, 2026-09-12
> Raw: [CLAUDE.md](../../raw/project/2026-08-19-claude-md.md); [catalog-tires-live-api](../../raw/project/2026-08-21-catalog-tires-live-api.md); [booking-domain-port](../../raw/project/2026-09-12-booking-domain-port.md)

## Overview

Проект — интернет-магазин шин и дисков aalyans.ru: Next.js 16 приложение (`src/`), переносимое 1-в-1 из статичного HTML-мокапа (`.template/`). Данные — моки `src/data/`, имитирующие ответы Laravel-бэка (`backend/`, соседний проект); подключение API — поэтапное через rewrites. С 21.08.2026 каталог шин полностью живой (листинг, гео, SEO-мета). С 12.09.2026 в мокапе есть домен онлайн-записи на шиномонтаж (`booking`) — пока только как эталон вёрстки.

## Слои

- **`src/app/`** — роутинг и композиция страниц; **`src/features/`** — домены (каталог, корзина, товар, автоподбор); **`src/shared/`** — ядро (api-баррел, UI, lib, layout); **`src/data/`** — моки; **`src/stores/`** — Zustand (только UI).
- **`.template/`** — эталон вёрстки: 27 страниц, BEM-классы, без JS. `style.css` — база 4701 строка плюс доменные блоки в конце с пометкой даты (booking — +1206 строк, 12.09.2026).

## Ключевые роуты

- Каталог шин `/catalog/tires/[[...params]]` — сегменты `season/brand/wN/pN/rN` (префиксные размеры: `w185`, `p60`, C-размеры `r13c`; невалидный сегмент → 404) + query (`price_min`, `price_max`, `delivery[]`, `studded`, `page`).
- Автоподбор `/catalog/tires/auto/[[...auto]]` — каскад марка→модель→год→модификация.
- Товар `/tires/[modelSlug]`, типоразмер `/tires/[modelSlug]/[sizeSlug]` (`185-60-r15-84h`).
- Сервисные: `/cart`, `/checkout`, `/order/[id]` (localStorage-мок), `/order-status`, `/auth/*`, `/articles/*`, `/service-page/[slug]` (контент из API-мока).
- Шиномонтаж (booking): React-роутов пока нет — есть макет `.template/booking/` (поток время → услуги → данные → код → успех, состояния отказа, «Мои записи» в `my/`). Детали — [booking-domain](booking-domain.md).

## Данные и состояние

- Моки в `src/data/` (nav, servicePages 10 стр., products, catalog, articles 9, cart, checkout); доступ только через `shared/api/data.ts`.
- Источник истины по маршрутам API — `../backend/documentations/scramble/public-api.json` (Scramble-экспорт, генерится в docker `scramble:export-docs`), не моки.
- **Живое (21.08.2026):** каталог шин целиком — листинг `GET /api/catalog/tires` (адаптеры `toTireListQuery`/`toTireProduct`, город слагом `city=` — резолвит бэк), гео `GET /api/reference/city` (`toGeoData`; мок `data/geo.ts` удалён), опции фильтра `GET /api/reference/filter/tire`. SEO-мета страницы — `meta.seo {title, description}` → generateMetadata/h2. Остальное — моки (модель шины, auto-каскад, диски; SeoBlock {title, subtitle} для auto-страницы). Кэш — на бэке (`tire-list:v5`).
- Zustand — только UI (город, попапы, меню); корзина/сессия — React Query + localStorage (`cart`, `orders`, `session`).
- Кастомный CSS (страницы без макетов) — в конце `src/app/style.css` с датой.

## Разработка

- Dev-сервер через Docker (`make up`, порт 30034), образ с `USER node` uid 1000; build/`npm run dev` не запускать одновременно с контейнером (общий `.next`, кэш turbopack).
- Верификация мокапа: `node .claude/verify/verify.mjs` (скриншоты 5×27), `check-all.mjs` (переполнения, битые картинки, битые ссылки). Требуют `playwright` — в `devDependencies` проекта его нет.
- Формат slug: бренды — транслит (`bmw`, `michelin`, `nokian-tyres`), модели — как в данных, типоразмеры — `185-60-r15-84h`.

## Решения

Зафиксированные ADR 0001–0004 — отдельные статьи: [api-barrel-data-ts](api-barrel-data-ts.md), [catalog-url-grammar](catalog-url-grammar.md), [model-sizes-pagination](model-sizes-pagination.md), [city-request-context](city-request-context.md). Состояние подключения каталога — [catalog-live-api](catalog-live-api.md).

## See Also

- [catalog-live-api](catalog-live-api.md) — живой листинг каталога: контракт, адаптеры, city-слаг
- [booking-domain](booking-domain.md) — макет записи на шиномонтаж: поток, правила продукта, решения порта
- [frontend-architecture-rules](frontend-architecture-rules.md)
- [api-contract](api-contract.md)
- [ui-porting-rules](ui-porting-rules.md)
- [adr-practice](adr-practice.md) — правила записи решений
