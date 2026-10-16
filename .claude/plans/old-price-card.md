# Зачёркнутая цена в карточке каталога: old_price из листинга

## Цель

Бэк добавил в листинг `old_price` (зачёркнутая цена). У моков `oldPrice` есть и
карточка его рисует, а адаптер живого `toTireProduct` ключ не читает — на живом
каталоге зачёркнутая цена не показывается никогда (в ответе бэка она местами есть:
id 183 — price 13000, old_price 13100).

## Вход / процесс / выход

- **Вход:** `old_price: number|null` (required) в DTO `GET /catalog/tires`
  (контракт public-api.json; живой бэк: у большинства `null`, у части — выше `price`).
- **Процесс:** DTO + `old_price` → `oldPrice: dto.old_price ?? undefined` → карточка
  рисует зачёркнутую цену своей существующей проверкой (`oldPrice > price` — без правок).
- **Выход:** живая карточка показывает зачёркнутую цену там, где бэк её дал;
  `null` — цены нет (как сейчас).

## Схема

```
┌─ GET /catalog/tires/… — карточка каталога (Server Component) ─┐
│       │ getCatalogProducts(filter, city)                      │
│       ▼                                                       │
│  [api]  shared/api/catalog.ts · toTireProduct(dto)            │
│       │ oldPrice: dto.old_price ?? undefined                  │
│       ▼  oldPrice?: number                                    │
│  [ui]   ProductCard · «.catalog-product-old-price»            │
│         (условие уже есть: oldPrice > price)                  │
└───────┬───────────────────────────────────────────────────────┘
        │ fetch /api/catalog/tires (rewrites → бэк)
        ▼
┌─ ВНЕШНИЙ МИР ─────────────────────────────────────────────────┐
│  GET /api/catalog/tires → old_price: 13100 | null             │
└───────────────────────────────────────────────────────────────┘
```

## Задачи

1. `src/features/catalog/types/index.ts` — `TireListItemDto` + `old_price: number | null`.
2. `src/shared/api/catalog.ts` — `oldPrice: dto.old_price ?? undefined` рядом с `price`.
3. `src/features/catalog/components/ProductCard.tsx` — без правок (условие
   `oldPrice && price и oldPrice > price` уже рисует зачёркнутую цену; equal и меньше
   не рисуются).
4. `tests/unit/catalogListAdapter.test.ts` — тесты ниже; ключ `old_price` в `baseDto`;
   в `tests/unit/catalog-city.test.ts` — ключ в фикстуру (иначе tsc).
5. Моки не меняются (у фабрик `oldPrice` уже есть — это имитация ответа).

Вне области: страница товара (свой `ProductDetailData`/PRODUCT_STATIC), листинг дисков
(мок; контракт wheels получил то же поле — при переезде на живой API маппинг тот же).

## Тест-лист

── toTireProduct: зачёркнутая цена из old_price ────────────────

Тест 1
1. Поведение: число из `old_price` едет в `oldPrice` (карточка рисует зачёркнутую
   цену выше обычной); реализация без маппинга тест завалит
2. Вход: baseDto с `price: 11100`, `old_price: 13100`
3. Ожидание: `p.oldPrice === 13100`
4. Имя: test_product_maps_old_price_from_listing

Тест 2 (страж)
1. Поведение: `old_price` null — `oldPrice` отсутствует, зачёркнутой цены нет
   (легально зелёный в красном прогоне — страхует отсутствие лишнего значения)
2. Вход: baseDto с `old_price: null`
3. Ожидание: `p.oldPrice === undefined`
4. Имя: test_product_old_price_absent_without_old_price

## Прогоны

- **Красный**: `npm test` — 1 failed | 86 passed (87) — падает маппинг-тест; страж
  (`test_product_old_price_absent_without_old_price`) зелёный, как и задумано.
- **Зелёный**: `npm test` — 87 passed (13 файлов); `tsc --noEmit` чисто; `eslint`
  0 ошибок (15 прежних предупреждений).
- **Живой прогон** (dev :30034): бэк отдаёт `old_price` у всех 12 товаров страницы
  (11900 при цене 11100 и т.д.); на странице 12 зачёркнутых цен с теми же числами —
  «11 900 ₽», «16 200 ₽», «14 900 ₽», «13 500 ₽», «15 300 ₽».

## Ожидаемый результат

- Живой каталог: у товаров с `old_price` выше цены — зачёркнутая цена; у остальных
  как раньше (только обычная).
- Мок-страницы: зачёркнутые цены фабрик не меняются.
