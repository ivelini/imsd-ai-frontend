# Модель дисков на живом API и адреса карточек дисков с модельным сегментом (2026-11-11)

> Source: Код — `src/shared/api/catalog.ts`, `src/features/catalog/{types,lib,components}`, `src/app/wheels/[brandSlug]/[modelSlug]/{page.tsx,[sizeSlug]/page.tsx}`, `src/app/tires/[brandSlug]/[modelSlug]/{page.tsx,[sizeSlug]/page.tsx}`, тесты `tests/unit/{modelCardAdapter,modelDiameters,productUrl,wheelListAdapter}.test.ts`; план `.claude/plans/wheel-models-live.md`; ADR 0011 (заменяет 0007 в части дисков); контракт бэка `GET /api/catalog/wheel-models/{brand}/{model}` (Scramble, сводка бэка 2026-11-10)
> Collected: 2026-11-11
> Published: 2026-11-11

## Проблема

У дисков появилась карточка модели — паритет с шинами: бэк добавил
`GET /api/catalog/wheel-models/{brand}/{model}` (диаметры со счётчиками по правилам
листинга, характеристики «Тип/Цвет/Страна», картинка, описание, SEO, баджи) и фильтр
`model` в листинге/фасетах. Свободного места под страницу модели рядом с карточкой диска
не было: обе формы занимали один уровень пути. Каталог не проиндексирован — адреса можно
менять без редиректов.

## Решение по адресам

Адреса дисков стали зеркалом шин:

- модель — `/wheels/{brand}/{model}`;
- карточка — `/wheels/{brand}/{model}/{size}`.

Модельный сегмент — декоративный: API карточки диска модели не принимает
(`/api/catalog/wheels/{brand}/{size}`), фронт передаёт в запрос только бренд и позицию.
У диска без модели сегмент `-` (как у шины). Старые адреса карточек без редиректов:
каталог не проиндексирован, все ссылки строит `productUrl`. Решение — ADR 0011; ADR 0007
помечен Superseded в части дисков, адреса шин действуют.

## Обобщение API и адаптеров

- `ModelCardInput { category, brandSlug, modelSlug, city? }`, `ModelCardResult`;
  `MODEL_CARD_SEGMENTS { tires: "tire-models", wheels: "wheel-models" }`.
- `toModelCard(dto)` — общий адаптер: диаметры бэка (`"16"`) → r-ключи вкладок (`r16`),
  картинка `image_url ?? PRODUCT_PLACEHOLDER`, баджи как есть.
- `modelCardPath(input)` → путь карточки модели с `city`; `getModelCard(input)` — 404 → null
  (страница отдаёт `notFound`), `article` — через `toArticleBlock`.
- `modelSizesUrl(input)` — листинг категории `model&brand&diameter[]&city&per_page=100`;
  `getModelSizes(input)` — маппинг через `toTireProduct`/`toWheelProduct`.
- Старые `getTireModel`/`getTireModelSizes`/`toModelSizesQuery`/`toTireModel` заменены
  общими; типы `TireModel*` переименованы в `ModelCardDto/ResponseDto/Data`.
- `activeDiameter(diameters, requested)` — общий выбор вкладки (запрошенный, иначе первый).
- `productUrl` для дисков теперь трёхсегментный; новые `modelUrl` и `modelCrumb` (крошка
  модели в карточках шин и дисков) в `features/catalog/lib/productUrl.ts`.

## Страница модели дисков

`src/app/wheels/[brandSlug]/[modelSlug]/page.tsx` — серверный компонент по образцу модели
шин: `Badges` → `h2 «Диски {бренд} {модель}»` → `ModelDescription` (картинка, Тип/Цвет/Страна,
HTML-описание, блок статьи) → `ModelSizes` (вкладки диаметров, карточки размеров активного
диаметра). SEO — `meta.seo` бэка, fallback `Диски {бренд} {модель}`; активный диаметр —
`?diameter=r16`; размеры — живой листинг с фильтрами `model`+`brand`. `ModelSizes` принимает
`ProductBase[]` (шины и диски).

## Найденные и исправленные ошибки (смоук)

- `modelUrl` и `toWheelProduct` срезали префикс бренда с **канонического короткого** слага
  модели: у LS `ls-367` → `367` (крошка вела на `/wheels/ls/367`, карточки модели — на
  несуществующий адрес). Исправлено: слаги адаптеров не срезаются; тесты
  `test_model_url_by_category` и `wheelListAdapter` обновлены.
- Старый двухсегментный адрес диска теперь 404 — ожидаемо, редиректов нет.

## Проверка

- Красный прогон: 4 файла / 12 тестов падали (импорты новых функций, новые адреса).
- Зелёный: 28 файлов / 162 теста; `npm run lint` — 0 ошибок (4 прежних warning);
  `npx tsc --noEmit` — чисто (после `npx next typegen` — перегенерация типов маршрутов
  после переезда карточки).
- Смоук в dev: `/wheels/ls/ls-367` — 200; `/wheels/ls/ls-367/disk-…` — 200; ссылки листинга
  и крошки трёхсегментные; модель/карточка шин — 200; старый адрес — 404.
