# Каталог дисков на живом API (/catalog/wheels)

Статус: черновик (итерация 1) — развилки на согласовании.

## Цель

Листинг и фильтр каталога дисков сейчас на моках (`data/wheels.ts`), хотя у бэка есть
оба эндпоинта: `GET /api/catalog/wheels` и `GET /api/reference/filter/wheel` (контракт
public-api.json). Перевести на живой API по образцу шин (21.08.2026).

## Что выяснено (факты)

- Листинг: `data[]` (id/name/slug/brand/model/width «7.0»/diameter 16/pcd «4*100»/et
  «40.0»/hub_diameter «73.1»/type {label, value}|null/color/price/old_price/promotion/
  count_in_stock/origin (как у шин: vendor, manufacture_country, manufacture_year,
  delivery_days_after_order, pick_up)/images) + `meta.seo {title, description}`.
- Фильтр: width/diameter/pcd/et/hub_diameter/type (enum alloy|steel|forged)/color/
  brand/country/delivery/price — {label, value} (диаметры/ширины — числа, метки от бэка).
- **Формат decimal не мешает**: бэк нормализует вход `normalizeDecimal`
  (`number_format(...,1)`) — `et=40`, `width=7`, `hub_diameter=73.1` матчатся с БД
  («40.0»). `FilterState.et/hubBore` остаются числами.
- URL-грамматика дисков уже есть (`WHEELS_CONFIG`): сегменты `r15/7/brand`, query
  pcd/et/hub_bore/wheel_type + общие. Значения селектов: диаметр — `r15` (нормализуем
  из integer-фасета), ширина — int («7.0» → «7»), et/hub — числа; type — значение станет
  `alloy|steel|forged` (было litoy/kovanyy/shtampovannyy).
- У карточки дисков **нет страницы товара** (`/wheels/[modelSlug]/[sizeSlug]` не
  существует) — ссылки карточек сейчас ведут в 404.
- У дисков **нет кода товара** в контракте (ean отсутствует) — строка «Код товара:».
- h2 страницы захардкожен («Диски в Челябинске»), у шин — из `meta.seo` (+generateMetadata).
- Авто-подбор дисков (`/catalog/wheels/auto`) — каскад и результат на моках; эндпоинтов
  подбора у бэка нет — остаётся как есть (сайдбар фильтра там станет живым автоматически).

## Решения к подтверждению

1. **Ссылки карточек дисков — скрыть** (`showLink={false}`): страницы товара нет,
   ссылка ведёт в 404. Альтернатива — оставить как есть (не рекомендую).
2. **«Код товара» — строка скрывается при пустом значении** (`{product.ean && …}`):
   у дисков кода в контракте нет. Шины не затрагивает (у них код есть).
3. **Метки фасетов — как отдаёт бэк** («7.0», «40.0», «15»; правило api-contract: label
   с бэка). Если нужен вид макета («7J», «ET40», «R15») — просить у бэка готовые labels.
   Значения нормализуем под URL/селекты (diameter → `r15`, width → «7»).
4. **Вне области**: авто-подбор дисков (мок), цвет (бэк фильтрует — фасета в UI нет),
   `promotion`, сортировка по цене (`sort_by`), страница товара дисков.

## План / схема

```
┌─ /catalog/wheels/[[...params]] — страница (Server Component) ─┐
│      │ Promise.all                                            │
│      ├── getWheelsFilters()   → /api/reference/filter/wheel   │
│      ├── getWheelsProducts()  → /api/catalog/wheels           │
│      └── getGeo()             → /api/reference/city (уже живой)│
│      ▼                                                        │
│  [api] toWheelFilterOptions · toWheelListQuery · toWheelProduct│
│      ▼                                                        │
│  [ui]  CatalogFilter category="wheels" · ProductCard          │
└──────┬────────────────────────────────────────────────────────┘
       │ fetch (rewrites /api/* → бэк)
       ▼
┌─ ВНЕШНИЙ МИР ─────────────────────────────────────────────────┐
│  GET /api/reference/filter/wheel — фасеты {label, value}      │
│  GET /api/catalog/wheels — листинг + meta.seo                 │
└──────┬────────────────────────────────────────────────────────┘
       ▼
┌─ МОКИ (что остаётся) ─────────────────────────────────────────┐
│  Авто-подбор дисков: каскад и результат (эндпоинтов нет)      │
│  data/wheels.ts: ALL_WHEELS живёт ради авто; мёртвые функции  │
│  листинга/фильтра удаляются                                   │
└───────────────────────────────────────────────────────────────┘
```

## Задачи

1. `src/features/catalog/types/index.ts` — DTO фильтра дисков и листинга
   (`WheelFilterValuesDto`, `WheelListItemDto`), ключи как в контракте.
2. `src/shared/api/catalog.ts`:
   - `toWheelFilterOptions(dto)` — адаптер фасетов (нормализация: diameter → `r15`,
     width «7.0» → «7», et/hub — числа, type — alloy/steel/forged, метки от бэка);
   - `getWheelsFilters()` — живой fetch `/reference/filter/wheel`;
   - `toWheelListQuery(filter, city?)` — query (`width[]`/`diameter[]` числа, `pcd[]`,
     `et[]`, `hub_diameter[]`, `type`, `brand`, `country`, `delivery[]`, `price_*`,
     `city`, `page`, `per_page=12`);
   - `toWheelProduct(dto)` — DTO → WheelProduct: `parameters` из origin (как у шин),
     `pickup`/`pvzDelivery`, `quantity` из `count_in_stock`, `oldPrice`, `image` с
     заглушкой, `ean: ""`, `wheelType` из `type.value`;
   - `getWheelsProducts(filter, city?)` — живой fetch + meta → PaginatedResult + seo.
3. `src/app/catalog/wheels/[[...params]]/page.tsx` — `generateMetadata` + h2 из
   `meta.seo`; `showLink={false}` у карточек.
4. `src/features/catalog/components/ProductCard.tsx` — «Код товара» под условием
   (решение 2).
5. `src/data/wheels.ts` — удалить ставшие мёртвыми `getWheelsProductsMock` и
   `getWheelsFilterOptions` (проверить использования; ALL_WHEELS остаётся авто-подбору).
6. `tests/unit/` — новый `wheelListAdapter.test.ts`: query, фасеты, продукт (тест-лист).

## Тест-лист

── toWheelListQuery ───────────────────────────────────────────

Тест 1
1. Поведение: все фасеты дисков едут в query каноничным видом (массивы —
   `width[]/diameter[]/pcd[]/et[]/hub_diameter[]`), type — одиночным, город — слагом
2. Вход: filter { width: 7, diameter: 16, pcd: "5*112", et: 40, hubBore: 73.1,
   wheelType: "alloy", brand: "ls", country: "taivan", delivery: ["between1and3days"],
   priceMin: 10000, priceMax: 20000, page: 2 }, city = "chelyabinsk"
3. Ожидание: строка содержит все параметры 1:1 (порядок не важен), `%5B%5D` — `[]`
4. Имя: test_wheel_query_maps_all_facets

── toWheelFilterOptions ───────────────────────────────────────

Тест 2
1. Поведение: значения фасетов нормализуются под URL и селекты: diameter → `r15`,
   width «7.0» → «7», et «40.0» → «40», hub «73.1» → «73.1»; метки — с бэка;
   type — значения alloy/steel/forged
2. Вход: DTO { diameter: [{label: 15, value: 15}], width: [{label: "7.0", value: "7.0"}],
   et: [{label: "40.0", value: "40.0"}], hub_diameter: [{label: "73.1", value: "73.1"}],
   type: [{label: "Литые", value: "alloy"}], price: {min: 10600, max: 18900}, … }
3. Ожидание: diameters == [{label: 15, value: "r15"}]; widths == [{label: "7.0",
   value: "7"}]; ets == [{label: "40.0", value: "40"}]; hubBores == [{label: "73.1",
   value: "73.1"}]; wheelTypes == [{label: "Литые", value: "alloy"}]; priceMin/Max
4. Имя: test_wheel_filter_options_normalize_values

── toWheelProduct ─────────────────────────────────────────────

Тест 3
1. Поведение: карточка диска собирается из DTO: плашки origin → parameters (3),
   pickup/pvzDelivery из origin, quantity из count_in_stock, oldPrice из old_price,
   wheelType из type.value, пустые images → заглушка; slug → sizeSlug
2. Вход: листинговый DTO (один товар, как в живом ответе)
3. Ожидание: `p.parameters` 3 записи (Производитель/Страна/Год), `p.pickup.value` —
   дата, `p.pvzDelivery.value == "бесплатно"`, `p.quantity === 4`, `p.oldPrice === 13900`,
   `p.wheelType === "alloy"`, `p.image === PRODUCT_PLACEHOLDER`
4. Имя: test_wheel_product_maps_listing_dto

## Прогоны

- **Красный**: `npm test` — 3 failed | 87 passed (90) — падают ровно три новых
  теста (адаптеров ещё нет).
- **Зелёный**: `npm test` — 90 passed (14 файлов); `tsc --noEmit` чисто (одна
  доработка: `FilterState` остался нужен авто-функциям мока); `eslint` 0 ошибок
  (14 предупреждений — на одно меньше: мёртвый мок-код удалён).
- **Живой прогон** (dev :30034, ошибок консоли нет):
  - листинг `/catalog/wheels?city=chelyabinsk`: 12 карточек, h2 из `meta.seo`
    («Шины и диски в Челябинске»), «Код товара» нет, ссылок в никуда нет;
    на карточке — цена, зачёркнутая цена, «Наличие 4 шт.», плашки «Самовывоз
    18 Окт (Вс)» и «Доставка до ПВЗ бесплатно» — всё из API;
  - фильтры: `?et=50` → 6 карточек (бэк: total 6), сегмент `r18` → 4 (бэк: 4),
    `r18/7` → «Товаров не найдено» (бэк: 0); селект ET после выбора показывает
    значение («10») — binding нормализованных значений работает;
  - авто-подбор `/catalog/wheels/auto` (мок) жив: 4 марки.

## Ожидаемый результат

- Каталог дисков: карточки из живого API (цены, зачёркнутая цена, наличие, плашки
  «Самовывоз»/«ПВЗ»), фильтр меняет выдачу через бэк, город/пагинация/SEO — как у шин.
- Мок-страницы авто-подбора дисков не меняются; мёртвые мок-функции листинга удалены.
