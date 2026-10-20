# План: подбор по автомобилю на живых данных

- **Статус:** итерация 7 — шины и диски live на слагах; числовые URL редиректят
  (307) на слаг-адрес
- **Дата:** 2026-10-20
- **Контракт:** `documentations/tz/auto-selection-backend.md`; слаги —
  `documentations/tz/vehicle-slugs-backend.md`
- **Затрагивает:** `/catalog/tires/auto`, `/catalog/wheels/auto`, главный фильтр,
  сайдбар каталога

## Цель

Перевести механику «подбор по автомобилю» с моков на живой API:

- каскад марка → модель → год → модификация — из таблиц Vehicle;
- результат — размеры производителя (OEM / альтернативы) с товарами каталога,
  ценами города и правилами видимости листинга;
- фильтры сайдбара (цена, способ получения, страна) применяются бэком;
- диски — тот же поток; допуски width/ET и правило hub ≥ ступицы применяет бэк.

## Проверка бэкенда (20.10.2026)

Бэк реализовал 6 маршрутов и тесты (44 по шинам + wheel-набор) — все зелёные:

| Маршрут | Что отдаёт |
|---|---|
| `GET /api/reference/vehicle/makes` | марки `{id, slug, name}`; `category` по умолчанию `tire` |
| `GET /api/reference/vehicle/makes/{make}/models` | модели марки, `slug` + `label` без дубля имени |
| `GET /api/reference/vehicle/makes/{make}/models/{model}/years` | годы по убыванию, без null |
| `GET /api/reference/vehicle/makes/{make}/models/{model}/modifications?year=` | модификации года с размерами и `slug` |
| `GET /api/catalog/tires/by-vehicle/{make}/{model}/{year}/{modification}` | секции `oem`/`alternative`, опции, пары front/rear, товары |
| `GET /api/catalog/wheels/by-vehicle/{make}/{model}/{year}/{modification}` | те же секции; спецификации `16x6.5/5x114.3 D64.1 ET45`, товары дисков |

Живой прогон после импорта CSV в dev (452 строки, Acura/Alfa Romeo):
`Acura CDX 1.5 T, 2016` → секция OEM «235/50 R18» (4 товара) и альтернатива
«235/45 R19» (1 товар); цены, остатки, доставка на месте.
`Acura ILX 2.0i, 2017` → OEM `16x6.5/5x114.3 D64.1 ET45` (1 диск) и две
альтернативы `17x7.5…`/`17x7…` (12 из 15 и 12 из 28); допуски: ширина +0.5,
ET −5…+3, hub ≥ ступицы, PCD/диаметр точно.

Особенности контракта:
- адресация — слагами (`acura/integra/1999/1-8i`); числовой `id` — legacy-fallback
  в бэкенде; `category` необязателен (по умолчанию шины);
- размерные фильтры (`width[]`, `profile[]`, `diameter[]`, `model`) → `422`;
- `car_block_label` альтернативы на бэке — «Альтернатива», в макете — «Лучшая альтернатива»;
- `meta.seo.description` всегда `null` (в макете SEO-блок с текстом);
- справочники кэшируются на 15 минут; импорт Vehicle кэш не сбрасывает
  (в dev после импорта чистили кэш вручную).

## Слаги в URL — выполнено (20.10.2026)

Бэк реализовал `documentations/tz/vehicle-slugs-backend.md`: колонки `slug`,
вложенные справочники `/makes/{make}/models/{model}/…`, композитный результат
`by-vehicle/{make}/{model}/{year}/{modification}`, numeric `id` как fallback.

Фронт:
1. типы `Vehicle*Ref` и `VehicleModificationBrief` получили `slug`;
2. `autoUrl.ts` — слаг-сегменты; числовой id принимается как legacy;
3. API-слой — методы на слагах, результат по композитному пути;
4. страницы/хуки — значения слагов; store `catalog-filter` v4;
5. числовые URL → **307** на слаг-адрес (резолв через numeric fallback бэка);
6. тесты: slug-URL, legacy numeric, `matchesVehicleRef`; живой прогон
   `/catalog/tires/auto/acura/integra/1999/1-8i`.

## Схема целевого потока

```
GET /catalog/tires/auto/{make}/{model}/{year}/{modification}
  page.tsx
    ├─ getVehicleModels(makes/models/years/modifications) → /api/reference/vehicle/makes/{make}/models/...
    ├─ getVehicleTireSelection({make,model,year,modification}, filter, city) → /api/catalog/tires/by-vehicle/...
    └─ CatalogFilter + AutoResultView
```

## Этап 1 — фронт: типы и API-слой

1. `src/features/catalog/types/vehicle.ts`:
   `VehicleMakeRef {id,name}`, `VehicleModelRef {id,name,label,generation}`,
   `VehicleModificationRef {id,name,label}`, `VehicleSize`, `VehicleOffer`,
   `VehicleOption`, `VehicleSection`, `VehicleSelection`.
2. `src/shared/api/vehicle.ts` (+ `export *` в `data.ts`):
   - `getVehicleMakes()`, `getVehicleModels(makeId)`, `getVehicleYears(modelId)`,
     `getVehicleModifications(modelId, year)` — 404 → `null`;
   - `getVehicleTireSelection(modId, filter, city)` — 404 → `null`;
   - `toVehicleSelectionQuery(filter, city)` — только `price_min`, `price_max`,
     `delivery[]`, `country`, `city`; без размерных фильтров;
   - `toVehicleSelection` — секции/опции/пары, товары через `toTireProduct`.
3. Тесты адаптеров и query (Vitest, flat-файлы в `tests/unit/`).

## Этап 2 — фронт: страница шин

1. `src/app/catalog/tires/auto/[[...auto]]/page.tsx`:
   - сегменты `makeId/modelId/year/modId`; невалидный/нечисловой → `notFound()`;
   - уровни 0–3 — один справочник на уровень (+ марки для сайдбара);
   - уровень 4 — `getVehicleTireSelection`; H1 из `data.vehicle.title`;
     `generateMetadata` из `meta.seo.title/description`;
   - `SeoBlock` скрывать, пока `meta.seo.description` пуст.
2. `CatalogFilter`:
   - `AutoFilterData` — `brand/model/mod` строками-id, `models: {id,name,label}[]`;
   - селекты: значение — `id`, отображение — `label`;
   - бренды для сайдбара — `useAutoBrands` (живой для шин).
3. `MainFilter`: значения каскада — `id`; `label` для моделей; submit собирает URL по id.
4. `AutoResultView`/`CarBlock`: собрать `carBlock` из секций:
   `car_block_label`, опции, `checked` — первая опция первой секции; результаты —
   из `result_label` и `offers` (пары front/rear).
5. Store `useFilterStore`: поднять версию и сбросить `autoSelect`, чтобы старые
   мок-значения (`bmw`) не вели на нечисловой URL.
6. Удалить шинные auto-моки из `src/data/catalog.ts` и `shared/api/catalog.ts`
   (`AUTO_BRANDS`, `AUTO_MODIFICATIONS_BY_KEY`, `generateModifications`, `getAutoResult`,
   `getCarBlock`, `fetchAutoResult`, `getAutoBrands/Models/Years/Modifications`).
   Хуки `useAutoBrands`/`useAutoCascade` — оба каскада live (`category=tire|wheel`).
7. Живой прогон в браузере: каскад, смена города и фильтров, пустая выдача.

## Этап 3 — диски: выполнено (20.10.2026)

- Бэк добавил `GET /api/catalog/wheels/by-vehicle/{make}/{model}/{year}/{modification}`;
  справочники принимают `category=wheel`. Матчинг: диаметр/PCD точно, ширина от спеки
  до +0.5, ET −5…+3, hub ≥ ступицы; пары Front/Rear — по порядку id, полная пара
  одной модели.
- Фронт: `getVehicleWheelSelection`/`toWheelSelection` (адаптер `toWheelProduct`);
  страница `/catalog/wheels/auto/{make}/{model}/{year}/{modification}` — по образцу шин;
  H1/meta из `meta.seo`; пустая выдача — «дисков не найдено» с сайдбаром.
- Хуки `useAutoBrands`/`useAutoCascade` — оба каскада live на слагах; мок-файл
  `src/data/wheels.ts` удалён; store `catalog-filter` v4 сбрасывает старые значения.
- Проверка: живой прогон `Acura ILX 2.0i, 2017` — OEM + 2 альтернативы; фильтры
  цены и пустая выдача проверены; старый `/auto/bmw` → 404.

## Ожидаемый результат

- `/catalog/tires/auto` и `/catalog/wheels/auto` полностью на живых данных;
  моки auto-каскадов удалены.
- Каскад: один справочник на уровень; результат — один запрос.
- Пустая выдача — понятное состояние; фильтры применяются бэком.
- Главный фильтр ведёт на живые auto-страницы.

## Тест-лист (согласуется до реализации)

── `tests/unit/vehicleSelectionAdapter.test.ts` ──────────────

Тест 1
1. Поведение: ответ `by-vehicle` разворачивается в секции/опции/пары; товары проходят
   через `toTireProduct` (поля карточки не теряются)
2. Вход: DTO с секцией `oem`, опцией-одиночкой и опцией-комплектом (front+rear)
3. Ожидание: у одиночки `rear == null`, у комплекта обе карточки; `offers_total` сохранён
4. Имя: `test_map_vehicle_selection_keeps_single_and_pair_offers`

Тест 2
1. Поведение: пустые секции не ломают рендер; отсутствие товаров — валидное состояние
2. Вход: `data.sections = []`, `meta.total_offers = 0`
3. Ожидание: адаптер вернул пустые секции, страница показывает «не найдено»
4. Имя: `test_map_vehicle_selection_empty_result`

Тест 3
1. Поведение: query подбора не содержит размерных фильтров и содержит цену/доставку/город
2. Вход: `filter = {priceMin: 5000, delivery: ["between1and3days"], country: "rossiia"}`,
   `city = "celiabinsk"`, плюс случайные `width/profile/diameter`
3. Ожидание: `price_min=5000&delivery[]=between1and3days&country=rossiia&city=celiabinsk`;
   `width/profile/diameter` отсутствуют
4. Имя: `test_vehicle_selection_query_omits_size_filters`

Тест 4
1. Поведение: 404 справочника/результата превращается в `null`, а не в исключение
2. Вход: `fetch` → 404
3. Ожидание: `getVehicleTireSelection(...) === null` → `notFound()`
4. Имя: `test_vehicle_not_found_returns_null`

── `tests/unit/vehicleAutoUrl.test.ts` ───────────────────────

Тест 5
1. Поведение: URL авто-страницы собирается из слагов марки/модели/модификации + года
2. Вход: `make="acura"`, `model="integra"`, `year=1999`, `modification="1-8i"`
3. Ожидание: `/catalog/tires/auto/acura/integra/1999/1-8i`
4. Имя: `test_build_vehicle_url_from_slugs`

Тест 6
1. Поведение: невалидный сегмент (верхний регистр/подчёркивание) не доходит до API
2. Вход: `segments = ["Acura"]` и `["acura","integra_iv"]`
3. Ожидание: парсер вернул `null` → `notFound()`
4. Имя: `test_invalid_vehicle_segment_is_rejected`

Тест 7
1. Поведение: числовой id принимается как legacy-сегмент (для редиректа на слаг)
2. Вход: `segments = ["1","6","1999","75"]`
3. Ожидание: `{make:"1", model:"6", year:1999, modification:"75"}`
4. Имя: `test_parse_legacy_numeric_segments_as_strings`

Тест 8
1. Поведение: сегмент сопоставляется со слагом и с legacy-id справочной записи
2. Вход: `ref = {id:6, slug:"integra"}`, значения `"integra"`, `"6"`, `"integra-iv"`
3. Ожидание: true / true / false
4. Имя: `test_matches_slug_and_legacy_id`

── `tests/unit/wheelSelectionAdapter.test.ts` ────────────────

Тест 9
1. Поведение: ответ `wheels/by-vehicle` разворачивается в секции/опции/пары; товары
   проходят через `toWheelProduct` (PCD/ET и поля карточки не теряются)
2. Вход: DTO с секцией `oem`, опцией-одиночкой и опцией-комплектом
3. Ожидание: у одиночки `rear == null`, у комплекта обе карточки; `offers_total` сохранён
4. Имя: `test_map_wheel_selection_keeps_single_and_pair_offers`

Тест 10
1. Поведение: пустые секции дисков не ломают рендер
2. Вход: `data.sections = []`, `meta.total_offers = 0`
3. Ожидание: адаптер вернул пустые секции, страница показывает «дисков не найдено»
4. Имя: `test_map_wheel_selection_empty_result`

Тест 11
1. Поведение: 404 результата дисков превращается в `null`
2. Вход: `fetch` → 404
3. Ожидание: `getVehicleWheelSelection(...) === null` → `notFound()`
4. Имя: `test_wheel_selection_not_found_returns_null`

## Прогоны

- Бэкенд, 20.10.2026: `php artisan test --filter='TireByVehicleTest|VehicleReferenceTest|…'` —
  **44 passed, 158 assertions**.
- Живой смоук бэка: `GET /api/reference/vehicle/makes` → Acura, Alfa Romeo;
  `GET /api/catalog/tires/by-vehicle/1?city=celiabinsk` → 5 офферов.
- Фронт, красный: `npm test -- tests/unit/vehicleSelectionAdapter.test.ts tests/unit/vehicleAutoUrl.test.ts` —
  **2 suites failed, 0 tests** (модули `@/shared/api/vehicle` и `@/shared/lib/autoUrl` ещё не созданы).
- Фронт, зелёный: те же файлы — **10 passed**; полный прогон — **103 passed (17 files)**.
- Диски, красный: `tests/unit/wheelSelectionAdapter.test.ts` — **3 failed**
  (`toWheelSelection`/`getVehicleWheelSelection` ещё не реализованы).
- Диски, зелёный: **3 passed**; полный прогон — **106 passed (18 files)**.
- Слаги: тесты обновлены на slug-адресацию (в т. ч. legacy numeric и `matchesVehicleRef`);
  полный прогон — **108 passed (18 files)**.
- `npx tsc --noEmit` — чисто; `npm run lint` — **0 errors, 5 warnings** (прежние).
- `npm run build` — успешно, 22 маршрута; dev-контейнер останавливался на сборку и запущен обратно.
- Живой прогон шин (слаги): `/catalog/tires/auto/acura/integra/1999/1-8i?city=celiabinsk` → 200;
  `/catalog/tires/auto/acura/cdx/2016/1-5-t?city=celiabinsk` → OEM 235/50 R18 (4 карточки)
  и альтернатива 235/45 R19.
- Живой прогон дисков (слаги): `/catalog/wheels/auto/acura/ilx/2017/2-0i?city=celiabinsk` → 200;
  OEM `16x6.5/5x114.3 D64.1 ET45` + две альтернативы; фильтры и пустая выдача проверены.
- Legacy numeric: `/catalog/tires/auto/1/6/1999/75` → **307** на
  `/catalog/tires/auto/acura/integra/1999/1-8i`; диски `/1/5/2017/54` → **307** на
  `/catalog/wheels/auto/acura/ilx/2017/2-0i`.

## Открытые вопросы

1. `car_block_label` альтернативы: на бэке «Альтернатива», в макете «Лучшая альтернатива».
   Сейчас рендерим бэковую строку; выровнять — правка одной строки на бэке.
2. ~~SEO-блок~~ — решено: скрыт, пока `meta.seo.description` пуст.
3. Данные в dev импортированы; после повторного импорта справочники чистятся
   вручную (TTL 15 минут) — ожидаемое поведение бэка.
4. Диски: правило допусков реализовано бэком (ширина +0.5, ET −5…+3, hub ≥, PCD/диаметр
   точно); у части модификаций совпадений нет — страница показывает «дисков не найдено».
5. ~~Слаги в URL~~ — выполнено 20.10.2026: бэк (колонки, вложенные маршруты,
   композитный результат) + фронт; numeric URL редиректят 307 на слаг.
