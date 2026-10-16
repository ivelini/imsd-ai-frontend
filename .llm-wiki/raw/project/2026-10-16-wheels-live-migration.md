# Каталог дисков на живом API

> Source: План .claude/plans/wheels-live-migration.md и прогоны (фронт aalyans.ru)
> Collected: 2026-10-16
> Published: 2026-10-16

Листинг и фильтр `/catalog/wheels` переведены на живой бэк по образцу шин:
`GET /api/catalog/wheels` и `GET /api/reference/filter/wheel` (контракт
public-api.json). Мок остаётся только авто-подбору (каскад и результат —
эндпоинтов подбора у бэка нет).

## Контракт и решение о форматах

- Листинг: `data[]` {id, name, slug, brand, model, origin (как у шин: vendor,
  manufacture_country, manufacture_year, delivery_days_after_order, pick_up),
  width «7.0», diameter 16, pcd «4*100», et «40.0», hub_diameter «73.1»,
  type {label, value}|null, color, price, old_price, promotion, delivery,
  count_in_stock, images} + `meta` того же shape (включая `seo`).
- Фильтр: фасеты width/diameter/pcd/et/hub_diameter/type/color/brand/country/
  delivery/price; label — готовый от бэка.
- **Decimal не мешает матчингу**: бэк нормализует вход
  (`WheelProductBuilder::normalizeDecimal` — `number_format(...,1)`), поэтому в query
  уходят числа («40» матчится с «40.0» в БД); `FilterState.et/hubBore` остались числами.
- Тип дисков: значения стали `alloy|steel|forged` (у мока были litoy/kovanyy/
  shtampovannyy).
- Диаметры фасета — integer (15) → value селекта и сегмента URL `r15` (нормализация
  адаптера); ширины «7.0» → «7»; pcd — как отдал бэк («4*100»).

## Фронт

- `src/features/catalog/types/index.ts` — общие `OriginDto`/`OriginItemDto`
  (переименование `TireOrigin`: форма origin одна у шин и дисков); `WheelListItemDto`,
  `WheelListDto`, `WheelFilterValuesDto`, `WheelListResult` (с seo).
- `src/shared/api/catalog.ts` — `toWheelFilterOptions` (нормализация значений),
  `toWheelListQuery` (декремент полей — числами, каноничные `[]`), `toWheelProduct`
  (как `toTireProduct`: параметры из origin, pickup/pvzDelivery, quantity, oldPrice,
  заглушка картинки), живые `getWheelsFilters`/`getWheelsProducts` (+`per_page=12`).
- Страница `/catalog/wheels` — `generateMetadata` + h2 из `meta.seo`; карточки
  `showLink={false}`: страницы товара дисков нет (`/wheels/...` не существует) —
  ссылки вели в 404.
- `ProductCard` — «Код товара» под условием: у дисков кода в контракте нет.
- Мёртвые `getWheelsProductsMock`/`getWheelsFilterOptions` (+ `getWheelPriceRange`,
  `WHEELS_PER_PAGE`) удалены; `ALL_WHEELS` и авто-словарь живут ради авто-подбора.

## Прогоны

Красный 3 failed | 87 passed → зелёный 90 passed (14 файлов), `tsc`/`eslint` чисто.
Живой прогон: листинг 12 карточек (цены, зачёркнутая цена, наличие, плашки
«Самовывоз»/«Доставка до ПВЗ», h2 из seo); фильтры сужают как бэк (`?et=50` → 6 =
total 6; сегмент `r18` → 4; `r18/7` → «Товаров не найдено» = 0); селект ET после
выбора показывает значение (binding нормализованных значений); авто-подбор (мок) жив;
ошибок консоли нет.

## Вне области

Авто-подбор дисков (мок), цвет (бэк фильтрует — фасета в UI нет), `promotion`,
сортировка по цене (`sort_by`), страница товара дисков.
