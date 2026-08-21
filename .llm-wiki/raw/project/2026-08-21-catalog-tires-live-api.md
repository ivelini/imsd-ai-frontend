# Подключение /catalog/tires к API бэка (реализация 21.08.2026)

> Source: план catalog-tires-live-api.md и реализация (коммит 21.08.2026, фронт + бэк)
> Collected: 2026-08-21
> Published: 2026-08-21

Страница каталога шин переведена с моков на живой API бэка. Контракт сверен с Scramble-экспортом `../backend/documentations/scramble/public-api.json` (актуализирован 21.08).

## Контракт GET /api/catalog/tires (публичный листинг)

- Query: `width[]`, `profile[]`, `diameter[]` (массивы), `season`, `studded`, `brand`, `country`, `delivery[]` (массив бакетов: today|between1and3days|between3and5days|after5days), `price_min`, `price_max`, `city_id` (int, существует для совместимости), `city` (слаг, без exists — несуществующий слаг фолбэчится на дефолтный город), `page`, `per_page` (10–100, дефолт 48; фронт шлёт 12), `sort_by` (price), `sort_dir`.
- Ответ: `data[]` — элемент `{id, name, slug (sizeSlug brand-name-width-profile-diameter), brand {id, name, slug}, model {id, name, slug}|null, width, profile, diameter (string, "17"|"13c"), season {label, value}|null, is_studded, euro_label {rollingResistance, wetGrip, noiseEmission}|null, price|null, delivery_min|null, delivery_max|null, images [{id, url}]}` + `meta {current_page, last_page, per_page, total, seo {title, description|null}}`.
- `meta.seo` — SEO-мета: title готовый (предложный падеж города эвристикой по суффиксам, при brand — «Шины Michelin в Челябинске»), description из бренда/конфига.
- Кеш ответа — на бэке (`tire-list:v5`), JSON-roundtrip в кеш (правило: в кеш только массивы/скаляры).
- Резолв города на бэке: `city_id` → `city`-слаг (`City::where('slug')->value('id')` до кеша, модель — только при промахе) → дефолт из `config/shop.php`.

## Гео GET /api/reference/city

- Ответ: `data[] {label, value (int — id города), slug|null, region {id, name}}` + `meta.default {label, value}|null`.
- Мок `src/data/geo.ts` (88 городов) удалён; типы GeoCity/GeoRegion/GeoData переехали в `src/shared/api/geo.ts`; адаптер `toGeoData` приводит к контракту GeoData (value = слаг, id = String(value)).

## Фронт (файлы)

- `src/shared/api/catalog.ts` — адаптеры живого листинга: `toTireListQuery(filter, city?)` (массивы `width[]=`, `delivery[]=` каноничным видом, `city=<слаг>`), `toTireProduct(dto)` (slug → sizeSlug, euro_label → euLabel c noiseEmission-числом, model=null → пустой modelSlug), `getCatalogProducts(filter, city?)` — fetch `/api/catalog/tires?...&per_page=12`, маппинг meta → PaginatedResult + seo.
- `src/shared/api/geo.ts` — `getGeo()` → fetch `/api/reference/city`, `toGeoData`.
- Страница `src/app/catalog/tires/[[...params]]/page.tsx` — один Promise.all (geo + filters + products; двуфазность убрана — город резолвит бэк), `generateMetadata` из `meta.seo` (title/description), h2 из `seo.title`, SeoBlock не рендерится.
- `SeoBlock` упрощён до `{title, subtitle}` (бренд подставляет бэк; хрупкий `subtitle.replace("Viatti", brand)` удалён). Используется auto-страницей; на каталог вернётся, когда бэк отдаст контентный блок.
- `price?` в ProductBase — nullable (бэк float|null): guard блока цен в ProductCard, `?? 0` в мок-сравнениях и корзинных хуках.
- Удалены моки: `getCatalogProductsMock` + `PER_PAGE` (data/catalog.ts), `src/data/geo.ts`. Остаются на моках: страница модели, auto-каскад, диски, `getSeoContent` (для auto-страницы).

## Тесты

- Фронт: `catalogListAdapter.test.ts` (query-маппинг, toTireProduct: model=null, C-диаметр, euro_label), `geoAdapter.test.ts` (маппинг /reference/city, default=null, slug=null, регионы), `catalog-city.test.ts` (fetch URL с city-слагом и per_page=12, meta → PaginatedResult, seo проброс).
- Бэк: `GetTireListTest` — city-слаг резолв + fallback неизвестного слага (не 422 → дефолт), seo-мета, delivery[]-массив, slug-поля.
- Scramble-экспорт генерится в docker-контейнере (`docker exec imsd-backend-app php artisan scramble:export-docs`; на хосте падает — нет pdo_pgsql).
