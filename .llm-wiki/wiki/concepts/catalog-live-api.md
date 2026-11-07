# Каталог (шины и диски): живой API (листинг, гео, SEO-мета, авто-подбор)

> Sources: План и реализация catalog-tires-live-api, 2026-08-21; плашка «Самовывоз» из origin.delivery_days_after_order, 2026-10-15; живые поля карточки (ПВЗ, наличие, зачёркнутая цена), 2026-10-16; каталог дисков на живом API, 2026-10-16; страница модели шин на живом API, 2026-10-16; фото товаров из API, 2026-10-16; подбор шин по автомобилю на живом API, 2026-10-20; подбор дисков по автомобилю на живом API, 2026-10-20; слаги Vehicle в URL, 2026-10-20; карточка товара шин и дисков на живом API, 2026-10-22; бейджи товара на фронте, 2026-10-23; бейджи во всех зонах витрины (листинг, подбор, карточка модели), 2026-10-27; блок статьи в зонах витрины, 2026-11-07
> Raw: [catalog-tires-live-api](../../raw/project/2026-08-21-catalog-tires-live-api.md); [pickup-badge-card](../../raw/project/2026-10-15-pickup-badge-card.md); [catalog-card-live-fields](../../raw/project/2026-10-16-catalog-card-live-fields.md); [wheels-live-migration](../../raw/project/2026-10-16-wheels-live-migration.md); [tire-model-live](../../raw/project/2026-10-16-tire-model-live.md); [catalog-photos](../../raw/project/2026-10-16-catalog-photos.md); [auto-selection-live](../../raw/project/2026-10-20-auto-selection-live.md); [wheel-by-vehicle](../../raw/project/2026-10-20-wheel-by-vehicle.md); [vehicle-slugs](../../raw/project/2026-10-20-vehicle-slugs.md); [product-card-live](../../raw/project/2026-10-22-product-card-live.md); [product-badges](../../raw/project/2026-10-23-product-badges.md); [badges-zones-front](../../raw/project/2026-10-27-badges-zones-front.md); [article-block-zones](../../raw/project/2026-11-07-article-block-zones.md)

## Overview

Страница `/catalog/tires` полностью переведена на живой бэк: листинг `GET /api/catalog/tires`, гео `GET /api/reference/city`, фильтры `GET /api/reference/filter/tire` (было раньше). Моки листинга и гео удалены. Ключевое решение: город в query идёт **слагом `city=`**, бэк резолвит его сам — фронт не делает предварительный запрос гео для резолва id (один RTT на страницу). С 16.10.2026 так же живёт каталог дисков (`/catalog/wheels`) и страница модели шин (`/tires/<бренд>/<модель>`) с типоразмерами из листинга. С 20.10.2026 живой автоподбор шин и дисков (`/catalog/tires|wheels/auto`): справочники Vehicle + результат с размерами/спецификациями и товарами. С 22.10.2026 живы карточки товара: `/tires/{бренд}/{модель}/{слаг позиции}` и `/wheels/{бренд}/{слаг без бренда}`; товарные моки удалены. С 23.10.2026 бейджи — общий объект фронта в `shared/`: пришёл в `data` объект `badges` — страница выводит плашки (ADR 0008).

## Контракт и адаптеры

- Справочник фильтра `GET /api/reference/filter/tire` с 21.08.2026 отдаёт value размеров с префиксами (`w185`, `p60`, `r15`) — 1:1 с сегментами URL; `toFilterOptions` (`sizeOpts`) нормализует голое число в префикс (`185` → `w185`) — переходный период до обновления бэка (см. [catalog-url-grammar](catalog-url-grammar.md)).
- Ответ листинга: `data[]` (slug товара = sizeSlug `brand-name-width-profile-diameter`, `brand.slug`, `euro_label {rollingResistance, wetGrip, noiseEmission}|null`, `price|null`, `old_price|null` (зачёркнутая цена), `count_in_stock|null` (наличие), `season {label, value}|null`, `model {id, name, slug}|null`, `origin {vendor, manufacture_country, manufacture_year, delivery_days_after_order}|null` — каждая запись `{badge, description|null}`; `origin.pick_up {pick_up_point {badge, description|null}}` — вложенность на уровень глубже) + `meta {current_page, last_page, per_page, total, seo {title, description|null}}`.
- `src/shared/api/catalog.ts`: `toTireListQuery(filter, city?)` — массивы `width[]=`/`delivery[]=` каноничным видом (URLSearchParams кодирует `[]` в `%5B%5D` — replace обратно), `city=<слаг>`; `toTireProduct(dto)` — маппинг (`quantity` — из `count_in_stock`; C-диаметр `"13c"` → число 13; `euro_label.noiseEmission` — строка от бэка → число); `getCatalogProducts(filter, city?)` — fetch + `per_page=12`, маппинг meta → PaginatedResult + seo. Мок-поля `code/country/countryLabel/year/brandId` удалены из `ProductBase` 22.10.2026.
- Плашка «Самовывоз» карточки (15.10.2026): `origin.delivery_days_after_order` → `toOriginParam("Самовывоз", …)` → поле `pickup: ProductParam|null` на `ProductBase` (в `parameters` не дублируется); рендер — `BadgeValue` (есть `description` → `ParamBadge` с попапом, нет → сухой `p-badge`), общий для параметров карточки и страницы товара. `pickup: null` — строка скрыта. Все живые листинги, модель, авто-подбор и карточка товара (22.10.2026) получают плашку из `origin`; мок-константы `PICKUP_BADGE`/`PVZ_BADGE` удалены вместе с `data/catalog.ts`.
- Живые поля карточки (16.10.2026): `origin.pick_up.pick_up_point` → `pvzDelivery` (строка «Доставка до ПВЗ», `BadgeValue` с попапом; null — строки нет; мок — `PVZ_BADGE`); `count_in_stock|null` → `quantity: number|null` («Наличие N шт.» только при числе); `old_price|null` → `oldPrice` (зачёркнутая цена под условием `oldPrice > price`).
- `src/shared/api/geo.ts`: `getGeo()` → fetch `/api/reference/city` + `toGeoData` (value = слаг, id = String(value), дефолт из meta.default с fallback на первый город; контракт GeoData не менялся — потребители шапки/попапа не трогались).

## Город в листинге

- Фронт: `?city=<слаг>` в URL (как было), передаётся в query листинга слагом.
- Бэк (GetTireListController): резолв `city_id` → `city`-слаг → дефолт `config/shop.php`. Валидация `city` без `exists` — несуществующий слаг не даёт 422, фолбэк на дефолтный город (старые/битые ссылки не ломают страницу).
- Резолв id до кеша (`City::where('slug')->value('id')` — лёгкий запрос), модель загружается только при промахе кеша — кеш-hit без лишних запросов (проверяется тестом `test_response_is_cached`).
- Двухфазность запросов на странице (geo → products для резолва city_id) не понадобилась — бэк резолвит сам.

## Диски (16.10.2026)

- Листинг `GET /api/catalog/wheels` и фильтр `GET /api/reference/filter/wheel` — живые;
  страница `/catalog/wheels` получила `generateMetadata`/h2 из `meta.seo` (был хардкод).
- Адаптеры `toWheelFilterOptions`/`toWheelListQuery`/`toWheelProduct` в
  `shared/api/catalog.ts`; `OriginDto` — общий с шинами (переименован из `TireOrigin`:
  форма origin у листингов одна).
- Значения фасетов нормализуются под URL/селекты: диаметр-фасет — integer (15) → `r15`,
  decimal-строки («7.0», «40.0») → числа; в query decimal-поля уходят числами — бэк
  нормализует их сам (`WheelProductBuilder::normalizeDecimal`, сравнение с БД:
  «40» = «40.0»). Тип дисков — `alloy|steel|forged` (у мока были litoy/kovanyy/
  shtampovannyy).
- Карточки дисков с 22.10.2026 ведут на `/wheels/{бренд}/{слаг без бренда}`
  (страница товара диска появилась); «Код товара» в листинге скрыт (поля нет в
  контракте листинга, но оно есть в карточке товара — `ean`). С 20.10.2026
  авто-подбор дисков — живой (см. раздел ниже); мок-файл `src/data/wheels.ts` удалён.

## Модель шины (16.10.2026)

- `GET /api/catalog/tire-models/{brand}/{model}` — `{brand}` слаг бренда, `{model}`
  **короткий** слаг (в листинге `model.slug` полный — префикс бренда срезается
  `toShortModelSlug`); ответ: name/brand/image_url/params [{name, value}]/description
  (HTML|null)/`diameters [{value: "17", count}]`/meta.seo; нет модели → 404.
- Маршруты фронта — схема бэка: `/tires/[brandSlug]/[modelSlug]` (модель) и
  `…/[sizeSlug]` (товар — live с 22.10.2026); старые `/tires/[modelSlug]…` удалены,
  ссылки карточек и крошки обновлены. `ProductBase` + `brandSlug`, `modelSlug` —
  короткий (и у дисков: поле общее).
- Размеры модели — листинг с `model=<короткий>&brand=<слаг>&diameter[]=<число>&city`
  (`getTireModelSizes`, per_page=100); count модели сходится с `meta.total`.
- Тип `TireModelData` переехал из мока; мок `getTireModel` удалён, слаги моделей мока
  укорочены. `ModelSizes` — живые пропсы (диаметры+count, размеры активной вкладки);
  `ModelDescription` — обёртка `.model-description-image` (правило макета 300px) и
  HTML-описание. С 22.10.2026 размеры модели ведут на живую карточку товара
  (`showLink` включён).

## Авто-подбор шин (20.10.2026)

- Справочники: `GET /api/reference/vehicle/makes` (марки с размерами категории),
  `.../makes/{make}/models` (`slug` + `label` с поколением),
  `.../makes/{make}/models/{model}/years`,
  `.../makes/{make}/models/{model}/modifications?year=`; `category` по умолчанию `tire`.
- Результат: `GET /api/catalog/tires/by-vehicle/{make}/{model}/{year}/{modification}` —
  `vehicle {make, model, modification, year, title}` (со `slug`),
  `sections [{type, car_block_label, result_label, options}]`,
  `meta {city, seo, offers_per_option, total_offers}`. Опция: `key`, `label`, `sizes`,
  `offers [{front, rear|null}]`, `offers_total`.
- Адресация — слагами: `/catalog/tires/auto/{make}/{model}/{year}/{modification}`
  (`acura/integra/1999/1-8i`); числовой `id` — legacy-fallback, страница редиректит
  его на слаг (307). Слаги: `Str::slug(name)`; поколения — `integra-iv`,
  `mdx-ii-yd2`; модификации — `1-8i`, `1-5-t`; стабильны при переимпорте.
  Store `catalog-filter` — v4.
- Слой: `shared/api/vehicle.ts` (`getVehicle*`, `toVehicleSelection`,
  `toVehicleSelectionQuery` — цена/доставка/страна/город, без размерных фильтров);
  `shared/lib/autoUrl.ts` (парсер/сборка пути); типы —
  `features/catalog/types/vehicle.ts`.
- Секции: импортные `stock`/`oem` → OEM («Рекомендация производителя»),
  `optional`/`replacement`/`tuning` → «Лучшая альтернатива»; альтернативы собираются
  на чтении, Front/Rear паруются по порядку `id`; комплект — только полная пара одной
  модели; лимит 12 товаров на опцию; пустые опции/секции не возвращаются.
- Товары — поля листинга (`TireListItemResource` + `ListingDeliveryEnricher`),
  карточки через `toTireProduct`; фильтры сайдбара применяет бэк; размеры задаёт
  автомобиль.
- Страница: уровни 0–3 — по одному справочнику, уровень 4 — результат; H1/meta из
  `vehicle.title`/`meta.seo`; пустая выдача — «не найдено» с сайдбаром.
- Моки `AUTO_*`, `getAuto*`, `fetchAutoResult`, `getCarBlock` и SEO-мок удалены;
  `useAutoBrands`/`useAutoCascade` для шин — live, для дисков — моки; store
  `catalog-filter` v2 сбрасывает старые слаг-значения.
- Проверка: 44 теста бэка, 103 теста фронта, tsc/lint чисто, build 22 маршрута;
  живой прогон `Acura CDX 1.5 T, 2016` — OEM 235/50 R18 (4 карточки) + альтернатива
  235/45 R19. Ограничения: CSV — только Acura/Alfa Romeo; `car_block_label`
  альтернативы — «Альтернатива» (в макете «Лучшая альтернатива»);
  `meta.seo.description` null — SEO-блок скрыт.

## Авто-подбор дисков (20.10.2026)

- `GET /api/catalog/wheels/by-vehicle/{make}/{model}/{year}/{modification}` — тот же
  контур секций/опций; спецификации: `width` (строка), `diameter`, `et`, `pcd`,
  `hub_diameter`, `bolts`, `position`; label старого сайта
  `16x6.5/5x114.3 D64.1 ET45`; товары — `WheelListItemResource`.
- Правило подбора: диаметр/PCD точно, ширина от спеки до +0.5, ET −5…+3,
  hub ≥ ступицы; пары Front/Rear — по порядку `id`, только полная пара одной модели;
  лимит 12 товаров на опцию.
- Фронт: `getVehicleWheelSelection`/`toWheelSelection` (адаптер `toWheelProduct`);
  страница `/catalog/wheels/auto/{make}/{model}/{year}/{modification}`; справочники
  `category=wheel`; H1/meta из `meta.seo`; пусто — «дисков не найдено»; numeric URL —
  legacy-редирект.
- Хуки `useAutoBrands`/`useAutoCascade` — оба каскада live на слагах;
  `data/wheels.ts` удалён; store `catalog-filter` v4.
- Проверка: 3 теста дисков (108 всего), build 22 маршрута; живой прогон
  `/catalog/wheels/auto/acura/ilx/2017/2-0i` — OEM + две альтернативы;
  numeric `/1/5/2017/54` → 307; фильтры, пустая выдача и 404 проверены.
  Ограничение: у части модификаций нет товаров под допуски — пустая выдача.

## Карточка товара (22.10.2026)

- Эндпоинты: `GET /api/catalog/tires/{brand}/{model}/{size}` и
  `GET /api/catalog/wheels/{brand}/{size}`; у шины `{size}` — полный слаг позиции,
  у диска — слаг без префикса бренда. `{brand}`/модель бэк сверяет со слагами товара,
  несовпадение → 404. `city` — query, как у листинга; цена/наличие — города.
- Ответ: поля листинга + полная галерея `images[]`, `load_index`/`speed_index`/
  `is_runflat`, `description` модели (plain text|null), `delivery`,
  `count_in_stock`, `meta.seo`. `delivery`/`count_in_stock`/плашки origin ставит
  `ListingDeliveryEnricher` вне кеша (живой срок не устаревает в кеше).
- Настройки витрины `GET /api/reference/store` (6 ключей `settings`): адрес/часы,
  тексты «Наличие/Доставка/Гарантия», подпись доставки. Сбой эндпоинта карточку не
  валит — пустые значения, соответствующие вкладки и блок адреса скрыты.
- `shared/api/product.ts`: `getProduct(route, city)` → `{product, seo} | null`
  (404 → null → `notFound()`), `getStoreSettings()`, `toProductDetail`;
  `shared/api/origin.ts` — общий `toOriginParam` для листинга и карточки.
- `ProductDetailData` — самостоятельный тип отображения (не наследует `TireProduct`),
  общий для шин и дисков: title/images/parameters/цена/наличие/pickupDate/тексты/
  description. Параметры собирает адаптер: `ean`, origin-бейджи с попапами, размеры,
  сезон, индексы «94V», шипы и RunFlat «Да/Нет» (шина); ширина/PCD/ET/ступица/тип/
  цвет (диск). «Страна бренда» не выводится — данных нет.
- `pickupDate` — готовая строка `origin.delivery_days_after_order.badge`; дата на
  фронте не вычисляется. `quantityOptions` — композиция из `price` (1–4 шт.).
- Вкладки — `productTabs`: «Описание» только при непустом описании, «НАЛИЧИЕ»/
  «Доставка»/«Гарантия» — при непустых текстах, «Оплата» — как в макете, «Отзывы» нет.
  Описание рендерится текстом (plain text XLSX), не HTML.
- Адреса mirror API (ADR 0007): шина — `/tires/{бренд}/{модель}/{слаг позиции}`;
  диск — `/wheels/{бренд}/{слаг без бренда}`. Шина без модели — сегмент `-`
  (бэк при `model = null` его не сверяет). Ссылки карточек — `productUrl`
  (`features/catalog/lib/productUrl.ts`); включены в листинге дисков, размерах модели
  и автоподборе.
- Старая цена — только при `old_price > price`; «Наличие»/«Самовывоз»/блок адреса
  скрываются при отсутствии данных.
- Удалены `data/catalog.ts`, `ALL_PRODUCTS`, `PRODUCT_STATIC` и генераторы текстов,
  поля `TireProduct.loadIndex/speedRating/tireType`, неиспользуемый `CategorySection`.
- Проверка: 117 тестов, tsc/lint чисто, build успешно; живые шина/диск — 200,
  чужие слаги — 404; `/reference/store` — 200.

## Бейджи: страница выводит плашки, если в data пришёл badges (23.10.2026)

- Контракт: в карточке товара бэк отдаёт `data.badges` — список элементов
  `{text, color, icon_key, link, owner_type, owner_name}`. Стек наследуется по цепочке
  «товар → модель → бренд», дедуп по баджу (частный уровень выигрывает), порядок и
  состав собирает бэк (`BadgeStackReader`) — фронт не фильтрует и не сортирует.
- Правило фронта (ADR 0008): **пришёл в `data` объект `badges` — страница выводит
  плашки**; «зоны показа» определяет бэк (положил поле в ответ — плашки появились).
  С 27.10.2026 бэк отдаёт поле **во всех зонах витрины**: карточка товара, листинг шин и
  дисков, офферы подбора по автомобилю, карточка модели. Промо-полоса главной и статья —
  остаются на моке (`HOME_DATA.badges`): владелец уровня «сайт» в бэке не заведён (ТЗ
  `documentations/tz/badges-zones-backend.md`, п. 5 раздела 5).
- Ядро: `shared/types/badge.ts` (форма элемента), `shared/ui/badgeView.ts` (чистая функция
  представления: класс, иконка, ссылка), `shared/ui/Badge.tsx` (плашка и полоса `.benefits`;
  без знания о товаре и каталоге). Зона подключается одной строкой `<Badges … />`.
- Разметка плашки — из шаблона: полоса `.benefits`, плашка `benefit benefit--{color}` +
  иконка + текст. Пресеты `BadgeColor` бэка (`red|gold|green`) совпадают с классами
  шаблона один в один (`#dd062a|#ffc10a|#178e42`) — словарей отображения на фронте нет.
  `icon_key` выбирает иконку из набора шаблона, неизвестный или пустой ключ — иконка по
  цвету. Ссылка — как прислал бэк (внешняя → новая вкладка); `owner_type`/`owner_name` не
  выводятся; пустой стек — ничего не рисуется.
- Полоса-преимущества в шапке (мок `attention_blocks`, цвет-hex, иконка по индексу) убрана:
  бейджи приходят с данными страницы, а не рисуются шапкой; `shared/layout/Benefits.tsx`
  удалён, мок главной переведён на общий контракт `badges`.
- Логика в чистой функции: RTL в проекте нет (`vitest`, `environment: "node"`), компонент
  без DOM не проверить. Подключение: `toProductDetail` прокидывает `dto.badges ?? []`;
  карточка шины, карточка диска и главная рендерят `<Badges>` (полоса между шапкой и
  крошками/контентом — как в макете).
- Зоны витрины (27.10.2026): адаптеры листинга и
  карточки модели переносят стек (`badges: dto.badges ?? []` в `toTireProduct`,
  `toWheelProduct`, `toTireModel`); `ProductCard` рисует полосу плашек первым элементом
  `.catalog-product-details` (над заголовком товара), страница модели — перед заголовком
  модели; подбор по авто закрылся тем же адаптером (`src/shared/api/vehicle.ts`). CSS:
  `.catalog-product-details .benefits { margin: 0; }` — у полосы страничные отступы, в карточке
  отступы задаёт gap колонки.
- Проверка: 7 тестов `badgeView` + 1 тест мока главной + 2 теста адаптера; живой прогон —
  главная (3 плашки), карточка шины Kama («Текст 1», red), каталог — полосы нет.
  Зоны витрины (27.10.2026): +6 тестов адаптеров (139 всего), живой прогон — листинг Yokohama
  24 плашки, подбор по авто 8, карточка модели 4; диски 0 (в дев-базе нет привязок к дискам).

## Блок статьи в зонах (07.11.2026)

- Контракт: `article: { body: string } | null` в корне ответов листингов, подбора, модели и
  карточки; `body` — HTML RichEditor как есть; поля нет — блока нет. Подробности и зоны —
  [article-block-zones](article-block-zones.md).
- Ядро в `shared/`: типы `ArticleBlockDto/ArticleBlockData`, адаптер `toArticleBlock`,
  компонент `ArticleBlock` (`.article-content.article-block`). DTO и результаты страниц
  получили поле `article`.
- Мок `src/data/articleBlock.ts` работает только в dev; ТЗ бэку —
  `documentations/tz/article-block-backend.md`.

## SEO

- `meta.seo {title, description}` — мета-заголовок и описание страницы: title готовый от бэка (предложный падеж города эвристикой по суффиксам «в Челябинске», при выбранном brand — «Шины Michelin в Челябинске»).
- Фронт: `generateMetadata` (title/description в head) + `h2` страницы из `seo.title`.
- Визуальный `SeoBlock` упрощён до `{title, subtitle}` — бренд в subtitle подставляет бэк (фронтовая подстановка `replace("Viatti", brand)` удалена как хрупкая). На каталоге пока не рендерится — бэк готовит контентный блок; на auto-страницах `meta.seo.description` null — блок скрыт.

## Ограничения и риски

- Слаги городов в БД nullable (сидера нет) — если не заполнены, `city=<слаг>` фолбэчится на дефолт; URL-слаги должны совпадать с БД.
- Описания плашек-попапов — HTML (фронт рендерит разметку через `ParamBadge`); у бэка `cityText` (срок доставки) и настройки ПВЗ — простой текст с `\n` — правка передана в бэкенд (`cityText` → `<br>` + `e()`, настройки → `nl2br`); до неё переносы в попапах «ПВЗ»/«Самовывоз» теряются.
- `price|null` — блок цен в карточке рендерится только при числе (`typeof price === "number"`); в корзинных хуках `?? 0`.
- Фото товаров (16.10.2026): бэк отдаёт `images[0].url` (`/storage/images/…`); раздача
  требует симлинка `public/storage` на бэке (`php artisan storage:link` — выполнен в dev,
  **на проде за бэкенд-релизом**). Колонка фото карточки зафиксирована 172px (макет
  рисовал ассеты «своим» размером, живые фото 600×600 раздували карточку). У дисков фото
  пока нет — заглушка. Пожелание бэку: превью вместо 600px.
- Scramble-экспорт генерится в docker (`docker exec imsd-backend-app php artisan scramble:export-docs`) — на хосте нет pdo_pgsql. Товарные эндпоинты и `/reference/store` в экспорте на 22.10.2026 ещё не появились — контракт проверен живыми запросами.

## See Also

- [city-request-context](city-request-context.md) — город в URL; резолв переехал с фронта на бэк
- [api-barrel-data-ts](api-barrel-data-ts.md) — баррел, подключение API без правки потребителей
- [project-architecture](project-architecture.md) — карта проекта, состояние подключения
- [article-block-zones](article-block-zones.md) — блок статьи в зонах витрины (`article` в корне ответа)
