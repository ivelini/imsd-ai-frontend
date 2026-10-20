# Слаги Vehicle в URL авто-подбора

> Source: `documentations/tz/vehicle-slugs-backend.md`; `../backend/documentations/scramble/public-api.json`; `.claude/plans/auto-selection-live.md`
> Collected: 2026-10-20
> Published: 2026-10-20

## Бэкенд (реализовано 20.10.2026)

- В `vehicle_makes`, `vehicle_models`, `vehicle_modifications` добавлены `slug`
  (марка — глобально, модель — в рамках марки, модификация — в рамках модели+года).
- Слаги стабильны: `Str::slug(name)`; модели с поколениями — `integra`, `integra-iv`,
  `mdx-ii-yd2`; модификации — `1-8i`, `1-5-t`; коллизии — `-2`, `-3`.
- Справочники вложены в марку:
  `/api/reference/vehicle/makes/{make}/models`,
  `.../makes/{make}/models/{model}/years`,
  `.../makes/{make}/models/{model}/modifications?year=`.
- Результат: `/api/catalog/tires|wheels/by-vehicle/{make}/{model}/{year}/{modification}`;
  старый `/by-vehicle/{modification}` — deprecated numeric alias.
- Числовой `id` принимается как fallback во всех Vehicle-маршрутах (для старых ссылок).
- Ответы содержат `slug` у make/model/modification (и в результате подбора).

## Фронт

- Типы `Vehicle*Ref`/`VehicleModificationBrief` получили `slug`.
- `shared/lib/autoUrl.ts`: сегменты — слаги (`[a-z0-9-]+`); numeric id проходит как
  legacy; `matchesVehicleRef` сравнивает слаг/числовой id.
- API-слой: `getVehicleModels(make)`, `getVehicleYears(make, model)`,
  `getVehicleModifications({make, model, year})`,
  `getVehicleTire|WheelSelection({make, model, year, modification}, filter, city)`.
- Страницы: `/catalog/{tires|wheels}/auto/{makeSlug}/{modelSlug}/{year}/{modSlug}`;
  каждый уровень канонизирует URL: numeric/несовпавший сегмент → `redirect` (307)
  на слаг; ссылки списков — на слаги; store `catalog-filter` v4.
- Хуки отдают `FilterOption` со значением-слагом; `toAutoOptions` — общий маппер.

## Проверка

- 108 тестов (18 файлов); tsc чисто; lint 0 errors; build — 22 маршрута.
- Слаг-страницы: `/catalog/tires/auto/acura/integra/1999/1-8i?city=celiabinsk` → 200;
  `/catalog/wheels/auto/acura/ilx/2017/2-0i?city=celiabinsk` → 200.
- Legacy: `/catalog/tires/auto/1/6/1999/75` → **307** на слаг-URL;
  диски `/1/5/2017/54` → **307** на `/acura/ilx/2017/2-0i`.

## Ограничения

- `car_block_label` альтернативы — «Альтернатива» (в макете «Лучшая альтернатива»).
- `meta.seo.description` null — SEO-блок скрыт.
- В CSV только Acura/Alfa Romeo; у части авто нет дисков под допуски.
