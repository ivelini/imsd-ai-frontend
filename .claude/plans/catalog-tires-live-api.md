# Подключение /catalog/tires к API бэка (убрать мок-данные)

## Контекст

Страница каталога шин — единственное место с частично живыми данными: опции фильтра (`GET /api/reference/filter/tire`) уже с бэка, а товары (`getCatalogProducts`), гео (`getGeo`) и SEO (`getSeoContent`) — моки из `src/data/`. Цель — перевести страницу полностью на бэк, удалить мок-данные.

**Контракт бэка актуален в OpenAPI (21.08 15:01):** `delivery[]` (массив), `meta.seo = {title, description|null}`, `euro_label {rollingResistance, wetGrip, noiseEmission}|null`, `slug` у товара и `brand.slug`, `season|null`. Решения пользователя: SEO — мета → `<title>`/`<meta>` + h2 из `seo.title`, SeoBlock со страницы убирается; гео — глобально; **город в листинг — слагом `city=` в query** (бэк резолвит сам, без предварительного запроса гео и `resolveCityId` на фронте).

## Цель

1. `getCatalogProducts(filter, city?)` → `fetch GET /api/catalog/tires?…&city=<слаг>&per_page=12` — город слагом, без двуфазности; маппинг `meta` → `PaginatedResult` + `meta.seo`.
2. Бэк: `city` (слаг) в query листинга, резолв слага в контроллере (fallback — дефолтный город из `config/shop.php`); `city_id` остаётся для совместимости.
3. `getGeo` → `GET /api/reference/city` глобально (шапка/попап и `cityLabel` карточек); мок `src/data/geo.ts` удаляется.
4. Страница: `<title>`/`<meta description>` и h2 из `meta.seo.title/description` (бэк, предложный падеж); SeoBlock не рендерится на каталоге.
5. Чистка моков каталога; сохранение: `getTireModel`, auto-каскад, диски, а также `SeoBlock`/`getSeoContent` — их использует auto-страница (остаётся на моках, вне скоупа).

## Схема потока

```
page.tsx (Server Component, /catalog/tires/[[...params]])
  parseCatalogParams(params, searchParams) → FilterState (delivery — массив, уже есть)
  cityValue = searchParams.city (слаг, "chelyabinsk")
  Promise.all([ getGeo(), getCatalogFilters(), getCatalogProducts(filter, cityValue) ])   // один RTT, без двуфазности
    ├─ getGeo → fetch /api/reference/city → toGeoData → GeoData (для cityLabel карточек)
    ├─ getCatalogFilters → fetch /api/reference/filter/tire (уже живой)
    └─ getCatalogProducts(filter, "chelyabinsk")
         └─ fetch(`${apiBase()}/catalog/tires?${toTireListQuery(filter, cityValue)}&per_page=12`)
              → rewrites /api/* → imsd-backend-nginx → routes/api.php → GetTireListController
                 ├─ TireListRequest (city: слаг; delivery[] — массив)
                 ├─ резолв: city_id ?? City::where('slug', city)->first() ?? defaultCityName
                 ├─ TireListCacheService::remember (tire-list:v5, ключ по резолвленному id)
                 │    └─ GetTireList → TireProduct::byCatalogFilters + catalog_prices (БД)
                 └─ buildPayload: data (TireListItemResource) + meta{..., seo:{title, description}}
         ← TireListDto {data, meta{current_page,last_page,per_page,total,seo}}

  generateMetadata(params, searchParams) — те же геттеры, seo → title/description
  toTireProduct(dto) → TireProduct → ProductCard (/tires/[modelSlug]/[sizeSlug]?city=, cityLabel из geo)
  h2 «{seo.title}» («Шины и диски в Челябинске» / «Шины Michelin в Челябинске»); SeoBlock не рендерится
```

## Задачи

### Бэк: city-слаг в query листинга

- **`app/Http/Requests/Catalog/TireFilterValuesRequest.php`**: добавить `'city' => ['nullable', 'string', 'max:255']` (без `exists` — битый/старый слаг не должен давать 422; фолбэк на дефолтный город).
- **`app/Http/Controllers/Catalog/GetTireListController.php`**: резолв города до кеша:
  `$cityId ?? City::where('slug', $city)->first()?->id ?? defaultCityName` — приоритет `city_id` (существующая ссылка), затем `city`-слаг, затем дефолт из `config/shop.php`. `city` уходит из `$filters` (как `city_id`), чтобы не попасть в кеш-ключ фильтров.
- Кеш без изменений: ключ `tire-list:v5` по резолвленному `cityId`.
- Scramble-экспорт перегенерировать (query `city` подтянется из валидации).
- Бэк-тесты: см. тест-лист.

### Фронт: типы и адаптеры листинга

**`src/features/catalog/types/index.ts`** — добавить:
- `TireListItemDto` {id, name, slug (sizeSlug), brand {id,name,slug}, model {id,name,slug}|null, width|null, profile|null, diameter|null, season {label,value}|null, is_studded, euro_label|null, price|null, delivery_min|null, delivery_max|null, images [{id,url}]} — ровно как в `catalogListAdapter.test.ts` (разблокирует компиляцию). `euro_label` — тип `EuLabel {rollingResistance, wetGrip, noiseEmission}` (уже есть на фронте, `ProductBase.euLabel`).
- `TireListMetaDto {current_page, last_page, per_page, total, seo: {title, description|null} | null}`; `TireListDto {data, meta}`; `TireListSeo {title, description|null}`; `TireListResult extends PaginatedResult<TireProduct> {seo: TireListSeo|null}`.
- Правки `TireProduct`: `seasonLabel?`, `isStudded?`, `deliveryMin?`, `deliveryMax?`; `ProductBase.price` → `price?: number` (бэк: float|null) + guard в `ProductCard` (строки ~47–52: блок цен только при `typeof price === "number"`).

**`src/shared/api/catalog.ts`** — реализовать:
- `toTireListQuery(filter: FilterState, city?: string): string` — `width[]`/`profile[]`/`diameter[]` (массив по 1 элементу), `season`/`brand`/`country`/`studded` одиночные, `delivery[]` — массивом, `price_min`/`price_max`, `page`; **`city=<слаг>`** вместо `city_id` (только если задан); диаметр `"13c"` → `13c` без «r». Итог `toTireListQuery({}, "chelyabinsk") === "city=chelyabinsk"`.
- `toTireProduct(dto): TireProduct` — modelSlug = `model?.slug ?? ""`, sizeSlug = `dto.slug`, season/seasonLabel из `season`, image = `images[0]?.url ?? PLACEHOLDER`, price = `dto.price ?? undefined`, euLabel = `dto.euro_label ?? undefined`, diameter "13c"→13, sizeTitle `${width}/${profile} R${diameter}`, остальное — дефолты (code:"", year:"", quantity:0, parameters:[]).
- `resolveCityId` НЕ нужен (город резолвит бэк) — удалить из теста `catalogListAdapter.test.ts` (блок `describe("resolveCityId")`).

### Фронт: гео

**`src/shared/api/geo.ts`** — заменить мок: `getGeo()` → `fetch(/api/reference/city)` + `toGeoData(dto)`:
- `GeoCity {id: String(value), label, value: slug ?? String(value), regionId: String(region.id)}` — контракт `GeoData` не меняется (потребители: useGeo, GeoPopup, CityHydrator, resolveCityLabel, страницы — правок не требуют).
- `defaultCity/defaultCityValue` из `meta.default` (fallback — первый город).
- Типы `GeoCity/GeoRegion/GeoData` переносятся из `src/data/geo.ts` сюда; **удалить `src/data/geo.ts`** (единственный импорт — здесь).

### Фронт: страница

**`src/app/catalog/tires/[[...params]]/page.tsx`**:
- `Promise.all([getGeo(), getCatalogFilters(), getCatalogProducts(filter, cityValue)])` — один RTT.
- `<h2>{result.seo?.title ?? fallback}</h2>` — готовая строка от бэка (предложный падеж); fallback при seo=null — «Шины и диски».
- **`generateMetadata`** (тот же файл): те же геттеры, вернуть `{title: seo.title, description: seo.description}`. Дублирование запроса листинга — бэк кэширует; при необходимости свернуть общий загрузчик.
- Убрать `getSeoContent` из импортов и рендер `<SeoBlock>`.

### Чистка моков

- **`src/data/catalog.ts`**: удалить `getCatalogProductsMock` + локальную `PER_PAGE`. ОСТАЁТСЯ: `SEO_CONTENT`/`getSeoContentMock` (нужны auto-странице — вне скоупа), `BRANDS/MODELS`, `ALL_PRODUCTS` (нужен `getTireModel` и auto-каскаду), словари label, `ALL_DIAMETERS`, `DELIVERY_OPTIONS` (нужен `data/wheels.ts`), `getTireModel/getAutoResult/getCarBlock`.
- **`SeoBlock.tsx`, `src/shared/api/seo.ts`** — НЕ удаляются (auto-страница); убирается только использование на каталоге.
- В `src/shared/api/catalog.ts` убрать `getCatalogProductsMock` из импорта `@/data/catalog`.

## Тест-лист

### `tests/unit/catalogListAdapter.test.ts` (существующий, untracked)

Удалить `describe("resolveCityId")` (блока больше нет). Правки: `toTireListQuery({}, 1)` → `toTireListQuery({}, "chelyabinsk")` с ожиданием `city=chelyabinsk`; `city_id=1` → `city=chelyabinsk` в полном фильтре. Дополнить:

| Поведение | Вход | Ожидание | Имя |
|---|---|---|---|
| Пустой фильтр шлёт только city-слаг | toTireListQuery({}, "chelyabinsk") | "city=chelyabinsk" | `test_query_empty_filter_sends_only_city` (правка) |
| Полный фильтр: delivery[] массивом, city слагом | filter {width:215, delivery:["today","after5days"], season:"winter", page:2}, city "chelyabinsk" | содержит `delivery[]=today&delivery[]=after5days&city=chelyabinsk&width[]=215` | `test_query_full_filter_maps_all_fields` (правка) |
| C-диаметр уходит как есть, без «r» | filter {diameter:"13c"} | `diameter[]=13c`, без `r13c` | `test_query_c_diameter_passed_as_url_value` (без правок) |
| model=null не роняет адаптер | baseDto с model:null | modelSlug==="", title==="Bluearth E70B" | `test_product_null_model_fallback` (новый) |
| C-диаметр "13c" → число 13 | baseDto с diameter:"13c" | product.diameter===13 | `test_product_c_diameter_parsed` (новый) |
| euro_label → euLabel (1:1), null → undefined | baseDto с euro_label:{...} | product.euLabel === dto.euro_label; без euro_label — undefined | `test_product_maps_euro_label` (новый) |

### Новый `tests/unit/geoAdapter.test.ts`

| Поведение | Вход | Ожидание | Имя |
|---|---|---|---|
| Маппинг /reference/city: slug → value, id → String(value), регион | data:[{label:"Челябинск",value:7,slug:"chelyabinsk",region:{id:1,name:"Чел. обл"}}], meta.default:{label:"Челябинск",value:7} | cities[0]={id:"7",label,value:"chelyabinsk",regionId:"1"}; defaultCityValue==="chelyabinsk" | `test_maps_reference_city_to_geodata` |
| meta.default=null → дефолт из первого города | meta.default:null | defaultCity === первый label | `test_null_default_uses_first_city` |
| slug=null → value=String(value) | dto с slug:null, value:5 | value==="5" | `test_null_slug_falls_back_to_numeric_value` |
| Регионы без дублей | 2 города одного региона | regions.length===1 | `test_regions_deduplicated` |

### Переписать `tests/unit/catalog-city.test.ts` (сейчас тестирует мок-проброс)

| Поведение | Вход | Ожидание | Имя |
|---|---|---|---|
| fetch к живому API: URL с фильтром, city-слагом, per_page=12 | getCatalogProducts({width:215}, "chelyabinsk") | fetch вызван с URL, содержащим `width[]=215&city=chelyabinsk&per_page=12` | `test_products_fetch_live_api_with_city` |
| meta → PaginatedResult | ответ {meta:{current_page:2,per_page:12,total:30,seo:null}} | {page:2, perPage:12, total:30} | `test_products_maps_meta_to_paginated_result` |
| seo пробрасывается из meta | ответ с meta.seo:{title:"Шины в Челябинске",description:"..."} | result.seo.title === "Шины в Челябинске" | `test_products_passes_seo_through` |

### Бэк `backend/tests/Feature/Catalog/GetTireListTest.php`

| Поведение | Вход | Ожидание | Имя |
|---|---|---|---|
| city-слаг резолвится (цена/сео города) | GET /catalog/tires?city=chelyabinsk | 200; meta.seo.title содержит «Челябинск» | `test_accepts_city_slug` |
| Несуществующий слаг → дефолтный город, не 422 | GET /catalog/tires?city=unknown-slug | 200; seo дефолтного города | `test_unknown_city_slug_falls_back_to_default` |
| meta.seo {title, description}, title с городом | GET /catalog/tires | assert meta.seo.title содержит город | `test_returns_seo_payload` |
| delivery[] массивом сужает выборку | GET с delivery[]=today&delivery[]=after5days | 200, не 422 | `test_accepts_delivery_array` |
| slug у товара и brand — непустые | GET /catalog/tires | data[0].slug, data[0].brand.slug — строки | `test_returns_slug_fields` |

## Прогоны
- **Красный (15:15):** `Test Files 3 failed, Tests 17 failed` — catalogListAdapter (9), geoAdapter (4), catalog-city (4); все падают на отсутствующих символах (`toTireListQuery/toTireProduct/toGeoData is not a function`, `getCatalogProducts` не делает fetch). Реализация не создавалась.
- **Зелёный (15:17):** `Test Files 7 passed, Tests 39 passed` — полный прогон проекта (каталог + гео + city + filter + parse). Одна правка по ходу: URLSearchParams кодирует `[]` → `%5B%5D`, вернул каноничный `width[]=` replace'ом (тест-лист — контракт).
- **Бэк (15:20–15:23):** `GetTireListTest 36/36` (в т.ч. 2 новых: city-слаг резолв + fallback неизвестного слага). Правка по ходу: резолв города — только id до кеша (`value('id')`), модель — в closure (иначе кеш-hit даёт лишний запрос — ловится `test_response_is_cached`). Scramble-экспорт перегенерирован в docker-контейнере (`docker exec imsd-backend-app php artisan scramble:export-docs`; на хосте падает — нет pdo_pgsql): `city` в query, 56690 байт.
- **Финальный (15:24):** фронт `39/39` + tsc 0 + lint без новых предупреждений (3 errors — существующие setState-in-effect); бэк `377/380` (3 падения — `Admin/FileServiceTest`, GD-расширение не установлено на хосте, вне задачи). Моки удалены: `getCatalogProductsMock`+`PER_PAGE` (data/catalog.ts), `src/data/geo.ts`.
- **Рефакторинг:** чистка следствий nullable-price (`?? 0` в мок-сравнениях, `price?.` в рендере, `?? 0` в корзинных хуках); guard блока цен в ProductCard; `toHaveBeenCalledWith(stringContaining)` вместо доступа к mock.calls.

## Риски / проверки при реализации

- **Слаги городов в БД (данные, не код):** миграция `add_slug_to_cities` есть, сидера нет — города залиты через админку; slug nullable. Если слаги не заполнены — `city=chelyabinsk` упадёт в дефолтный город. **Сверить слаги в БД ДО перехода** (заполнить недостающие через админку/артизан).
- **Двукратный запрос листинга** (page + generateMetadata) — бэк кэширует `tire-list:v5`; при необходимости вынести общий загрузчик.
- **price=null** в листинге: `requireCityPrice` отсекает товары без цены города, но поле nullable — guard в карточке обязателен.
- **h2 без seo:** если `meta.seo` окажется null — fallback-строка без города.
- **Слаги шин:** `TireProduct.slug` — `brand-name-width-profile-diameter` (совпадает с тест-фикстурой). Сверить при живой проверке, что `/tires/[modelSlug]/[sizeSlug]` ведёт на мок-страницу модели (она вне скоупа).
