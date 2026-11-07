# Бейджи во всех зонах витрины: листинг, подбор по авто, карточка модели

> Source: Код (src/features/catalog/types/index.ts, src/shared/api/catalog.ts, src/features/catalog/components/ProductCard.tsx, src/app/tires/[brandSlug]/[modelSlug]/page.tsx, src/app/style.css), план .claude/plans/badges-zones-front.md, ТЗ documentations/tz/badges-zones-backend.md; правка 27.10.2026
> Collected: 2026-10-27
> Published: 2026-10-27

## Проблема

Бэк (ADR `common/0048`) отдаёт блок `badges` во всех зонах витрины, но фронт подключил только
карточку товара и главную: поле `badges` терялось в адаптерах, плашки не рисовались. Живая
проверка: `GET /api/catalog/tires?city=celiabinsk&brand=yokohama` — в каждом товаре блок из двух
плашек бренда Yokohama; в HTML листинга — ни одной плашки.

## Правка фронта

- Типы: `badges?: Badge[]` в DTO листинга шин и дисков и DTO карточки модели; `badges: Badge[]`
  в типах для рендера (`ProductBase`, `TireModelData`) — как в `ProductDetailData`.
- Адаптеры `toTireProduct`, `toWheelProduct`, `toTireModel` переносят стек как есть:
  `badges: dto.badges ?? []` — фронт не фильтрует и не сортирует (порядок и дедуп на бэке).
- Рендер: `ProductCard` рисует `<Badges badges={product.badges} />` первым элементом
  `.catalog-product-details` (полоса над заголовком товара); страница модели — полоса перед
  заголовком модели. Подбор по авто закрылся тем же адаптером (`toTireProduct`/`toWheelProduct`
  в `src/shared/api/vehicle.ts`).
- CSS: `.catalog-product-details .benefits { margin: 0; }` — у полосы страничные отступы,
  в карточке отступы задаёт gap колонки. Новых классов плашек нет.

## Находка в бэке

Зона подбора по автомобилю отдавала офферы без `badges`: энричер бэка писал блок в
`payload.sections`, а секции ответа лежат в `payload.data.sections`. Исправлено в бэке
(`BadgePayloadEnricher::enrichByVehicle`), тест переведён на реальную форму payload.

## Проверка

- Красный: 6 новых тестов падают (`Target cannot be null or undefined`) — адаптеры стек не
  переносят.
- Зелёный: 139 тестов фронта, tsc чисто, lint — 0 ошибок (4 предсуществующих предупреждения).
- Живая проверка (dev `localhost:30034`): листинг Yokohama — 24 плашки, подбор по авто
  (`/catalog/tires/auto/acura/cdx/2019/1-5-t`) — 8, карточка модели — 4; диски — 0 (в дев-базе
  нет привязок баджей к дискам).
