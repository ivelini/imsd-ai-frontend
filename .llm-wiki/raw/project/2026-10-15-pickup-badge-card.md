# Плашка «Самовывоз» в карточке каталога из origin.delivery_days_after_order

> Source: План .claude/plans/pickup-badge-card.md и реализация (фронт aalyans.ru, рабочее дерево, коммит не сделан)
> Collected: 2026-10-15
> Published: 2026-10-15

Бэк добавил в листинги (`GET /api/catalog/tires`, `/api/catalog/wheels`) плашку
`origin.delivery_days_after_order = {badge, description}|null`: badge — дата словами
(«17 Окт (Сб)»), description — HTML-текст выдачи города (у города по умолчанию —
самовывоз из офиса). Контракт сверен с `../backend/documentations/scramble/public-api.json`
(15.10.2026); у бэка это одна из четырёх записей origin, плашка добавляется после чтения
кеша (ListingDeliveryEnricher).

## Что изменено на фронте

- `src/features/catalog/types/index.ts` — `TireOrigin` + ключ
  `delivery_days_after_order: TireOriginItem | null`; `ProductBase` + обязательное
  `pickup: ProductParam | null`.
- `src/shared/api/catalog.ts` — `toTireProduct`: `pickup: toOriginParam("Самовывоз",
  dto.origin?.delivery_days_after_order)` — тот же маппер, что у vendor/country/year;
  в `parameters` плашка не дублируется.
- `src/shared/ui/BadgeValue.tsx` (новый) — «есть description → ParamBadge с попапом,
  нет → сухой p-badge»; заменил третью копию этой развилки (ProductCard — параметры
  и строка «Самовывоз»; ProductDetails — параметры).
- `src/features/catalog/components/ProductCard.tsx` — строка `.pickup` рендерится из
  `product.pickup` (`{name} <BadgeValue …/>`); захардкоженная дата «8 авг (сб)» из
  вёрстки удалена.
- Моки `src/data/catalog.ts` (константа `PICKUP_BADGE` — дата «8 авг (сб)» + текст
  офиса) и `src/data/wheels.ts` (та же константа) — имитируют бэк, чтобы мок-страницы
  (диски, автоподбор, модель) не теряли строку.

## Поведение

- Плашки у бэка нет (`pickup: null`) — строка «Самовывоз» в карточке скрыта.
- `description: null` (у города нет точки выдачи) — бейдж без попапа.
- Страница товара (`/tires/[modelSlug]/[sizeSlug]`) не затронута: другой эндпоинт
  (мок `PRODUCT_STATIC`), там свой `pickupDate`.

## Проверки

- Тесты: `tests/unit/catalogListAdapter.test.ts` +3 (маппинг плашки, `description: null`,
  отсутствие плашки); красный прогон 3 failed | 12 passed → зелёный 80 passed;
  `tsc --noEmit` чисто, `eslint` 0 ошибок (15 прежних предупреждений).
- Живой прогон (dev-контейнер :30034, playwright): шины — «Самовывоз 17 Окт (Сб) » +
  попап с текстом выдачи Челябинска от бэка; диски (мок) — «8 авг (сб)» + мок-текст;
  страница товара — параметры и попап «Производитель» работают; ошибок в консоли нет.
