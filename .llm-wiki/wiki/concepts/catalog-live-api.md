# Каталог шин: живой API (листинг, гео, SEO-мета)

> Sources: План и реализация catalog-tires-live-api, 2026-08-21; плашка «Самовывоз» из origin.delivery_days_after_order, 2026-10-15; живые поля карточки (ПВЗ, наличие, зачёркнутая цена), 2026-10-16
> Raw: [catalog-tires-live-api](../../raw/project/2026-08-21-catalog-tires-live-api.md); [pickup-badge-card](../../raw/project/2026-10-15-pickup-badge-card.md); [catalog-card-live-fields](../../raw/project/2026-10-16-catalog-card-live-fields.md)

## Overview

Страница `/catalog/tires` полностью переведена на живой бэк: листинг `GET /api/catalog/tires`, гео `GET /api/reference/city`, фильтры `GET /api/reference/filter/tire` (было раньше). Моки листинга и гео удалены. Ключевое решение: город в query идёт **слагом `city=`**, бэк резолвит его сам — фронт не делает предварительный запрос гео для резолва id (один RTT на страницу).

## Контракт и адаптеры

- Справочник фильтра `GET /api/reference/filter/tire` с 21.08.2026 отдаёт value размеров с префиксами (`w185`, `p60`, `r15`) — 1:1 с сегментами URL; `toFilterOptions` (`sizeOpts`) нормализует голое число в префикс (`185` → `w185`) — переходный период до обновления бэка (см. [catalog-url-grammar](catalog-url-grammar.md)).
- Ответ листинга: `data[]` (slug товара = sizeSlug `brand-name-width-profile-diameter`, `brand.slug`, `euro_label {rollingResistance, wetGrip, noiseEmission}|null`, `price|null`, `old_price|null` (зачёркнутая цена), `count_in_stock|null` (наличие), `season {label, value}|null`, `model {id, name, slug}|null`, `origin {vendor, manufacture_country, manufacture_year, delivery_days_after_order}|null` — каждая запись `{badge, description|null}`; `origin.pick_up {pick_up_point {badge, description|null}}` — вложенность на уровень глубже) + `meta {current_page, last_page, per_page, total, seo {title, description|null}}`.
- `src/shared/api/catalog.ts`: `toTireListQuery(filter, city?)` — массивы `width[]=`/`delivery[]=` каноничным видом (URLSearchParams кодирует `[]` в `%5B%5D` — replace обратно), `city=<слаг>`; `toTireProduct(dto)` — маппинг с дефолтами (поля, которых нет на бэке: code/year — пустые; `quantity` — из `count_in_stock`; C-диаметр `"13c"` → число 13; `euro_label.noiseEmission` — строка от бэка → число); `getCatalogProducts(filter, city?)` — fetch + `per_page=12`, маппинг meta → PaginatedResult + seo.
- Плашка «Самовывоз» карточки (15.10.2026): `origin.delivery_days_after_order` → `toOriginParam("Самовывоз", …)` → поле `pickup: ProductParam|null` на `ProductBase` (в `parameters` не дублируется); рендер — `BadgeValue` (есть `description` → `ParamBadge` с попапом, нет → сухой `p-badge`), общий для параметров карточки и страницы товара. `pickup: null` — строка скрыта. Мок-страницы (диски, автоподбор, модель) плашку получают из мока (`PICKUP_BADGE` в `data/catalog.ts`).
- Живые поля карточки (16.10.2026): `origin.pick_up.pick_up_point` → `pvzDelivery` (строка «Доставка до ПВЗ», `BadgeValue` с попапом; null — строки нет; мок — `PVZ_BADGE`); `count_in_stock|null` → `quantity: number|null` («Наличие N шт.» только при числе); `old_price|null` → `oldPrice` (зачёркнутая цена под условием `oldPrice > price`).
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
- Описания плашек-попапов — HTML (фронт рендерит разметку через `ParamBadge`); у бэка `cityText` (срок доставки) и настройки ПВЗ — простой текст с `\n` — правка передана в бэкенд (`cityText` → `<br>` + `e()`, настройки → `nl2br`); до неё переносы в попапах «ПВЗ»/«Самовывоз» теряются.
- `price|null` — блок цен в карточке рендерится только при числе (`typeof price === "number"`); в корзинных хуках `?? 0`.
- Scramble-экспорт генерится в docker (`docker exec imsd-backend-app php artisan scramble:export-docs`) — на хосте нет pdo_pgsql.

## See Also

- [city-request-context](city-request-context.md) — город в URL; резолв переехал с фронта на бэк
- [api-barrel-data-ts](api-barrel-data-ts.md) — баррел, подключение API без правки потребителей
- [project-architecture](project-architecture.md) — карта проекта, состояние подключения
