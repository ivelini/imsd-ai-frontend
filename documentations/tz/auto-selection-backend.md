# ТЗ: API подбора шин по автомобилю — методы чтения

- **Статус:** реализовано бэком 20.10.2026: 5 маршрутов, 44 теста (158 assertions);
  живой смоук на импортированном CSV — успешно
- **Дата:** 2026-10-20
- **Адресат:** бэкенд `imsd-backend` (Laravel)
- **Потребитель:** фронт `/catalog/tires/auto`
- **Источник истины по маршрутам:** `../backend/documentations/scramble/public-api.json`

## 1. Цель

Импорт Vehicle и таблицы Vehicle на бэке уже есть. Не хватает **публичных методов
чтения**: каскад «марка → модель → год → модификация» и результат подбора
(размеры производителя + товары с ценами города). Нужны только методы отдачи;
**импорт, схема и данные не меняются**.

## 2. Что уже есть

- Таблицы: `vehicle_makes`, `vehicle_models`, `vehicle_modifications`,
  `vehicle_tire_sizes` (+ `vehicle_wheel_specs` для фазы 2).
- Импорт CSV через админку (`/panel/import`, тип `Vehicle`), данные уже загружаются.
- Живые листинги `GET /api/catalog/tires` и `/api/catalog/wheels` с фильтрами,
  городом, остатками, ценами и доставкой.
- `TireListItemResource`, `ListingDeliveryEnricher`, `SeoTitleBuilder`.

## 3. Ограничения существующих данных (принять как есть)

1. **Тип совместимости.** Импорт пишет `stock` (OEM) и `optional` (замена/тюнинг).
   Enum `SpecType` (`oem`/`replacement`/`tuning`) сейчас импортом не используется.
   Метод чтения должен принимать оба набора:
   - `stock` или `oem` → секция «Рекомендация производителя»;
   - `optional` или `replacement`/`tuning` → секция «Лучшая альтернатива».
2. **Альтернативы не сгруппированы.** В таблице нет номера альтернативы внутри
   ячейки CSV. Метод чтения группирует строки сам:
   - строки с `position = NULL` — по одной опции;
   - если у модификации и типа есть ровно один `Front` и один `Rear` — это комплект
     (одна опция, две позиции);
   - если передних/задних несколько — комплект собирается по порядку `id`
     (i-й Front с i-м Rear); правило зафиксировать в коде и документации.
   Ограничение известно; менять схему ради него в фазе 1 не нужно.
3. **Слаги — реализованы 20.10.2026.** Колонки `slug` добавлены; адресация —
   слагами (`acura/integra/1999/1-8i`); числовой `id` остаётся legacy-fallback.
   Детали — `vehicle-slugs-backend.md`; примеры ниже — базовая id-форма контракта.
4. **Поколения.** Одно имя модели может повторяться с разными `generation`
   (`MDX`, `MDX II (YD2)` и т. д.). В ответе нужен `label` для отображения:
   - поколение пустое или равно имени → `name`;
   - поколение начинается с имени → поколение как есть;
   - иначе → `"{name} {generation}"`.
5. **Годы.** `vehicle_modifications.year` — отдельная строка на год;
   годы модели — различные `year` по убыванию.

## 4. Публичные эндпоинты

Все — без авторизации, `routes/api.php`, Scramble-группы «Справочник» / «Каталог».
С 20.10.2026 ответы содержат `slug`, а справочники вложены в марку:
`makes/{make}/models/{model}/years|modifications`; канонический результат —
`by-vehicle/{make}/{model}/{year}/{modification}` (см. `vehicle-slugs-backend.md`).
Примеры ниже — базовая id-форма.

Общее:
- `category` — query `tire|wheel`; поддерживаются обе категории (диски — результат
  `GET /api/catalog/wheels/by-vehicle/{modification}`);
- отдаются только марки/модели/годы/модификации, у которых есть хотя бы один размер
  соответствующего типа;
- неизвестный `id` → `404`; невалидный `category`/`year` → `422`;
- сортировка: марки — по `name`, модели/модификации — по `label`, годы — по убыванию;
- пустой список — `200` с `data: []`.

### 4.1. Марки

`GET /api/reference/vehicle/makes?category=tire`

```json
{
  "data": [
    { "id": 1, "name": "Acura" },
    { "id": 2, "name": "Alfa Romeo" }
  ],
  "meta": { "total": 2 }
}
```

### 4.2. Модели марки

`GET /api/reference/vehicle/makes/{make}/models?category=tire`

```json
{
  "data": [
    {
      "id": 5,
      "name": "MDX",
      "label": "MDX II (YD2)",
      "generation": "MDX II (YD2)"
    }
  ],
  "meta": { "total": 24 }
}
```

### 4.3. Годы модели

`GET /api/reference/vehicle/makes/{make}/models/{model}/years?category=tire`

```json
{ "data": [2007, 2006, 2005], "meta": { "total": 3 } }
```

### 4.4. Модификации модели за год

`GET /api/reference/vehicle/makes/{make}/models/{model}/modifications?year=2007&category=tire`

`year` обязателен. Нет данных за год → `200`, `data: []`.

```json
{
  "data": [
    { "id": 42, "name": "3.5 V6", "label": "3.5 V6" }
  ],
  "meta": { "year": 2007, "total": 1 }
}
```

### 4.5. Результат подбора шин

`GET /api/catalog/tires/by-vehicle/{modification}?city=chelyabinsk` —
deprecated numeric alias; канонический путь —
`GET /api/catalog/tires/by-vehicle/{make}/{model}/{year}/{modification}?city=chelyabinsk`.

- `{modification}` — слаг модификации (numeric `id` — legacy-fallback);
- принимаются фильтры листинга: `city`, `city_id`, `price_min`, `price_max`,
  `delivery[]`, `country`, `brand`, `season`, `studded`;
- размерные фильтры (`width[]`, `profile[]`, `diameter[]`) не принимаются —
  размер задаёт автомобиль;
- неизвестная модификация → `404`; невалидный фильтр → `422`.

Ниже — псевдо-JSON: `<TireListItemResource>` — элемент листинга целиком
(поля ресурса + `delivery`, `count_in_stock`, `origin` от `ListingDeliveryEnricher`).

```json
{
  "data": {
    "vehicle": {
      "make": { "id": 1, "name": "Acura" },
      "model": { "id": 5, "name": "MDX", "label": "MDX II (YD2)", "generation": "MDX II (YD2)" },
      "modification": { "id": 42, "name": "3.5 V6" },
      "year": 2007,
      "title": "Acura MDX II (YD2) 3.5 V6, 2007 г."
    },
    "sections": [
      {
        "type": "oem",
        "car_block_label": "Рекомендовано",
        "result_label": "Рекомендация производителя",
        "options": [
          {
            "key": "265-50-19",
            "label": "265/50 R19",
            "sizes": [
              { "width": 265, "profile": 50, "diameter": "19", "position": null }
            ],
            "offers": [
              { "front": "<TireListItemResource>", "rear": null }
            ],
            "offers_total": 3
          },
          {
            "key": "275-45-20--305-40-20",
            "label": "275/45 R20 - 305/40 R20",
            "sizes": [
              { "width": 275, "profile": 45, "diameter": "20", "position": "Front" },
              { "width": 305, "profile": 40, "diameter": "20", "position": "Rear" }
            ],
            "offers": [
              { "front": "<TireListItemResource>", "rear": "<TireListItemResource>" }
            ],
            "offers_total": 1
          }
        ]
      }
    ]
  },
  "meta": {
    "city": { "id": 1132, "slug": "chelyabinsk", "name": "Челябинск" },
    "seo": {
      "title": "Шины на Acura MDX II (YD2) 3.5 V6, 2007 г. в Челябинске",
      "description": null
    },
    "offers_per_option": 12,
    "total_offers": 4
  }
}
```

Правила:
- альтернатива = один элемент `options`; `sizes` — 1 или 2 размера; `key` —
  `"{w}-{p}-{d}"`, у комплекта два ключа через `--`;
- `offers` — товары по альтернативе; одиночный размер → `rear: null`;
  комплект → только полные пары (одна модель/бренд товара есть в обоих размерах);
- сортировка `offers` — по цене города, затем `id`; лимит 12 на опцию
  (`offers_per_option`), `offers_total` — всего до лимита;
- опции без товаров **не возвращаются**; секции без опций не возвращаются;
  если товаров нет нигде — `sections: []`, `meta.total_offers = 0`;
- видимость товаров — как в листинге: published, остаток ≥ `min_stock_quantity`,
  есть цена города; фильтры применяются к товарам;
- `vehicle.title` и `meta.seo.title` — готовые строки для H1/мета (город —
  `SeoTitleBuilder::prepositionalCity`).

### 4.6. Результат подбора дисков — реализовано 20.10.2026

`GET /api/catalog/wheels/by-vehicle/{modification}` (канонический —
`.../wheels/by-vehicle/{make}/{model}/{year}/{modification}`) — тот же контракт,
товары — `WheelListItemResource`; спецификации: `width` (строка), `diameter` (int), `et`,
`pcd`, `hub_diameter`, `bolts`, `position`. Правило подбора: диаметр/PCD точно,
ширина от спеки до +0.5, ET −5…+3, hub товара ≥ ступицы; пары Front/Rear — по порядку
`id`, полная пара одной модели; лимит 12 на опцию. Живой смоук: `Acura ILX 2.0i, 2017`
→ OEM `16x6.5/5x114.3 D64.1 ET45` (1 диск) и две альтернативы `17x7.5…`/`17x7…`.

## 5. Кэш и производительность

- Справочники — Redis, TTL 5–15 минут (импорт не трогаем; короткий TTL достаточен).
- Результат — кэш стабильной части по `(modification_id, city_id, фильтры, лимит)`;
  `delivery`/`count_in_stock`/`origin` считаются вне кэша, как в листинге.
- Число запросов не растёт с числом размеров: размеры — одним запросом, товары —
  батчем или переиспользованием `GetTireList` с лимитом на размер; N+1 недопустим.

## 6. Ошибки и пустые состояния

| Ситуация | Ответ |
|---|---|
| Неизвестный id марки/модели/модификации | `404` |
| Невалидный `category`/`year`/фильтр | `422` |
| Модификация есть, товаров нет | `200`, `data.sections: []`, `meta.total_offers = 0` |
| Город не найден слагом | фолбэк на город из `config/shop.php`, как в листинге |

## 7. Критерии приёмки

1. Импорт не менялся; методы читают существующие таблицы.
2. `makes` отдаёт Acura и Alfa Romeo для `category=tire`; `models` — все поколения
   с разными `label`; `years` — по убыванию; `modifications` — по году.
3. Для модификации с размерами результат содержит секции `oem`/`alternative`;
   каждый товар соответствует размеру и имеет цену выбранного города.
4. Смена `city`, `price_min/price_max`, `delivery[]`, `country` меняет `offers`.
5. Комплект front/rear возвращает пары одной модели; неполные пары не показываются.
6. Модификация без товаров — `200` с пустыми секциями, не `404`.
7. `public-api.json` (Scramble) содержит новые маршруты и схемы.
8. Feature-тесты на каждый эндпоинт; unit-тесты на `label` и группировку размеров.

## 8. Вне объёма

- Изменения импорта, схемы, слагов и данных.
- Пагинация товаров внутри размера и «Показать ещё».
- Фасеты фильтра, зависящие от автомобиля.

## 9. Открытые вопросы для бэкенда

1. Правило группировки комплектов — реализовано по порядку `id`, покрыто
   `TireSizeOptionGrouperTest` (в т. ч. несколько пар).
2. Лимит 12 товаров на опцию — реализовано (`config/shop.php`).
3. `category=wheel` — справочники и результат дисков реализованы 20.10.2026.
