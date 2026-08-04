# План: /catalog/wheels — каталог дисков — ✅ ВЫПОЛНЕНО 04.08.2026

## Контекст

Сейчас `/catalog/wheels` — заглушка (`Placeholder`). Шаблона `.template/` для дисков нет.
Функционал 1:1 как у шин, отличия — в API эндпоинтах и полях фильтра.

## Данные из шаблона (фильтр дисков)

Из предоставленного HTML: `.catalog-filter-cont` содержит:

| # | Поле | Placeholder | Тип |
|---|---|---|---|
| 1 | Диаметр | Диаметр | select |
| 2 | Ширина | Ширина | select |
| 3 | PCD | PCD (крепеж) | select |
| 4 | ET | ET (вылет) | select |
| 5 | D ступицы | D (Ступица) | select |
| 6 | Тип дисков | Тип дисков | select |
| 7 | Производитель | Производитель | select |
| 8 | Цена (от/до) | 1364 — 61650 | inputs + slider |
| 9 | Подобрать | — | button.get-result |
| 10 | Сброс | — | a.remove-filters |

**Отличие от шин:** только набор полей фильтра (нет сезона/типа/профиля, вместо них PCD/ET/D/тип дисков).  
**Автосабмит как у шин** — `onChange` на каждом селекте сразу применяет фильтр, без кнопки «Подобрать».

Примечание: в HTML используются PrimeReact-компоненты (`p-dropdown`, `p-slider`), но мы строим на нативных `<select>` + нашем `PriceSlider`.

## План

### Шаг 1. Типы `src/features/catalog/types/index.ts`

- `WheelFilterState` — поля: `diameter?, width?, pcd?, et?, hubBore?, wheelType?, brand?, country?, priceMin?, priceMax?, delivery?, page?`
- `WheelFilterOptions` — опции: `diameters`, `widths`, `pcds`, `ets`, `hubBores`, `wheelTypes`, `brands`, `countries`, `delivery`, `priceMin`, `priceMax`
- `WheelProduct` — поля отображения + размерные (diameter, width, pcd, et, hubBore, wheelType)

### Шаг 2. Данные `src/data/wheels.ts`

- 3-4 бренда дисков (Replica, K&K, Скад, КиК)
- Значения: R13-R20, J-width (5.0-10.0), PCD (4x100, 5x112, 5x114.3...), ET (0-50), D ступицы (54.1, 57.1, 60.1...), типы (litoy/kovanyy/shtampovannyy)
- ~200 товаров: комбинации бренд × размеры
- `getWheelsFilterOptions()` → `WheelFilterOptions`
- `getWheelsProducts(filter)` → фильтрация + пагинация

### Шаг 3. API `src/shared/api/data.ts`

- `getWheelsFilters(): Promise<WheelFilterOptions>`
- `getWheelsProducts(filter: WheelFilterState): Promise<PaginatedResult<WheelProduct>>`

### Шаг 4. Адаптация `CatalogFilter` под `category` проп

Добавляем проп `category?: "tires" | "wheels"` (default `"tires"`).

Вкладка «По параметрам» для `wheels` — те же 6 селектов (кол-во как у шин):
- Диаметр, Ширина, PCD, ET, D ступицы, Тип дисков, Производитель (7 селектов, у шин тоже 6+1)

Вкладка «По автомобилю» — **присутствует**, работает как у шин:
- Каскад марка→модель→год→модификация (для колёс — свой auto-словарь)
- Те же селекты с `goAuto()`, та же структура URL `/catalog/wheels/auto/...`

PriceSlider, чекбоксы доставки, страна бренда, город, кнопка сброса — без изменений.  
Автосабмит на `onChange` — без изменений.  
CSS-классы и DOM-структура — 1:1 с шинами.

**Расширение типов:** `FilterOptions` += `pcds`, `ets`, `hubBores`, `wheelTypes`.  
`FilterState` += `pcd?`, `et?`, `hubBore?`, `wheelType?`.  
Для шин эти поля `undefined`/`[]` — обратная совместимость.

### Шаг 5. Роут `/catalog/wheels/[[...params]]`

Заменить `wheels/page.tsx` на `wheels/[[...params]]/page.tsx`:
- Серверная страница, структура как `tires/[[...params]]/page.tsx`
- `parseWheelsParams()` + `getWheelsFilters()` + `getWheelsProducts()`
- `<WheelsFilter>` + `<ProductCard>` + `<Pagination>`

### Шаг 6. URL-утилиты `parseParams.ts`

- `parseWheelsParams(params, searchParams)` — парсинг сегментов: diameter, width, pcd, et, hubBore, wheelType, brand
- `buildWheelsUrl(filter, cityValue?)` — `/catalog/wheels/...` + query (city, price, delivery, country, page)
- `buildQueryString` для wheels — переиспользуем ту же функцию (работает query-параметрами)

### Шаг 7. Верификация

- `npx tsc --noEmit`
- `/catalog/wheels` — товары, фильтр автосабмитом, pagination, city

## Файлы

| Действие | Файл |
|---|---|
| **Создать** | `src/data/wheels.ts` |
| **Создать** | `src/app/catalog/wheels/[[...params]]/page.tsx` |
| **Удалить** | `src/app/catalog/wheels/page.tsx` |
| **Модифицировать** | `src/features/catalog/types/index.ts` — WheelProduct, расширить FilterState/FilterOptions |
| **Модифицировать** | `src/features/catalog/components/CatalogFilter.tsx` — category prop |
| **Модифицировать** | `src/shared/api/data.ts` — wheels API |
| **Модифицировать** | `src/shared/lib/parseParams.ts` — parseWheelsParams, buildWheelsUrl

---

## Факт выполнения (04.08.2026)

### ✅ Сделано
- `src/data/wheels.ts`: 4 бренда (Replica, K&K, Скад, Dezent), ~200 товаров, фильтр-опции, auto-словарь BMW/Audi/Mercedes/Toyota
- `src/shared/api/data.ts`: `getWheelsFilters`, `getWheelsProducts`, `getWheelsAutoBrands/Models/Years/Modifications`, `fetchWheelsAutoResult`, `getWheelsCarBlock`
- Типы: `ProductBase` (общий для шин/дисков), `WheelProduct`, расширение `FilterState`/`FilterOptions` (pcd/et/hubBore/wheelType)
- `CatalogFilter`: проп `category`, условные селекты (wheels: диаметр/ширина/PCD/ET/D/тип/бренд), `autoBase`/`buildUrl`
- `parseParams`: `parseWheelsParams`, `buildWheelsUrl`
- `useAutoBrands(category)` — параметризованный хук
- `ProductCard`: `ProductBase` вместо `TireProduct`, `sizeSlug` из данных, `categoryPath`
- `useFilterStore`: раздельные сторы для шин (`filterParams`/`filterAuto`/`autoFilter`) и дисков (`wheelsFilterParams`/`wheelsFilterAuto`/`wheelsAutoFilter`)
- Роуты: `/catalog/wheels/[[...params]]` + `/catalog/wheels/auto/[[...auto]]`
- `DELIVERY_OPTIONS` экспортирован из `catalog.ts`, переиспользован в `wheels.ts`

### ⚠️ Требует доработки
- `fetchWheelsAutoResult` (и `fetchAutoResult`) не фильтруют результат по цене/доставке/стране

### Инциденты
- Двойной слеш в URL авто-каскада: `autoBase` уже с `/`, `router.push(/${path})` добавлял второй — фикс: `` `${path}${qs}` ``
- Чекбоксы доставки не грузились для дисков: `delivery: []` → импорт `DELIVERY_OPTIONS` из `catalog.ts`
- Фильтры шин/дисков пересекались: `useFilterStore` разделён на tires/wheels
- `ProductBase.width: number | string` сломал `sort((a,b) => a-b)` в `catalog.ts` — фикс: `Number(p.width)`
