# Подбор дисков по автомобилю на живом API

> Source: `../backend/documentations/scramble/public-api.json`; `../backend/app/Actions/Vehicle/GetWheelByVehicle.php`; `.claude/plans/auto-selection-live.md`
> Collected: 2026-10-20
> Published: 2026-10-20

## Контракт бэка

- `GET /api/catalog/wheels/by-vehicle/{modification}` — результат подбора дисков.
  Ответ: `data.vehicle {make, model, modification, year, title}`,
  `data.sections [{type, car_block_label, result_label, options}]`,
  `meta {city, seo {title, description|null}, offers_per_option, total_offers}`.
- Опция: `key`, `label`, `sizes`, `offers [{front, rear|null}]`, `offers_total`.
- Спецификация: `width` (строка), `diameter` (int), `et`, `pcd`, `hub_diameter`,
  `bolts`, `position`; label старого сайта: `16x6.5/5x114.3 D64.1 ET45`.
- Товары — `WheelListItemResource` + delivery/count_in_stock/origin.
- Справочники `/api/reference/vehicle/*` принимают `category=wheel`.

## Правило подбора

- диаметр и PCD — точно (PCD нормализуется `x`/`х` → `*`);
- ширина: от спеки до +0.5;
- ET: от −5 до +3 от спеки;
- hub товара ≥ ступицы (центровочные кольца);
- пары Front/Rear — по порядку `id`, только полная пара одной модели;
- лимит 12 товаров на опцию; пустые опции/секции не возвращаются.

## Фронт

- `shared/api/vehicle.ts`: `getVehicleWheelSelection`, `toWheelSelection`
  (товары через `toWheelProduct`); `toVehicleSelectionQuery` — общий с шинами
  (цена/доставка/страна/город, без размерных фильтров).
- Страница `/catalog/wheels/auto/{makeId}/{modelId}/{year}/{modId}`: каскад
  с `category=wheel`, один запрос результата, H1/meta из `meta.seo`, пустая выдача
  «дисков не найдено» с сайдбаром.
- Хуки `useAutoBrands`/`useAutoCascade` — оба каскада live; мок-файл
  `src/data/wheels.ts` удалён; store `catalog-filter` v3.

## Проверка

- Красный: 3 теста падали (`toWheelSelection`/`getVehicleWheelSelection` отсутствуют).
- Зелёный: 3 теста; полный прогон — 106 тестов (18 файлов); tsc чисто; lint 0 errors;
  build — 22 маршрута.
- Живой прогон: `Acura ILX 2.0i, 2017` → OEM `16x6.5/5x114.3 D64.1 ET45` (1 диск)
  и две альтернативы `17x7.5…`/`17x7…`; `price_max=13500` оставляет OEM;
  `price_min=100000` → «дисков не найдено»; `/1/1/2016/1` — пусто; `/auto/bmw` → 404.

## Ограничения

- У части модификаций нет товаров под допуски — пустая выдача (данные каталога).
- `car_block_label` альтернативы — «Альтернатива» (в макете «Лучшая альтернатива»).
- `meta.seo.description` null — SEO-блок скрыт.
- Слаги в URL — следующая итерация (задача `vehicle-slugs-backend.md`).
