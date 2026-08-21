# Каталог шин: живой API (листинг, гео, SEO-мета)

> Sources: План и реализация catalog-tires-live-api, 2026-08-21
> Raw: [catalog-tires-live-api](../../raw/project/2026-08-21-catalog-tires-live-api.md)

## Overview

Страница `/catalog/tires` полностью переведена на живой бэк: листинг `GET /api/catalog/tires`, гео `GET /api/reference/city`, фильтры `GET /api/reference/filter/tire` (было раньше). Моки листинга и гео удалены. Ключевое решение: город в query идёт **слагом `city=`**, бэк резолвит его сам — фронт не делает предварительный запрос гео для резолва id (один RTT на страницу).

## Контракт и адаптеры

- Ответ листинга: `data[]` (slug товара = sizeSlug `brand-name-width-profile-diameter`, `brand.slug`, `euro_label {rollingResistance, wetGrip, noiseEmission}|null`, `price|null`, `season {label, value}|null`, `model {id, name, slug}|null`) + `meta {current_page, last_page, per_page, total, seo {title, description|null}}`.
- `src/shared/api/catalog.ts`: `toTireListQuery(filter, city?)` — массивы `width[]=`/`delivery[]=` каноничным видом (URLSearchParams кодирует `[]` в `%5B%5D` — replace обратно), `city=<слаг>`; `toTireProduct(dto)` — маппинг с дефолтами (поля, которых нет на бэке: code/year/quantity — пустые; C-диаметр `"13c"` → число 13; `euro_label.noiseEmission` — строка от бэка → число); `getCatalogProducts(filter, city?)` — fetch + `per_page=12`, маппинг meta → PaginatedResult + seo.
- `src/shared/api/geo.ts`: `getGeo()` → fetch `/api/reference/city` + `toGeoData` (value = слаг, id = String(value), дефолт из meta.default с fallback на первый город; контракт GeoData не менялся — потребители шапки/попапа не трогались).

## Город в листинге

- Фронт: `?city=<слаг>` в URL (как было), передаётся в query листинга слагом.
- Бэк (GetTireListController): резолв `city_id` → `city`-слаг → дефолт `config/shop.php`. Валидация `city` без `exists` — несуществующий слаг не даёт 422, фолбэк на дефолтный город (старые/битые ссылки не ломают страницу).
- Резолв id до кеша (`City::where('slug')->value('id')` — лёгкий запрос), модель загружается только при промахе кеша — кеш-hit без лишних запросов (проверяется тестом `test_response_is_cached`).
- Двухфазность запросов на странице (geo → products для резолва city_id) не понадобилась — бэк резолвит сам.

## SEO

- `meta.seo {title, description}` — мета-заголовок и описание страницы: title готовый от бэка (предложный падеж города эвристикой по суффиксам «в Челябинске», при выбранном brand — «Шины Michelin в Челябинске»).
- Фронт: `generateMetadata` (title/description в head) + `h2` страницы из `seo.title`.
- Визуальный `SeoBlock` упрощён до `{title, subtitle}` — бренд в subtitle подставляет бэк (фронтовая подстановка `replace("Viatti", brand)` удалена как хрупкая). На каталоге пока не рендерится — бэк готовит контентный блок.

## Ограничения и риски

- Слаги городов в БД nullable (сидера нет) — если не заполнены, `city=<слаг>` фолбэчится на дефолт; URL-слаги должны совпадать с БД.
- `price|null` — блок цен в карточке рендерится только при числе (`typeof price === "number"`); в корзинных хуках `?? 0`.
- Scramble-экспорт генерится в docker (`docker exec imsd-backend-app php artisan scramble:export-docs`) — на хосте нет pdo_pgsql.

## See Also

- [city-request-context](city-request-context.md) — город в URL; резолв переехал с фронта на бэк
- [api-barrel-data-ts](api-barrel-data-ts.md) — баррел, подключение API без правки потребителей
- [project-architecture](project-architecture.md) — карта проекта, состояние подключения
