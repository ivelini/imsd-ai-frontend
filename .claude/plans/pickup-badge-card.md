# Плашка «Самовывоз» в карточке товара: дата и текст выдачи из `origin`

## Цель

Бэк добавил в листинги шин (`GET /api/catalog/tires`, контракт `public-api.json`
от 15.10.2026) плашку `origin.delivery_days_after_order = {badge, description}`:
`badge` — дата словами («10 Окт (Сб)»), `description` — HTML-текст выдачи в городе
(у города по умолчанию — самовывоз из офиса). Сейчас строка «Самовывоз» в карточке
каталога — захардкоженная дата «8 авг (сб)» без попапа (`.template`). Надо отдавать
её из API по аналогии с «Производитель»: badge + попап с описанием.

## Вход / процесс / выход

- **Вход:** `origin.delivery_days_after_order {badge, description}` в DTO листинга.
- **Процесс:** тип DTO → адаптер `toTireProduct` (через существующий `toOriginParam`,
  как vendor/country/year) → поле `pickup: ProductParam | null` на `ProductBase` →
  строка `.pickup` в `ProductCard` рендерит `BadgeValue` (ParamBadge с попапом,
  без `description` — сухой `p-badge`).
- **Выход:** карточка каталога показывает живую дату самовывоза и текст выдачи
  города в попапе; нет плашки у бэка (`null`) — строка скрывается.

## Схема

```
┌─ ТРИГГЕР ───────────────────────────────────────────────────┐
│  GET /catalog/tires/... — страница каталога (Server Component)│
└───────────────────────────┬─────────────────────────────────┘
                            │ server render
                            ▼
┌─ ПРИЛОЖЕНИЕ ────────────────────────────────────────────────┐
│  [app]  catalog/tires/[[...params]]/page.tsx                │
│       │ getCatalogProducts(filter, city)                    │
│       ▼                                                     │
│  [api]  shared/api/catalog.ts · toTireProduct(dto)          │
│       │ toOriginParam("Самовывоз", origin.delivery_days_…)  │
│       ▼  pickup: ProductParam | null (name/value/desc)      │
│  [ui]   ProductCard · блок .catalog-product-location-info   │
│       │ <p class="pickup">{name} <BadgeValue …/>            │
│       ▼                                                     │
│  [ui]   shared/ui/BadgeValue → ParamBadge (попап)           │
└───────┬─────────────────────────────────────────────────────┘
        │ fetch (rewrites /api/* → бэк)
        ▼
┌─ ВНЕШНИЙ МИР ───────────────────────────────────────────────┐
│  GET /api/catalog/tires                                     │
│  origin.delivery_days_after_order {badge, description}      │
└───────┬─────────────────────────────────────────────────────┘
        ▼
┌─ ДАННЫЕ ────────────────────────────────────────────────────┐
│  Моки (шаблоны без API): src/data/catalog.ts, wheels.ts —   │
│  pickup задаётся так же: мок имитирует ответ бэка           │
└─────────────────────────────────────────────────────────────┘
```

## Задачи

1. `src/features/catalog/types/index.ts` — `TireOrigin` + ключ
   `delivery_days_after_order: TireOriginItem | null`; `ProductBase` +
   `pickup: ProductParam | null` (обязательное — все производители объявляют явно).
2. `src/shared/api/catalog.ts` — в `toTireProduct`: `pickup: toOriginParam("Самовывоз",
   dto.origin?.delivery_days_after_order)`.
3. `src/shared/ui/BadgeValue.tsx` — новый: `description` есть → `ParamBadge`,
   нет → `<span class="p-badge">` (третья копия этой развилки — правило трёх).
4. `src/features/catalog/components/ProductCard.tsx` — параметры и строка `.pickup`
   через `BadgeValue`; строка рендерится из `product.pickup`, дата «8 авг» из вёрстки уходит.
5. `src/features/product/components/ProductDetails.tsx` — параметры через `BadgeValue`
   (та же развилка, вторая копия — снимаем).
6. `src/data/catalog.ts` — мок-константа плашки самовывоза (дата «8 авг (сб)» + текст
   выдачи из офиса) в фабрику шин; `src/data/wheels.ts` — та же константа в фабрику дисков.
7. `tests/unit/catalogListAdapter.test.ts` — тесты ниже; в `baseDto` добавить ключ
   `delivery_days_after_order`.

Вне области: страница товара (`/tires/[modelSlug]/[sizeSlug]` — другой эндпоинт,
`PRODUCT_STATIC`), строка «Доставка до ПВЗ» (данных в контракте нет).

## Тест-лист

── toTireProduct: плашка «Самовывоз» из origin ─────────────────

Тест 1
1. Поведение: плашка самовывоза едет из `origin.delivery_days_after_order` в отдельное
   поле `pickup` и НЕ попадает в `parameters` (в параметрах остаются три записи origin);
   реализация, склеивающая её с parameters, тест завалит
2. Вход: baseDto с `origin.delivery_days_after_order = {badge: "10 Окт (Сб)",
   description: "Самовывоз осуществляется из центрального офиса"}`
3. Ожидание: `p.pickup` == `{name: "Самовывоз", value: "10 Окт (Сб)", badge: true,
   description: {title: "10 Окт (Сб)", text: "Самовывоз осуществляется из центрального офиса"}}`;
   `p.parameters` — длина 3
4. Имя: test_product_maps_pickup_badge_from_origin

Тест 2
1. Поведение: `description` плашки `null` (у города нет точки выдачи) — плашка остаётся,
   попапа нет; `pickup.description` undefined, значение — дата
2. Вход: baseDto, `origin.delivery_days_after_order = {badge: "10 Окт (Сб)", description: null}`
3. Ожидание: `p.pickup.value === "10 Окт (Сб)"`, `p.pickup.description === undefined`
4. Имя: test_product_pickup_without_description_renders_badge_only

Тест 3
1. Поведение: нет плашки у бэка (ключ `null`) или нет `origin` вовсе — `pickup === null`,
   карточка строку «Самовывоз» не рисует
2. Вход: baseDto с `delivery_days_after_order: null`; второй случай — `origin: null`
3. Ожидание: `p.pickup === null` в обоих случаях
4. Имя: test_product_pickup_null_without_badge

## Прогоны

- **Красный** (`npm test`): `Tests 3 failed | 12 passed (15)` — падают ровно новые тесты
  (`p.pickup` — undefined, адаптера нет).
- **Зелёный**: `npm test` — 13 файлов, **80 passed**; `tsc --noEmit` — чисто;
  `eslint` — 0 ошибок (15 прежних предупреждений).
- **Живой прогон** (playwright, dev-контейнер :30034, ошибок в консоли нет):
  - шины `/catalog/tires?city=chelyabinsk` (живой API): «Самовывоз 17 Окт (Сб) »,
    попап — «Самовывоз осуществляется из центрального офиса / Адрес: Свердловский тракт 3Н…»;
  - диски `/catalog/wheels` (мок): «Самовывоз 8 авг (сб) », попап мок-текста;
  - страница товара `/tires/viatti-strada-2/185-55-r15-84h`: 12 параметров, попап
    «Производитель» (Viatti) открывается — замена на `BadgeValue` не сломала.

## Ожидаемый результат

- Карточка каталога: «Самовывоз 10 Окт (Сб) » — дата из API, попап с текстом выдачи города.
- Мок-страницы (диски, автоподбор, модель) сохраняют строку — плашка из мока.
- `parameters` и строка самовывоза рендерятся одним компонентом `BadgeValue`
  (копий развилки «с описанием / без» больше нет).
