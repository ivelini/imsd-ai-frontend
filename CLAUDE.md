@AGENTS.md

# CLAUDE.md

## Что это

Интернет-магазин шин и дисков (aalyans.ru), два слоя:

1. **`src/` — Next.js 16 приложение** (App Router, TypeScript, Turbopack, `@/*`-алиас, Zustand 5). UI переносится из мокапа. Код: `src/app/` (роутинг), `src/features/` (домены), `src/shared/` (ядро), `src/data/` (моки), `src/stores/` (Zustand).
2. **`.template/` — статичный HTML-мокап дизайна** (эталон вёрстки). 27 страниц, стили в `assets/css/style.css` (база 4701 строка + блоки доменов ниже), BEM-подобные классы, без JavaScript. Страницы витрины друг на друга не ссылаются; страницы домена `booking/` связаны сквозным потоком (степпер, CTA, крошки).

Соседние проекты: `admin/` (React SPA), `backend/` (Laravel, владеет бизнес-логикой; API позже).

## Правила

- Перенос вёрстки: **`.claude/rules/ui-porting.md`**
- Архитектура frontend: **`.claude/rules/frontend-architecture.md`**

## Команды

- `npm run dev` / `npm run build` / `npm run lint` — Next.js; `npm test` — Vitest (unit, `tests/unit/`)
- **Dev-сервер — через Docker** (`make up`, порт 30034). Образ кастомный (`docker/frontend/Dockerfile`, `USER node` uid 1000 = хост-пользователь), поэтому `.next`/`node_modules` принадлежат uid 1000 и локальный `npm run build` работает. Не запускать build/`npm run dev` одновременно с dev-контейнером — общий `.next` (кэш turbopack повреждается).
- Мокап: открыть `.html` в `.template/` или `python3 -m http.server 8765`
- Выкладка: пуш в `master` → `.github/workflows/deploy.yml` (проверки → сборка на раннере → релиз на сервере → `pm2 restart aalyans74.ru`). Настройки, откат и диагностика — `documentations/operations.md`. Прод-приложение запускается `npm start` = `node server.mjs` (кастомный сервер Next: панель отдаёт адрес unix-сокета в `SOCKET` — `next start` сокет не умеет).
- Верификация мокапа: `node .claude/verify/verify.mjs` (скриншоты 5 разрешений × 27 страниц) и `node .claude/verify/check-all.mjs` (переполнения/битые картинки/битые ссылки). Требуют `playwright` — в `devDependencies` проекта его нет (запускались через временную установку в `/tmp` + симлинк в `node_modules`).

## Схема роутов

- Каталог шин: `/catalog/tires/[[...params]]` — сегменты `season/brand/width/profile/rN` (C-размеры: `r13c`) + query (`price_min`, `price_max`, `delivery[]`, `studded`, `page`).
- Подбор по авто: `/catalog/tires/auto/[[...auto]]` — каскад марка→модель→год→модификация → результат с парами.
- Модель/товар: `/tires/[modelSlug]`, `/tires/[modelSlug]/[sizeSlug]` (типоразмер: `185-60-r15-84h`).
- Диски: `/catalog/wheels` (заглушка, шаблона нет).
- Сервисные: `/cart`, `/checkout`, `/order/[id]` (клиентская — заказ в localStorage-моке), `/order-status`, `/auth/login|register`, `/articles`, `/articles/[id]`.
- Сервисные страницы: `/service-page/[slug]` — контент по `GET /api/service_page/<slug>`; ссылки шапки/футера — из `GET /api/service_pages` (мок `servicePages.ts`).
- ЛК: `/account` (приветствие + выход из мок-сессии), `/account/*` (profile, orders, garage, favorites, addresses — заглушки, макетов нет).
- Шиномонтаж (booking): `/booking` (время) → `/booking/services` → `/booking/details` → `/booking/code` → `/booking/success` — поток на живом API. Состояния «код устарел» и «время занято» — состояния шага 4, не роуты; прямой заход на шаги 2–4 без времени уводит на `/booking`. Вход — пункт «Шиномонтаж» в шапке. Макет-эталон — `.template/booking/` (11 страниц, «Мои записи» в `my/` — раздел не портирован: публичного API нет).
- `lang="ru"` в layout (в мокапе `lang="en"` — артефакт, не воспроизводить).

## Данные и состояние

- `src/data/` — моки, имитирующие ответы бэка: `geo.ts` (88 городов), `nav.ts` (телефоны, меню-каталог, соцсети), `servicePages.ts` (`/api/service_pages` + `/api/service_page/<slug>`, 10 страниц), `products.ts` (`/api/service-page/main` — attention_blocks, slider, news, description, seo), `catalog.ts` (типоразмеры, опции фильтра, авто-словарь BMW, пары, SEO), `articles.ts` (9 статей), `cart.ts` (бенефиты корзины), `checkout.ts` (способы доставки/оплаты).
- Доступ — только через `shared/api/data.ts` (async с setTimeout; при API — замена на fetch + `rewrites()`). Детали контрактов: память `home-api-main`, `phase-4-checkout-auth-articles`.
- **Единственный источник истины по маршрутам API** — `../backend/documentations/scramble/public-api.json` (Scramble-экспорт бэка). При подключении API контракты фронта сверять с ним, не с моками `src/data/`.
- **Бэк подключён частично:** rewrites `/api/*` → бэк (`next.config.ts`, `BACKEND_URL`, дефолт `http://imsd-backend-nginx`), `apiBase()` в `shared/api/base.ts` (браузер → `/api`, сервер → прямой URL). Опции фильтра шин — живой `GET /api/reference/filter/tire` (адаптер `toFilterOptions` в `shared/api/catalog.ts`); каталог и запись на шиномонтаж (`shared/api/booking.ts`) — живые; остальные данные — на моках. Кэширование — на бэке, фронт не кэширует. Долги бэка по контракту (brand/country → slug, diameter → `r15`, пустые delivery/tireType) — память `api-connection-state`.
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
