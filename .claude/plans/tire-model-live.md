# Страница модели шин: живой API (контракт бэка готов)

Статус: итерация 2 — контракт бэка реализован, развилка «маршруты» на согласовании.

## Что реализовал бэк (проверено живыми запросами, 16.10.2026)

- `GET /api/catalog/tire-models/{brand}/{model}` — `{ data: { slug, name, brand {id, name,
  slug}, image_url|null, params [{name, value}] (пока 3: Сезон/Шипы/Страна),
  description (HTML|null, пока null), diameters [{value: "17", count}] },
  meta: { seo {title, description|null} } }`; нет модели → 404.
  `{brand}` — слаг бренда («yokohama»), `{model}` — **короткий** слаг («bluearth-ae61»).
- Листинг: новые query `model` и `brand` (короткий слаг). Размеры модели = листинг с
  `model=<короткий>&brand=<бренд>&diameter[]=<число>&city=…`; count из `diameters`
  модели сходится с `meta.total` листинга (18 → 5 = 5).

## Развилка: маршруты фронта

Наши URL построены на **полном** слаге модели из листинга (`model.slug` =
«yokohama-bluearth-e70b»): `/tires/<полный>` (модель) и `/tires/<полный>/<sizeSlug>`
(типоразмер), ссылки карточек и крошки. Бэк говорит коротким слагом + брендом.

- **Вариант 1 (рекомендуется): URL по схеме бэка** — `/tires/[brandSlug]/[modelSlug]`
  и `/tires/[brandSlug]/[modelSlug]/[sizeSlug]` (короткий слаг модели). Причины:
  адресация бэка брендовая (короткие слаги могут повторяться у разных брендов);
  слаг бренда всегда есть в листинге (`brand.slug`) — не гадаем; полный `model.slug`
  остаётся для sizeSlug. Цена: правим сборку ссылок в карточке, крошки, два маршрута,
  моки/тесты.
- **Вариант 2: попросить бэк принимать полный слаг** (алиас на `/tire-models/{full}` и
  в фильтре листинга) — фронт без правок, но работа уходит назад в бэкенд и адресация
  остаётся нестандартной.

## Задачи (проект под вариант 1)

1. Маршруты: `src/app/tires/[brandSlug]/[modelSlug]/page.tsx` и
   `.../[sizeSlug]/page.tsx` (переезд существующих), `generateMetadata` модели из seo.
2. `ProductBase` + `brandSlug`; короткий слаг модели — вывод из полного
   (`full.replace(\`${brandSlug}-\`, "")` при совпадении префикса, иначе — полный);
   сборка ссылок в `ProductCard` и крошках — `/tires/<brand>/<model>/…`.
3. `features/catalog/types` — DTO модели + `TireModelData` (переезд из мока);
   `toTireModel` (диаметры «17» → `r17`, params как есть), `getTireModel(brand, model, city)`;
   `getTireModelSizes(model, brand, diameter, city)` — листинг с фильтром (адаптер
   `toTireProduct` переиспользуется); мок-`getTireModel` уходит.
4. `ModelSizes`/`ModelDescription` — без изменений по разметке; диамерты из
   `diameters` модели; описание/параметры рендерятся как пришли (description null —
   блок скрыт; 3 параметра вместо 8 — не выдумываем).
5. Моки (диски/авто/страница товара) — привести слаги к новой схеме (brandSlug + короткий
   modelSlug) или оставить мок-локальные (уточнить при реализации).
6. Тесты: `toTireModel` (маппинг, диаметры → r-ключи, seo), `getTireModelSizes`-query
   (фильтры model/brand/diameter), короткий слаг из полного. Красный → зелёный.
7. Живой прогон: `/tires/yokohama/bluearth-ae61` — описание, вкладки диаметров (17/16/18
   из count), карточки типоразмеров, «Показать ещё», цена города.

## Тест-лист

── toTireModel: DTO модели → TireModelData ────────────────────

Тест 1
1. Поведение: параметры и описание едут как есть; диаметры нормализуются в r-ключи
   («17» → «r17») с количеством; бренд — объектом DTO
2. Вход: DTO {slug: "bluearth-ae61", name: "BluEarth AE61",
   brand: {id: 4, name: "Yokohama", slug: "yokohama"}, image_url: "http://…/a.jpg",
   params: [{name: "Сезон", value: "Летняя"}, …], description: null,
   diameters: [{value: "16", count: 2}, {value: "18", count: 5}]}
3. Ожидание: `params` как есть (в т.ч. длина), `description === null`,
   `diameters === [{value: "r16", count: 2}, {value: "r18", count: 5}]`
4. Имя: test_model_maps_dto_with_diameter_r_keys

── toTireProduct: бренд-слаг и короткий слаг модели ───────────

Тест 2
1. Поведение: карточка несёт `brandSlug` и короткий `modelSlug` — у полного
   `model.slug` срезается префикс «бренд-»; нет префикса — полный остаётся как есть
   (фронт не гадает)
2. Вход: baseDto (brand.slug «yokohama», model.slug «yokohama-bluearth-e70b»);
   второй случай — model.slug «other-slug» при том же бренде
3. Ожидание: `p.brandSlug === "yokohama"`, `p.modelSlug === "bluearth-e70b"`;
   во втором случае `p.modelSlug === "other-slug"`
4. Имя: test_product_short_model_slug_and_brand_slug

── query размеров модели ──────────────────────────────────────

Тест 3
1. Поведение: query размеров несёт короткий слаг модели, бренд, диаметр числом
   (r-ключ → «18») и город — ровно то, что ждёт листинг бэка
2. Вход: model «bluearth-ae61», brand «yokohama», diameter «r18», city «chelyabinsk»
3. Ожидание: строка содержит `model=bluearth-ae61`, `brand=yokohama`,
   `diameter[]=18`, `city=chelyabinsk`; без `%5B%5D`
4. Имя: test_model_sizes_query_maps_filters

## Прогоны

- **Красный**: `npm test` — 3 failed | 90 passed (93) — падают ровно три новых теста.
- **Зелёный**: `npm test` — 93 passed (15 файлов; поправлены два ожидания старого полного
  слага — в тестах шин и дисков); `tsc --noEmit` чисто; `eslint` 0 ошибок (14 предупреждений).
- **Живой прогон** (dev :30034; после переезда маршрутов контейнер пришлось перезапустить —
  turbopack не подхватил новые папки сам):
  - `/tires/yokohama/bluearth-ae61` — 200: h2 «Шины Yokohama BluEarth AE61», 3 параметра,
    описание скрыто (у бэка `null`), вкладки R16/R17/R18, первый диаметр R16 (2 размера =
    count модели), карточка с ценой/зачёркнутой/плашками, title из `meta.seo`
    («Шины Yokohama BluEarth AE61 в Челябинске»). Фото модели — 300 px: поймана ошибка
    старого переноса (класс висел на `<img>`; макет задаёт размер правилом
    `.model-description-image img`) — разметка возвращена к макету;
  - смена вкладки → `?diameter=r17`, активный R17, 2 размера (count 2 ✓), city в URL сохранён;
  - мок-товар `/tires/viatti/strada-2/175-70-r14-84h` — 200 (короткие слаги моков
    согласованы), крошка ведёт на `/tires/viatti/strada-2`;
  - крошка мок-товара → живая модель — **404** (переходное состояние: мок-слаги бэку
    неизвестны; уйдёт вместе с портом страницы товара на живой API).

## Замечания бэку (не блокеры)

- `params` — 3 записи против 8 в макете (назначение, рисунок протектора, страна бренда,
  год выпуска, run flat) — рендерим что есть; если данные появятся — добавить.
- `description: null` — блок описания в макете; пусто — скрываем.
- Картинки — `storage:link` (уже передано).

## Вне области

Страница товара (`/tires/[brand]/[model]/[sizeSlug]` — содержимое пока мок), авто-подбор,
«другие модели бренда».
