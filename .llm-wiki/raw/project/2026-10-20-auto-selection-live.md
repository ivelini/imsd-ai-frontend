# Подбор шин по автомобилю на живом API

> Source: `documentations/tz/auto-selection-backend.md`; `.claude/plans/auto-selection-live.md`; `../backend/documentations/scramble/public-api.json`
> Collected: 2026-10-20
> Published: 2026-10-20

## Контракт бэка (5 маршрутов)

- `GET /api/reference/vehicle/makes?category=tire|wheel` — марки с размерами категории.
- `GET /api/reference/vehicle/makes/{make}/models?category=` — модели марки,
  `id`, `name`, `label` (поколение не дублирует имя), `generation`.
- `GET /api/reference/vehicle/models/{model}/years?category=` — годы по убыванию.
- `GET /api/reference/vehicle/models/{model}/modifications?year=&category=` —
  модификации года, `id`, `name`, `label`.
- `GET /api/catalog/tires/by-vehicle/{modification}` — результат:
  `data.vehicle {make, model, modification, year, title}`,
  `data.sections [{type, car_block_label, result_label, options}]`,
  `meta {city, seo {title, description|null}, offers_per_option, total_offers}`.
  Опция: `key`, `label`, `sizes`, `offers [{front, rear|null}]`, `offers_total`.

Особенности:
- адресация числовыми `id` (слагов в таблицах Vehicle нет);
- `category` по умолчанию `tire`; диски (`wheel`) справочники уже поддерживают;
- размерные фильтры (`width[]`, `profile[]`, `diameter[]`, `model`) → 422;
- импортные `stock`/`oem` → секция OEM; `optional`/`replacement`/`tuning` →
  «Лучшая альтернатива»;
- альтернативы группируются на чтении: одиночные строки — отдельные опции,
  Front/Rear паруются по порядку `id`; комплект показывается только полной парой
  одной модели; лимит 12 товаров на опцию; опции/секции без товаров не возвращаются;
- товары в ответе — те же поля, что в листинге (`TireListItemResource` +
  `ListingDeliveryEnricher`), поэтому карточки идут через `toTireProduct`;
- кэш результата инвалидируется наблюдателями за стоками/ценами; справочники —
  TTL 15 минут, импорт Vehicle их не сбрасывает.

## Фронт

- `src/shared/api/vehicle.ts` — `getVehicleMakes/Models/Years/Modifications`,
  `getVehicleTireSelection`, `toVehicleSelectionQuery` (цена/доставка/страна/город,
  без размеров), `toVehicleSelection`;
- `src/shared/lib/autoUrl.ts` — `parseVehicleAutoSegments` (числовые id, год 1900–2100),
  `vehicleAutoPath`;
- `src/features/catalog/types/vehicle.ts` — DTO и доменные типы;
- маршрут `/catalog/tires/auto/[[...auto]]` — сегменты `makeId/modelId/year/modId`;
  уровни 0–3 — справочники, уровень 4 — один запрос результата; H1/meta из
  `vehicle.title`/`meta.seo`; пустая выдача — «не найдено» с сайдбаром;
- `CatalogFilter`/`MainFilter` — значения `id`, подписи `label`; хуки
  `useAutoBrands`/`useAutoCascade` ветвятся: шины live, диски — моки до фазы 2;
- моки `AUTO_*`, `getAuto*`, `fetchAutoResult`, `getCarBlock`, SEO-мок удалены;
  store `catalog-filter` версии 2 (старые слаг-значения сбрасываются).

## Проверка

- Бэк: 44 теста, 158 assertions — зелёные; живой смоук после импорта CSV (452 строки,
  Acura/Alfa Romeo).
- Фронт: красный прогон 2 suites/0 tests (модули отсутствуют), зелёный — 103 теста
  (17 файлов); tsc чисто; lint 0 errors; `npm run build` — 22 маршрута.
- Живой прогон: `/catalog/tires/auto/1/1/2016/1?city=celiabinsk` — OEM 235/50 R18
  (4 карточки) и альтернатива 235/45 R19; фильтры цены работают; старый `/auto/bmw` → 404;
  мок-каскад дисков — 200.

## Известные ограничения

- В CSV только 2 марки; список марок на живой странице короткий.
- `car_block_label` альтернативы на бэке — «Альтернатива», в макете — «Лучшая альтернатива».
- `meta.seo.description` всегда null — SEO-блок на странице скрыт.
- Авто-подбор дисков — фаза 2: нужно утвердить допуски ET/hub; точное совпадение
  размеров в текущем каталоге даёт 0 товаров.
