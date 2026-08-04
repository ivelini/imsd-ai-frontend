# Контракт API: унифицированный формат данных фильтра

> Решение от 04.08.2026. Правило: `.claude/rules/api-contract.md`

## Принцип

Все данные для отображения формирует **бэкенд**. Фронт не строит словари и маппинги. Если для отображения нужен словарь/хардкод — это недоработка API, такие места подсвечиваются.

## Единый формат опций

```ts
interface FilterOption {
  label: string;  // что видит пользователь («Летняя», «R15», «Viatti (500)»)
  value: string;  // латинский slug, совпадает 1:1 с URL («summer», "15", "viatti", "russia")
}
```

## Контракт фильтра (мок = ответ бэка)

```
GET /api/catalog/filters  →  FilterOptions
GET /api/catalog/products?season=summer&brand=viatti&width=185&profile=60&diameter=15&country=russia&price_min=&price_max=  →  PaginatedResult<TireProduct>
```

```json
{
  "seasons":   [{ "label": "Летняя", "value": "summer" }],
  "brands":    [{ "label": "Viatti (500)", "value": "viatti" }],
  "widths":    [{ "label": "195", "value": "195" }],
  "profiles":  [{ "label": "60", "value": "60" }],
  "diameters": [{ "label": "R15", "value": "15" }],
  "tireTypes": [{ "label": "Легковая", "value": "passenger" }],
  "countries": [{ "label": "Россия", "value": "russia" }],
  "priceMin": 5000,
  "priceMax": 94000
}
```

## Правила value

- Только латинские slug/строки: `summer`, `winter`, `all-season`, `viatti`, `russia`, `passenger`
- В URL никогда не попадают русские значения
- Сопоставление с URL — прямое сравнение `option.value === segment`, без маппингов

## Что запрещено на фронте

- Словари вида `{ summer: "Летняя" }` для отображения — label приходит от бэка
- `SEASON_MAP`-маппинги в parseParams — сегменты URL уже равны value
- Русские строки в качестве value селектов

## Текущий статус

- ✅ Унифицированы: FilterOptions, товары (season/tireType/country в value-формате), parseParams (без маппингов), CatalogFilter, ProductCard (label из товара/опций)
- ⏭ При первом контракте с бэком (Laravel) — сверить этот формат и передать бэку как эталон
