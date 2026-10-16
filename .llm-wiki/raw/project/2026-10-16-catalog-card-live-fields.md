# Живые поля карточки каталога: ПВЗ, наличие, зачёркнутая цена

> Source: Планы .claude/plans/{pvz-delivery-badge,stock-count-card,old-price-card}.md и прогоны на живом каталоге (фронт aalyans.ru)
> Collected: 2026-10-16
> Published: 2026-10-16

Бэк добавил в листинг `GET /api/catalog/tires` (и `/catalog/wheels`) три поля; карточка
каталога показывает их из живого API — раньше был хардкод или пропуск. Контракт сверен
с `../backend/documentations/scramble/public-api.json`.

## origin.pick_up → «Доставка до ПВЗ» (pvzDelivery)

- Форма: `origin.pick_up = {pick_up_point: {badge, description|null}}|null` (required,
  объект на уровень глубже остальных записей origin).
- Живой бэк (Челябинск): badge «бесплатно», description — текст курьерской доставки
  с переносами `\n`.
- Фронт: `toOriginParam("Доставка до ПВЗ", dto.origin?.pick_up?.pick_up_point)` →
  `ProductBase.pvzDelivery: ProductParam|null`; строка `.free-shipping` карточки рисует
  name + `BadgeValue` (описание → `ParamBadge` с попапом); null — строки нет. Был хардкод
  «бесплатно >» без попапа.
- Моки: `PVZ_BADGE` в `data/catalog.ts` (шины), импорт в `data/wheels.ts` (диски);
  текст мока — с `<br>` (имитация ответа бэка после правки HTML-отдачи).
- Тесты: 3 в `catalogListAdapter.test.ts` (маппинг, `description: null`, `pick_up: null`).

## count_in_stock → «Наличие N шт.»

- Форма: `count_in_stock: integer|null` (required). Живой бэк: 40, 28, 8…
- Фронт: `quantity: dto.count_in_stock ?? null`; `ProductBase.quantity: number|null`;
  карточка рисует «Наличие …» только при числе (null — строки нет, «Наличие null шт.» —
  дефект). Был хардкод `quantity: 0` → «Наличие 0 шт.» у всех товаров.
- Ключ добавлен и в фикстуру `catalog-city.test.ts` (tsc поймал вторую фикстуру).
- Тесты: маппинг (40) + null.

## old_price → зачёркнутая цена

- Форма: `old_price: number|null` (required). Живой бэк: на прогоне у всех 12 товаров
  страницы выше текущей цены (11900 при 11100 и т.д.).
- Фронт: `oldPrice: dto.old_price ?? undefined`; карточка рисует
  `.catalog-product-old-price` под своим условием (`oldPrice > price` — уже была).
  Без маппинга зачёркнутой цены на живом каталоге не было (моки её задавали).
- Тесты: маппинг (13100) + страж (null → `oldPrice === undefined`).

## Решение по формату описаний попапов (правка — на бэке)

- Все попапы рендерят текст как HTML (`ParamBadge` → dangerouslySetInnerHTML); у бэка
  три описания origin (производитель, страна, год) уже HTML (`<p>…` из product_origin).
- Два описания — простой текст с `\n`: срок доставки (`PickUpTextBuilder::cityText`)
  и ПВЗ (настройки `pick_up_point_description_*`). Правка передана в бэкенд-сессию:
  `cityText` → строки через `<br>` + `e()` значений, настройки → `nl2br`.
- До правки переносы в попапах «ПВЗ» и «Самовывоз» теряются (одна строка) — ожидаемо.
  Вариант `white-space: pre-line` на фронте отклонён (решено: отдача — HTML).

## Прогоны

Красный/зелёный по каждой задаче (3, 2 и 1 новых теста падали до реализации), полный
набор 87 passed, `tsc`/`eslint` чисто; живой прогон (dev :30034): ПВЗ-попап от бэка,
«Наличие 40/28/40/8…», 12 зачёркнутых цен, диски (мок) — строка ПВЗ и многострочный
попап мока.
