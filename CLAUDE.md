@AGENTS.md

# CLAUDE.md

## Что это

Интернет-магазин шин и дисков (aalyans.ru), два слоя:

1. **`src/` — Next.js 16 приложение** (App Router, TypeScript, Turbopack, `@/*`-алиас, Zustand 5). UI переносится из мокапа. Код: `src/app/` (роутинг), `src/features/` (домены), `src/shared/` (ядро), `src/data/` (моки), `src/stores/` (Zustand).
2. **`.template/` — статичный HTML-мокап дизайна** (эталон вёрстки). 28 страниц, стили в `assets/css/style.css` (база 4701 строка + блоки доменов ниже), BEM-подобные классы, без JavaScript. Страницы витрины друг на друга не ссылаются; страницы домена `booking/` связаны сквозным потоком (степпер, CTA, крошки).

Соседние проекты: `admin/` (React SPA), `backend/` (Laravel, владеет бизнес-логикой; API позже).

## Правила

- Перенос вёрстки: **`.claude/rules/ui-porting.md`**
- Архитектура frontend: **`.claude/rules/frontend-architecture.md`**
- Локальные навыки: **`/planning-mode-fe` → `/coder-mode-fe` → `/review-fe`** — версии planning-mode/coder-mode/review под этот проект. Глобальные `/planning-mode`, `/coder-mode`, `/review` — Laravel-версии, здесь не использовать.

## Команды

- `npm run dev` / `npm run build` / `npm run lint` — Next.js; `npm test` — Vitest (unit, `tests/unit/`)
- **Dev-сервер — через Docker** (`make up`, порт 30034). Образ кастомный (`docker/frontend/Dockerfile`, `USER node` uid 1000 = хост-пользователь), поэтому `.next`/`node_modules` принадлежат uid 1000 и локальный `npm run build` работает. Не запускать build/`npm run dev` одновременно с dev-контейнером — общий `.next` (кэш turbopack повреждается).
- Мокап: открыть `.html` в `.template/` или `python3 -m http.server 8765`
- Выкладка: пуш в `master` → `.github/workflows/deploy.yml` (проверки → сборка на раннере → релиз на сервере → `pm2 restart aalyans74.ru`). Настройки, откат и диагностика — `documentations/operations.md`. Прод-приложение запускается `npm start` = `node server.mjs` (кастомный сервер Next: панель отдаёт адрес unix-сокета в `SOCKET` — `next start` сокет не умеет).
- Верификация мокапа: `node .claude/verify/verify.mjs` (скриншоты 5 разрешений × 27 страниц) и `node .claude/verify/check-all.mjs` (переполнения/битые картинки/битые ссылки). Требуют `playwright` — в `devDependencies` проекта его нет (запускались через временную установку в `/tmp` + симлинк в `node_modules`).

## Схема роутов

- Каталог шин: `/catalog/tires/[[...params]]` — сегменты `season/brand/width/profile/rN` (C-размеры: `r13c`) + query (`price_min`, `price_max`, `delivery[]`, `studded`, `page`).
- Подбор по авто: `/catalog/{tires|wheels}/auto/[[...auto]]` — каскад марка→модель→год→модификация → результат с парами. Живой API: сегменты — слаги (`acura/integra/1999/1-8i`; числовой id — legacy-редирект); справочники `/api/reference/vehicle/makes/{make}/models/…` (`category=tire|wheel`), результат `/api/catalog/tires|wheels/by-vehicle/{make}/{model}/{year}/{mod}`.
- Модель/товар: `/tires/[brandSlug]/[modelSlug]` — модель шины; `/tires/[brandSlug]/[modelSlug]/[sizeSlug]` — карточка шины (`sizeSlug` — полный слаг позиции, `yokohama-bluearth-e70b-215-55-r17-94v`). Оба — живой API.
- Диски: `/catalog/wheels/[[...params]]` — листинг (живой); `/wheels/[brandSlug]/[sizeSlug]` — карточка диска (`sizeSlug` — слаг позиции без префикса бренда; модели в слаге нет).
- Сервисные: `/cart`, `/checkout`, `/order/[id]` (клиентская — заказ в localStorage-моке), `/order-status`, `/auth/login|register`, `/articles`, `/articles/[id]`.
- Сервисные страницы: `/service-page/[slug]` — системная статья `GET /api/articles/{slug}`; ссылки шапки/футера — из `GET /api/reference/article-menu` (фикс-пункты «Шиномонтаж»/«Статьи» в шапке и «Каталог»/«Статьи» в футере — в коде фронта).
- ЛК: `/account` (приветствие + выход из мок-сессии), `/account/*` (profile, orders, garage, favorites, addresses — заглушки, макетов нет).
- Шиномонтаж (booking): `/booking` (время) → `/booking/services` → `/booking/details` → `/booking/code` → `/booking/success` — поток на живом API. Состояния «код устарел» и «время занято» — состояния шага 4, не роуты; прямой заход на шаги 2–4 без времени уводит на `/booking`. Вход — пункт «Шиномонтаж» в шапке. Макет-эталон — `.template/booking/` (11 страниц, «Мои записи» в `my/` — раздел не портирован: публичного API нет).
- `lang="ru"` в layout (в мокапе `lang="en"` — артефакт, не воспроизводить).

## Данные и состояние

- `src/data/` — моки, имитирующие ответы бэка: `nav.ts` (телефоны, меню-каталог, соцсети), `products.ts` (`HOME_DATA` главной — `/api/service-page/main`), `cart.ts` (бенефиты корзины), `checkout.ts` (способы доставки/оплаты). Товарных моков нет — карточка на живом API; стартовая `/catalog` — бренды из живых фасетов, карточки «по параметрам/автомобилю» — статика фронта (`CATALOG_START_CARDS` в `shared/api/catalog.ts`).
- Доступ — только через `shared/api/data.ts` (async с setTimeout; при API — замена на fetch + `rewrites()`). Детали контрактов: память `home-api-main`, `phase-4-checkout-auth-articles`.
- **Единственный источник истины по маршрутам API** — `../backend/documentations/scramble/public-api.json` (Scramble-экспорт бэка). При подключении API контракты фронта сверять с ним, не с моками `src/data/`. Товарные эндпоинты (`/catalog/tires|wheels/...`) и `/reference/store` — в экспорте (сверено 23.10.2026).
- **Бэк подключён частично:** rewrites `/api/*` → бэк (`next.config.ts`, `BACKEND_URL`, дефолт `http://imsd-backend-nginx`), `apiBase()` в `shared/api/base.ts` (браузер → `/api`, сервер → прямой URL). Опции фильтра шин — живой `GET /api/reference/filter/tire` (адаптер `toFilterOptions` в `shared/api/catalog.ts`); каталог, стартовая `/catalog` (бренды из фасетов) и запись на шиномонтаж (`shared/api/booking.ts`) — живые; подбор шин и дисков по автомобилю (`shared/api/vehicle.ts`: справочники Vehicle + `by-vehicle`) — живой; карточки шин и дисков (`shared/api/product.ts`) и настройки витрины (`GET /api/reference/store`) — живые; статьи, меню и системные страницы (`shared/api/articles.ts`, `shared/api/nav.ts`) — живые; остальные данные — на моках. Кэширование — на бэке, фронт не кэширует. Долги бэка по контракту (brand/country → slug, diameter → `r15`, пустые delivery/tireType) — память `api-connection-state`.
- **Баджей** — общее правило: если в `data` ответа пришёл объект `badges`, страница выводит плашки шаблона (полоса `.benefits` > `.benefit benefit--{red|gold|green}` + иконка + текст + ссылка). Ядро: `shared/types/badge.ts`, чистая функция `shared/ui/badgeView.ts`, компонент `shared/ui/Badge.tsx` (ADR 0008). Зоны: карточка товара, главная, листинг шин и дисков, подбор по авто, карточка модели (план `badges-zones-front.md`); бэк отдаёт `badges` во всех зонах витрины — ТЗ `documentations/tz/badges-zones-backend.md`.
- **Блок статьи** — общее правило: если в корне ответа пришёл объект `article` (`{ body }` — HTML RichEditor), страница выводит его текст (`.article-content.article-block`). Ядро: `shared/types/articleBlock.ts`, адаптер `shared/lib/articleBlock.ts`, компонент `shared/ui/ArticleBlock.tsx`. Зоны: каталоги шин и дисков, подбор шин и дисков (уровень результата), модель шин, карточки шин и дисков (план `article-block-zones.md`). Бэк поле ещё не отдаёт — мок `src/data/articleBlock.ts` работает только в dev; ТЗ `documentations/tz/article-block-backend.md`.
- `src/stores/` — Zustand только для UI: `useUIStore` (город, попапы, меню). Корзина и сессия — React Query + localStorage (ключи `cart`, `orders`, `session`).
- Кастомные дополнения к style.css (макетов нет: пустая корзина, страницы заказа/статуса, ЛК, слайдер главной, фиксы меню, сбросы button-семантизации) — в конце `src/app/style.css` с пометкой даты.
- Стили домена booking (классы `.booking-*`, `.step*`, `.calendar*`, `.time-chip`, `.code-*`, `.service-checkbox`, `.param-chip`, `.status-badge`, `.alert`) — в конце `src/app/style.css` с пометкой 30.09.2026. Стили раздела «Мои записи» (`my/*`: `.booking-card*`, `.booking-list-empty`) остаются в `.template/assets/css/style.css` до порта раздела.

## Решения (ADR)

| № | Решение | Статус | Дата |
|---|---------|--------|------|
| 0001 | Баррел `shared/api/data.ts` как точка подключения API | Accepted | 2026-08-07 |
| 0002 | Конфиг-грамматика URL каталога (`parseParams.ts`) | Accepted | 2026-08-07 (обн. 21.08) |
| 0003 | Пагинация типоразмеров модели: диаметр в URL + «Показать ещё» | Accepted | 2026-08-12 |
| 0004 | Город как контекст запроса: city в URL, резолв бэком | Accepted | 2026-08-14 (обн. 21.08) |
| 0005 | Черновик записи на шиномонтаж — в sessionStorage, в URL только шаг | Accepted | 2026-09-30 |
| 0006 | Приложение поднимает свой сервер Next и слушает unix-сокет панели | Accepted | 2026-10-06 |
| 0007 | Адреса карточек товара зеркалят API: слаг позиции, у дисков без модельного сегмента | Accepted | 2026-10-22 |
| 0008 | Бейдж — общий объект фронта: тип + представление + компонент, разметка плашки шаблона | Accepted | 2026-10-23 |
| 0009 | Статьи и системные страницы — одна сущность Article, URL не сливаются | Accepted | 2026-11-05 |
| 0010 | Блок статьи — общий объект фронта: `article` в корне ответа, HTML как есть | Accepted | 2026-11-07 |

Файлы — в `documentations/adr/` (правила записи — глобальный `adr.md`).

## Формат slug

- Бренды — транслит строчными через дефис: `bmw`, `michelin`, `nokian-tyres`
- Модели — как в данных: `viatti-strada-2`
- Типоразмеры — `185-60-r15-84h`

<!-- setup-llm-wiki:start -->
## LLM Wiki
- Индекс знаний проекта: .llm-wiki/wiki/index.md
- Wiki обновляется только через скил .claude/skills/llm-wiki/SKILL.md (Ingest workflow)
- Правила синхронизации: .claude/rules/wiki-sync.md, базовые правила: .claude/rules/base.md
- Команды: /ship-wiki — коммит с обязательным обновлением wiki; /ship — без wiki
<!-- setup-llm-wiki:end -->
