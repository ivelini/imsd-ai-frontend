@AGENTS.md

# CLAUDE.md

## Что это

Интернет-магазин шин и дисков (aalyans.ru), два слоя:

1. **`src/` — Next.js 16 приложение** (App Router, TypeScript, Turbopack, `@/*`-алиас, Zustand 5). UI переносится из мокапа. Код: `src/app/` (роутинг), `src/features/` (домены), `src/shared/` (ядро), `src/data/` (моки), `src/stores/` (Zustand).
2. **`.template/` — статичный HTML-мокап дизайна** (эталон вёрстки). 16 страниц, стили в `assets/css/style.css` (4611 строк), BEM-подобные классы, без JavaScript. Страницы не ссылаются друг на друга.

Соседние проекты: `admin/` (React SPA), `backend/` (Laravel, владеет бизнес-логикой; API позже).

## Правила

- Перенос вёрстки: **`.claude/rules/ui-porting.md`**
- Архитектура frontend: **`.claude/rules/frontend-architecture.md`**
- План переноса: **`.claude/plans/module-split.md`** (~25 модулей, фазы 0–5)

## Команды

- `npm run dev` / `npm run build` / `npm run lint` — Next.js
- **Dev-сервер — через Docker** (`make up`, порт 30034). Образ кастомный (`docker/frontend/Dockerfile`, `USER node` uid 1000 = хост-пользователь), поэтому `.next`/`node_modules` принадлежат uid 1000 и локальный `npm run build` работает. Не запускать build/`npm run dev` одновременно с dev-контейнером — общий `.next` (кэш turbopack повреждается).
- Мокап: открыть `.html` в `.template/` или `python3 -m http.server 8765`
- Верификация мокапа: `node .claude/verify/verify.mjs` (скриншоты 5 разрешений × 16 страниц) и `node .claude/verify/check-all.mjs` (переполнения/битые картинки)

## Схема роутов

- Каталог шин: `/catalog/tires/[[...params]]` — сегменты `season/brand/width/profile/rN` + query (`price_min`, `price_max`, `delivery[]`, `page`). `force-static` (убрать при подключении API).
- Подбор по авто: `/catalog/tires/auto/[[...auto]]` — каскад марка→модель→год→модификация → результат с парами.
- Модель/товар: `/tires/[modelSlug]`, `/tires/[modelSlug]/[sizeSlug]` (типоразмер: `185-60-r15-84h`).
- Диски: `/catalog/wheels` (заглушка, шаблона нет).
- Сервисные: `/cart`, `/checkout`, `/order/[id]`, `/order-status`, `/auth/login|register`, `/articles`, `/articles/[id]`.
- ЛК: `/account/*` (profile, orders, garage, favorites, addresses — макетов нет).
- `lang="ru"` в layout (в мокапе `lang="en"` — артефакт, не воспроизводить).

## Данные и состояние

- `src/data/` — моки: `geo.ts` (88 городов), `nav.ts` (меню/подвал), `products.ts` (главная), `catalog.ts` (типоразмеры, опции фильтра, авто-словарь BMW, пары, SEO).
- `src/stores/` — Zustand: `useUIStore` (город/попапы/меню), `useCartStore` (items, count, totals).

## Формат slug

- Бренды — транслит строчными через дефис: `bmw`, `michelin`, `nokian-tyres`
- Модели — как в данных: `viatti-strada-2`
- Типоразмеры — `185-60-r15-84h`
