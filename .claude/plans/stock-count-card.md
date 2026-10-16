# Наличие в карточке каталога: count_in_stock из листинга

## Цель

Карточка каталога показывает «Наличие 0 шт.» у всех товаров: адаптер живого
листинга захардкожен (`quantity: 0` в `toTireProduct`). Бэк добавил в листинг
`count_in_stock` — строка «Наличие …» должна показывать реальное число.

## Вход / процесс / выход

- **Вход:** `count_in_stock: integer|null` (required) в DTO `GET /catalog/tires`
  (и `/catalog/wheels`, контракт public-api.json; живой бэк отдаёт числа: 40, 28, 8…).
- **Процесс:** DTO + `count_in_stock` → `quantity: dto.count_in_stock ?? null` →
  `ProductBase.quantity: number | null` → `ProductCard` рисует строку «Наличие N шт.»
  только при числе; `null` (неизвестно) — строки нет, как у плашек «Самовывоз»/ПВЗ.
- **Выход:** живая карточка показывает «Наличие 40 шт.»; хардкод 0 уходит.

## Схема

```
┌─ GET /catalog/tires/… — карточка каталога (Server Component) ─┐
│       │ getCatalogProducts(filter, city)                      │
│       ▼                                                       │
│  [api]  shared/api/catalog.ts · toTireProduct(dto)            │
│       │ quantity: dto.count_in_stock ?? null                  │
│       ▼  quantity: number | null                              │
│  [ui]   ProductCard · {quantity !== null && «Наличие N шт.»}  │
└───────┬───────────────────────────────────────────────────────┘
        │ fetch /api/catalog/tires (rewrites → бэк)
        ▼
┌─ ВНЕШНИЙ МИР ─────────────────────────────────────────────────┐
│  GET /api/catalog/tires → count_in_stock: 40 | null           │
└───────────────────────────────────────────────────────────────┘
```

## Задачи

1. `src/features/catalog/types/index.ts` — `TireListItemDto` + ключ
   `count_in_stock: number | null`; `ProductBase.quantity: number` → `number | null`
   (комментарий: null — бэк не назвал наличие).
2. `src/shared/api/catalog.ts` — `quantity: dto.count_in_stock ?? null` (хардкод 0).
3. `src/features/catalog/components/ProductCard.tsx` — строка «Наличие …» под
   условием `product.quantity !== null`.
4. `tests/unit/catalogListAdapter.test.ts` — тесты ниже; в `baseDto` добавить
   `count_in_stock`.
5. Моки (`data/catalog.ts`, `data/wheels.ts`) не меняются — фабрики уже задают
   числа (1–20), это и есть имитация ответа бэка.

Вне области: страница товара (свой `ProductDetailData`/`PRODUCT_STATIC`), листинг
дисков (мок; контракт wheels тоже получил `count_in_stock` — при переезде на живой
API маппинг тот же), поведение при 0 и доступность кнопки «В корзину» (в макете
только «Наличие N шт.» — состояния «нет в наличии» не выдумываем).

## Тест-лист

── toTireProduct: наличие из count_in_stock ────────────────────

Тест 1
1. Поведение: число из `count_in_stock` едет в `quantity` (карточка рисует
   «Наличие 40 шт.»); реализация, оставляющая хардкод 0, тест завалит
2. Вход: baseDto с `count_in_stock: 40`
3. Ожидание: `p.quantity === 40`
4. Имя: test_product_maps_quantity_from_count_in_stock

Тест 2
1. Поведение: `count_in_stock` null (бэк не назвал наличие) — `quantity === null`,
   карточка строку «Наличие …» не рисует (строка «Наличие null шт.» — дефект)
2. Вход: baseDto с `count_in_stock: null`
3. Ожидание: `p.quantity === null`
4. Имя: test_product_quantity_null_without_count_in_stock

## Прогоны

- **Красный**: `npm test` — 2 failed | 83 passed (85) — падают ровно новые тесты
  (`quantity` — хардкод 0: `0 !== 40`, `0 !== null`).
- **Зелёный**: `npm test` — 85 passed (13 файлов); `tsc --noEmit` чисто (нашлась
  вторая фикстура `TireListItemDto` в `catalog-city.test.ts` — ключ добавлен);
  `eslint` 0 ошибок (15 прежних предупреждений).
- **Живой прогон** (dev-контейнер :30034): шины `/catalog/tires?city=chelyabinsk` —
  «Наличие 40 шт.», «28», «40», «40», «8», «40» — числа из `count_in_stock`
  (совпадают с ответом API); диски `/catalog/wheels` (мок) — «Наличие 15/17/19/12 шт.».

## Ожидаемый результат

- Живой каталог: «Наличие 40 шт.» (число от бэка), при `null` — строки нет.
- Мок-страницы: «Наличие N шт.» как раньше (числа фабрик).
