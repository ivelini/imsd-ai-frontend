# «Доставка до ПВЗ» в карточке каталога: значение и попап из origin.pick_up

## Цель

В карточке каталога шин строка «Доставка до ПВЗ» сейчас захардкожена
(`<span class="p-badge">бесплатно ></span>` без попапа, ProductCard.tsx:77). Бэк добавил
в листинг `origin.pick_up.pick_up_point = {badge, description}`; строка должна брать
значение оттуда — как «Производитель» и «Самовывоз»: badge + попап с описанием.

## Вход / процесс / выход

- **Вход:** `origin.pick_up = { pick_up_point: { badge, description|null } } | null`
  в DTO `GET /catalog/tires` (контракт public-api.json 15.10.2026, required; живой бэк:
  badge «бесплатно», description с переносами `\n`).
- **Процесс:** тип DTO → `toOriginParam("Доставка до ПВЗ", dto.origin?.pick_up?.pick_up_point)`
  → поле `pvzDelivery: ProductParam | null` на `ProductBase` → строка `.free-shipping`
  в `ProductCard` рендерит `{name} <BadgeValue/>` (c описанием — ParamBadge с попапом).
- **Выход:** карточка показывает значение и попап от бэка; `pick_up` нет — строки нет
  (сейчас строка есть всегда с хардкодом).

## Схема

```
┌─ ТРИГГЕР ───────────────────────────────────────────────────┐
│  GET /catalog/tires/… — страница каталога (Server Component)│
└───────────────────────────┬─────────────────────────────────┘
                            │ server render
                            ▼
┌─ ПРИЛОЖЕНИЕ ────────────────────────────────────────────────┐
│  [app]  catalog/tires/[[...params]]/page.tsx                │
│       │ getCatalogProducts(filter, city)                    │
│       ▼                                                     │
│  [api]  shared/api/catalog.ts · toTireProduct(dto)          │
│       │ toOriginParam("Доставка до ПВЗ",                    │
│       │               origin.pick_up?.pick_up_point)        │
│       ▼  pvzDelivery: ProductParam | null (name/value/desc) │
│  [ui]   ProductCard · строка .free-shipping                 │
│       │ {name} <BadgeValue label description/>              │
│       ▼                                                     │
│  [ui]   shared/ui/BadgeValue → ParamBadge (попап)           │
└───────┬─────────────────────────────────────────────────────┘
        │ fetch /api/catalog/tires (rewrites → бэк)
        ▼
┌─ ВНЕШНИЙ МИР ───────────────────────────────────────────────┐
│  GET /api/catalog/tires → origin.pick_up                    │
│  {pick_up_point: {badge: "бесплатно", description: "\n…"}}  │
└───────┬─────────────────────────────────────────────────────┘
        ▼
┌─ ДАННЫЕ ────────────────────────────────────────────────────┐
│  Моки (шины/диски): PVZ_BADGE в фабриках — как PICKUP_BADGE │
│  (имитируют ответ бэка, контракт тот же)                    │
└─────────────────────────────────────────────────────────────┘
```

## Задачи

1. `src/features/catalog/types/index.ts` — `TireOrigin` + ключ
   `pick_up: { pick_up_point: TireOriginItem } | null`; `ProductBase` + обязательное
   `pvzDelivery: ProductParam | null` (как `pickup`).
2. `src/shared/api/catalog.ts` — в `toTireProduct`:
   `pvzDelivery: toOriginParam("Доставка до ПВЗ", dto.origin?.pick_up?.pick_up_point)`.
3. `src/features/catalog/components/ProductCard.tsx` — строка `.free-shipping`
   рендерится из `product.pvzDelivery` (хардкод «бесплатно» уходит).
4. `src/data/catalog.ts` — `PVZ_BADGE` (name «Доставка до ПВЗ», текст бэка) в фабрику
   шин; `src/data/wheels.ts` — та же константа в фабрику дисков (импорт из ./catalog).
   Мок имитирует ответ бэка после правки HTML-отдачи: переносы — тегами `<br>`
   (как `PICKUP_BADGE`).
5. `tests/unit/catalogListAdapter.test.ts` — тесты ниже; в `baseDto` и частичную
   фикстуру origin добавить ключ `pick_up`.
6. `src/app/style.css` — `white-space: pre-line` НЕ добавляется: решено, что описания
   попапов бэк отдаёт готовым HTML (`ParamBadge` уже рендерит разметку). Переносы
   сейчас теряются, потому что бэк шлёт `\n` (`PickUpTextBuilder`: cityText — implode
   `\n`; тексты настроек ПВЗ — как есть) — правка передана отдельной задачей в бэкенд
   (cityText → `<br>` с `e()`, настройки → `nl2br`). До неё попапы показывают текст
   одной строкой — это ожидаемо.

Вне области: страница товара (`AddToCartBlock` — своя строка «Доставка до ПВЗ» из
PRODUCT_STATIC-мока), листинг дисков (на моках).

## Тест-лист

── toTireProduct: плашка «Доставка до ПВЗ» из pick_up ──────────

Тест 1
1. Поведение: значение и описание едут из `origin.pick_up.pick_up_point` в отдельное
   поле `pvzDelivery` и НЕ попадают в `parameters` (там по-прежнему три записи origin)
2. Вход: baseDto с `pick_up = {pick_up_point: {badge: "бесплатно",
   description: "Доставка осуществляется, по согласованию с заказчиком"}}`
3. Ожидание: `p.pvzDelivery` == `{name: "Доставка до ПВЗ", value: "бесплатно",
   badge: true, description: {title: "бесплатно", text: "Доставка осуществляется…"}}`;
   `p.parameters` — длина 3
4. Имя: test_product_maps_pvz_delivery_from_pick_up

Тест 2
1. Поведение: `description` плашки `null` — плашка остаётся, попапа нет
2. Вход: baseDto, `pick_up = {pick_up_point: {badge: "бесплатно", description: null}}`
3. Ожидание: `p.pvzDelivery.value === "бесплатно"`, `p.pvzDelivery.description === undefined`
4. Имя: test_product_pvz_delivery_without_description_renders_badge_only

Тест 3
1. Поведение: `pick_up` нет (`null`) — `pvzDelivery === null`, карточка строку
   «Доставка до ПВЗ» не рисует
2. Вход: baseDto с `origin.pick_up: null`
3. Ожидание: `p.pvzDelivery === null`
4. Имя: test_product_pvz_delivery_null_without_pick_up

## Прогоны

- **Красный**: `npm test` — 3 failed | 80 passed (83) — падают ровно новые тесты
  (`pvzDelivery` undefined у всех трёх).
- **Зелёный**: `npm test` — 83 passed (13 файлов); `tsc --noEmit` чисто; `eslint`
  0 ошибок (15 прежних предупреждений).
- **Живой прогон** (playwright, dev-контейнер :30034, ошибок консоли нет):
  - шины `/catalog/tires?city=chelyabinsk` (живой API): строка «Доставка до ПВЗ
    бесплатно >», попап открывается с текстом от бэка; переносы пока `\n` — текст
    одной строкой (правка HTML-отдачи — задача бэкенда, до неё так и должно быть);
  - диски `/catalog/wheels` (мок): та же строка, попап мока — с `<br>`, рисуется
    в несколько строк (как будет у шин после правки бэка).

## Ожидаемый результат

- Карточка каталога: «Доставка до ПВЗ бесплатно » — значение из API, по клику попап
  с текстом доставки (переносы строк сохраняются).
- Мок-страницы (диски) показывают ту же строку из мока.
- Мелкие решения: имя поля `pvzDelivery` / константа `PVZ_BADGE`; тип терпит
  `pick_up: null` (контракт объявляет non-null — фронт не падает на пустом значении).
