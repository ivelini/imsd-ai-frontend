# Страница модели дисков на живом API (паритет с шинами)

- **Дата:** 2026-11-10
- **Статус:** согласован
- **Согласовано:** 2026-11-10
- **Источник контракта:** `../backend/.claude/plans/frontend-wheel-models-handover.md` (бэк, коммит `8a275345`), Scramble-экспорт `/catalog/wheel-models/{brand}/{model}`, ADR бэка 0039

## Решения, согласованные в обсуждении

| Вопрос | Ответ (дословно) | Следствие в плане |
|---|---|---|
| По какому адресу открывать страницу модели дисков и карточку диска? | «каталог еще создается, страници не проиндексированы. изменаем без проблем на src/app/wheels/[brandSlug]/[modelSlug]/page.tsx для модели, и на src/app/wheels/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx для карточки» | Модель — `/wheels/{brand}/{model}`; карточка — `/wheels/{brand}/{model}/{size}` (полная симметрия с шинами). Старые адреса карточек без редиректов — все ссылки строит `productUrl`, они обновляются разом. ADR 0007 → Superseded, новый ADR 0011 |

Решения, зафиксированные источником (не обсуждались — следуют из прецедентов и правил):

| Решение | Источник |
|---|---|
| Разметка страницы модели — как у шин: `Badges` → `h2` → `ModelDescription` → `ModelSizes` | `.template/catalog/model.html`; `src/app/tires/[brandSlug]/[modelSlug]/page.tsx` |
| Диаметры бэка (`"16"`) → r-ключи вкладок (`r16`), как у шин; в листинг уходит число (r срезается) | `toTireModel`, `toModelSizesQuery` (`shared/api/catalog.ts`) |
| Размеры активной вкладки — живой листинг `/catalog/wheels?model&brand&diameter[]`, `per_page=100` | прецедент шин (`MODEL_SIZES_PER_PAGE`) |
| Блок статьи: `article` в корне ответа + dev-мок, как в 7 зонах | CLAUDE.md «Блок статьи», ADR 0010; бэк новое поле пока не отдаёт |
| Ссылка на страницу модели — крошка в карточке диска, как у шин | `src/app/tires/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx:58` |
| API-запрос карточки диска — по-прежнему `brand + size` (модельный сегмент только во фронтовом адресе) | handover §3: карточка `/api/catalog/wheels/{brand}/{size}` не менялась |
| Фильтр `model` в UI каталога не добавляем — только параметр запроса размеров | handover §2 описывает API, макета фильтра нет; у шин такого фильтра в UI тоже нет |
| Стили не пишем — разметка `.model-page` уже в `src/app/style.css` | макет модели общий для шин и дисков |

## Цель и ожидаемый результат

1. `GET /wheels/{brand}/model/{model}` открывает карточку модели дисков: баджи, картинка, характеристики (Тип/Цвет/Страна), описание, вкладки диаметров со счётчиками, карточки размеров активного диаметра; 404 — на несуществующую пару и на модель шин.
2. Карточка диска переезжает на `GET /wheels/{brand}/{model}/{size}` — схема адресов как у шин; крошка «модель» ведёт на страницу модели. Старые адреса `/wheels/{brand}/{size}` уходят без редиректов (каталог не проиндексирован).
3. SEO-мета — из `meta.seo` бэка; fallback — `Диски {бренд} {модель}`.
4. Логика карточки модели (адаптер, путь, размеры) — общая с шинами, без второй копии.

## Архитектурная сверка

- **Слой:** новые/переехавшие маршруты `src/app/wheels/[brandSlug]/[modelSlug]/page.tsx` (модель) и `src/app/wheels/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx` (карточка, переезд существующей); правки — `shared/api/catalog.ts` (API-функции), `features/catalog/types` (DTO), `features/catalog/lib` (чистые помощники адресов), `features/catalog/components/ModelSizes.tsx` (тип пропсов). Бизнес-логики в компонентах нет.
- **Server/client:** обе страницы серверные; `ModelSizes` остаётся клиентским островом (вкладки + «Показать ещё») без изменения поведения.
- **Данные:** только через `shared/api/`; snake_case бэка → фронтовые типы, адаптер — чистая функция `toModelCard`; `getProduct` для дисков продолжает ходить в `/catalog/wheels/{brand}/{size}` — новый сегмент URL в API не передаётся.
- **Состояние:** диаметр — в URL (`?diameter=r16`), как у шин (ADR 0003); Zustand/React Query не трогаем.
- **Границы доменов:** страницы `src/app` импортируют `features/catalog` и `shared/*`; доменных кросс-импортов нет.
- **API-контракт:** label-ы (Тип/Цвет/Страна) и строки — от бэка; `diameters[].value` — `"16"` → r-ключ только для URL/вкладок, в запрос — число. Фронт-словарей не появляется.
- **Роутинг:** схема дисков становится зеркалом шин: `/wheels/{brand}/{model}` и `/wheels/{brand}/{model}/{size}`; ADR 0007 описывает старую схему — помечается Superseded, решение фиксируется ADR 0011.
- **Вёрстка:** разметка 1-в-1 `catalog/model.html` через существующие компоненты; новых классов и стилей нет.
- **Тестируемость:** билдеры адресов товара/модели и выбор диаметра — чистые функции, тесты без DOM; страницы — композиция.
- **Переиспользование (правило двух):** адаптер карточки модели и запрос размеров уже существуют у шин — обобщаются (`toTireModel` → `toModelCard`, `getTireModelSizes` → `getModelSizes`, `toModelSizesQuery` → `modelSizesUrl`), а не копируются; выбор активного диаметра (3 строки в странице шин) выносится в `activeDiameter`; адрес модели (нужен крошкам двух категорий) — `modelUrl`.
- **Паттерн:** не вводится. Вторая копия — две страницы с одинаковым каркасом, различаются заголовком и категорией; обобщение на уровне API/адаптера достаточно, универсальный компонент — лишний слой.

## Бюджет сложности

Новые сущности (путь → зачем):

- `src/app/wheels/[brandSlug]/[modelSlug]/page.tsx` — маршрут карточки модели дисков.
- `src/app/wheels/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx` — переезд карточки диска (новых маршрутов не добавляет, `git mv`).
- `src/features/catalog/lib/modelDiameters.ts` — чистая `activeDiameter`: второй потребитель правила «запрошенный диаметр или первый».
- Типы в `src/features/catalog/types/index.ts` — переименование, не новые файлы: `TireModelDto/ResponseDto/Data` → `ModelCardDto/ResponseDto/Data`.
- API в `src/shared/api/catalog.ts` — переименование/обобщение: `getTireModel` → `getModelCard`, `getTireModelSizes` → `getModelSizes`, `toModelSizesQuery` → `modelSizesUrl`; новые `ModelCardInput`, `ModelCardResult`, `ModelSizesInput`, `modelCardPath`.
- `src/features/catalog/lib/productUrl.ts` — модель в адресе карточки диска (`/wheels/{brand}/{model}/{size}`), `modelUrl(product, city?)` и `modelCrumb(product, city?)` — крошка модели, общая для карточек шин и дисков (вынесена при упрощении, чтобы не держать вторую копию).

Переиспользуем: `ModelDescription`, `ModelSizes`, `ProductCard`, `Badges`, `ArticleBlock`, `mockArticleIfAbsent`, `toArticleBlock`, `toWheelProduct`, `toTireProduct`, `resolveCityLabel`, `appendCityParam`, `apiBase`, `cityQuery`.

**Не делаем:**

- Редиректы со старых адресов `/wheels/{brand}/{size}` — каталог не проиндексирован (ответ пользователя); ссылки обновляются разом через `productUrl`.
- Валидацию/сверку модельного сегмента в карточке диска — API модель не принимает; адрес строится из данных товара.
- Фильтр модели в UI каталога (селект/чип) и правку грамматики URL каталога (`parseParams`, `FilterState`).
- Ссылку «все диски модели» на листинг — размеры выводятся карточками, как у шин.
- Отдельные дисковые копии API-функций, адаптера, компонентов описания/размеров.
- Sitemap/robots (в проекте нет), SEO-тексты маршрутов (бэк не отдаёт), пагинацию размеров (per_page=100, как у шин).
- Новые стили и правку `src/app/style.css`.

**Сначала минимальный вариант.** Простейший рабочий: перевести существующую схему дисков на общий каркас шин — переименовать/обобщить две API-функции, переехать карточкой, добавить маршрут модели. Отклонённый тяжёлый: (а) параллельный набор дисковых копий (`getWheelModel`, `toWheelModel`, `WheelModelDescription`) — пишется быстрее, но оставляет две копии правил; (б) универсальный компонент `ProductModelPage` с пропом категории — новый слой ради двух страниц. Цена отклонённого — долг или лишняя индирекция; не берём.

## Задачи с контрактом шага

| Шаг | Файл::функция/компонент | Вход → Выход |
|---|---|---|
| 1. Типы и адаптер | `features/catalog/types/index.ts` → `ModelCardDto`, `ModelCardResponseDto`, `ModelCardData` | DTO бэка → тип страницы (diameters — r-ключи) |
| | `shared/api/catalog.ts` → `toModelCard(dto)` | `ModelCardDto` → `ModelCardData` |
| | `shared/api/catalog.ts` → `modelCardPath(input)` | `ModelCardInput` → string (путь + city) |
| | `shared/api/catalog.ts` → `getModelCard(input)` | `ModelCardInput` → `ModelCardResult \| null` (404 → null) |
| 2. Размеры модели | `shared/api/catalog.ts` → `modelSizesUrl(input)` | `ModelSizesInput` → string (`/catalog/{tires\|wheels}?model&brand&diameter[]&city&per_page=100`) |
| | `shared/api/catalog.ts` → `getModelSizes(input)` | `ModelSizesInput` → `ProductBase[]` |
| 3. Выбор диаметра | `features/catalog/lib/modelDiameters.ts` → `activeDiameter(diameters, requested)` | `{value,count}[]`, `string?` → string |
| 4. Адреса | `features/catalog/lib/productUrl.ts` → `productUrl(product, city?)` | `ProductLink` → `/tires/{b}/{m}/{s}` \| `/wheels/{b}/{m}/{s}` (без модели — `-`) |
| | `features/catalog/lib/productUrl.ts` → `modelUrl(product, city?)`, `modelCrumb(product, city?)` | `{category,brandSlug,modelSlug}` → `/tires/{b}/{m}` \| `/wheels/{b}/{m}`; крошка или null |
| 5. Маршруты | `app/wheels/[brandSlug]/[modelSlug]/page.tsx` → `default`, `generateMetadata` | params/searchParams → JSX/Metadata |
| | `git mv app/wheels/[brandSlug]/[sizeSlug]/page.tsx → app/wheels/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx`; крошки «модель → размер» | product → breadcrumbs |
| | `app/tires/[brandSlug]/[modelSlug]/page.tsx` — переход на общие функции | без смены поведения |
| | `app/tires/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx` — крошка через `modelUrl` | product → breadcrumbs |
| | `features/catalog/components/ModelSizes.tsx` → `sizes: ProductBase[]` | пропсы → JSX (без смены разметки) |
| 6. Тесты | `tests/unit/modelCardAdapter.test.ts` (переименование `tireModelAdapter.test.ts`) | DTO/пути → ожидания |
| | `tests/unit/modelDiameters.test.ts` (новый) | диаметры/запрос → активный |
| | `tests/unit/productUrl.test.ts` — новые адреса дисков + `modelUrl`; `tests/unit/articleBlockAdapter.test.ts` — правка | — |
| 7. Документация | `CLAUDE.md` (схема роутов, ADR-таблица), `documentations/adr/0011-model-i-kartochka-diskov-v-url.md` + `adr/README.md`, ADR 0007 → Superseded, `documentations/tz/article-block-backend.md` (+8-я зона), `documentations/tz/badges-zones-backend.md` (строка модели дисков) | — |

Бюджет диффа: шаг 1–2 — 2 файла; шаг 3–4 — 2; шаг 5 — 4 (один файл — переезд); шаг 6 — 4; шаг 7 — 5. Итого ≤ 17 файлов, ≤ 650 строк.

**STOP-условия:** новая зависимость (RTL и т.п.); маршрут сверх двух названных; редиректы старых адресов (решение — «без редиректов»); правка `parseParams`/`FilterState`/фильтра каталога; изменение `ProductBase` или API-пути карточки диска; правка `style.css`; дифф больше 17 файлов.

## Тест-лист

### `tests/unit/modelCardAdapter.test.ts` (переименование `tireModelAdapter.test.ts`; существующие тесты шин остаются, добавлены дисковые)

Тест 1
1. Поведение: адаптер карточки модели нормализует диаметры бэка в r-ключи вкладок — одна функция для шин и дисков; реализация без префикса завалит тест
2. Вход: DTO `{ diameters: [{value: "16", count: 2}, {value: "17", count: 1}] }`
3. Ожидание: `diameters == [{value: "r16", count: 2}, {value: "r17", count: 1}]`
4. Имя: `test_model_card_maps_diameters_to_r_keys`

Тест 2
1. Поведение: `image_url: null` заменяется заглушкой — карточка не рисует пустой `<img>`
2. Вход: DTO с `image_url: null`
3. Ожидание: `image == PRODUCT_PLACEHOLDER`
4. Имя: `test_model_card_image_falls_back_to_placeholder`

Тест 3
1. Поведение: стек баджей переносится как есть, без пересортировки; поля нет — пустой стек
2. Вход: DTO с двумя баджами; DTO без поля `badges`
3. Ожидание: 2 элемента в исходном порядке; `[]`
4. Имя: `test_model_card_badges_pass_through`

Тест 4
1. Поведение: params и description едут как есть; `description: null` — блок на странице скрыт
2. Вход: DTO с тремя params и `description: null`
3. Ожидание: 3 элемента; `description === null`
4. Имя: `test_model_card_params_and_description_pass_through`

Тест 5
1. Поведение: путь карточки модели зависит от категории (диски — `wheel-models`, шины — `tire-models`); сегменты — слаги бренда и модели, город — query
2. Вход: `{category: "wheels", brandSlug: "hankook", modelSlug: "kinergy", city: "chelyabinsk"}`; то же с `category: "tires"` и `yokohama/bluearth-ae61`
3. Ожидание: `/catalog/wheel-models/hankook/kinergy?city=chelyabinsk`; `/catalog/tire-models/yokohama/bluearth-ae61?city=chelyabinsk`
4. Имя: `test_model_card_path_uses_category_endpoint`

Тест 6
1. Поведение: 404 бэка на пару «бренд+модель» → `null` (страница отдаёт `notFound`), прочие ошибки не глотаются
2. Вход: mockFetch со статусом 404
3. Ожидание: `getModelCard(...) === null`
4. Имя: `test_model_card_404_returns_null`

Тест 7
1. Поведение: URL размеров — листинг категории с фильтрами model/brand/diameter и городом; r-префикс диаметра срезается (бэк ждёт число), `per_page=100`
2. Вход: `{category: "wheels", brandSlug: "hankook", modelSlug: "kinergy", diameter: "r16", city: "chelyabinsk"}`
3. Ожидание: содержит `/catalog/wheels?`, `model=kinergy`, `brand=hankook`, `diameter[]=16`, `city=chelyabinsk`, `per_page=100`; не содержит `%5B%5D`
4. Имя: `test_model_sizes_url_maps_filters`

### `tests/unit/modelDiameters.test.ts` (новый)

Тест 1
1. Поведение: активная вкладка — запрошенный диаметр, если он есть у модели; неизвестный/отсутствующий — первый; пустой список — пустая строка (размеры не запрашиваются)
2. Вход: `[{value: "r16", count: 2}, {value: "r17", count: 1}]` + `"r17"`; тот же список + `"r20"`; `[]` + `"r16"`
3. Ожидание: `"r17"`; `"r16"`; `""`
4. Имя: `test_active_diameter_selects_requested_or_first`

### `tests/unit/productUrl.test.ts` (правка)

Тест 1
1. Поведение: адрес карточки диска — три сегмента, как у шин: бренд, модель (короткий слаг), слаг позиции без префикса бренда; город — query
2. Вход: `{category: "wheels", brandSlug: "ls", modelSlug: "ls-367", sizeSlug: "ls-disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1"}` + `chelyabinsk`
3. Ожидание: `/wheels/ls/ls-367/disk-ls-367-16x74x100-d731-et40-gmf-7-16-40-4x100-73-1?city=chelyabinsk`
4. Имя: `test_wheel_product_url_includes_model`

Тест 2
1. Поведение: у диска без модели сегмент «-» — адрес остаётся рабочим (API модель не сверяет), как у шин
2. Вход: `{category: "wheels", brandSlug: "aplus", modelSlug: "", sizeSlug: "aplus-disk-16x7-5x1143-et45"}`
3. Ожидание: `/wheels/aplus/-/disk-16x7-5x1143-et45`
4. Имя: `test_wheel_product_url_without_model`

Тест 3
1. Поведение: адрес модели дисков — `/wheels/{бренд}/{модель}`, шин — `/tires/{бренд}/{модель}`; слаг модели уже короткий (адаптеры срезают префикс) — повторное срезание перепутало бы модель с позицией (`ls-367` → `367`, найдено смоук-тестом); город — query
2. Вход: `{category: "wheels", brandSlug: "ls", modelSlug: "ls-367"}` + `chelyabinsk`; `{category: "tires", brandSlug: "yokohama", modelSlug: "bluearth-ae61"}`
3. Ожидание: `/wheels/ls/ls-367?city=chelyabinsk`; `/tires/yokohama/bluearth-ae61`
4. Имя: `test_model_url_by_category`

### `tests/unit/articleBlockAdapter.test.ts` (правка)

Тест 1
1. Поведение: карточка модели дисков переносит `article` из корня ответа так же, как шин; поля нет — `null`
2. Вход: ответ `wheel-models` с `article: {body: "<p>W</p>"}`; ответ без поля
3. Ожидание: `{contentHtml: "<p>W</p>"}`; `null`
4. Имя: `test_wheel_model_result_carries_article`

Порядок: красный → зелёный → рефакторинг; прогоны фиксируются в разделе «Прогоны» ниже.

## Схема вызовов

```
┌─ ТРИГГЕРЫ ─────────────────────────────────────────────────────┐
│ GET /wheels/{brand}/{model}?city=<slug>            — модель    │
│ GET /wheels/{brand}/{model}/{size}?city=<slug>     — карточка  │
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ РОУТЫ (server components) ────────────────────────────────────┐
│ app/wheels/[brandSlug]/[modelSlug]/page.tsx                    │
│   generateMetadata → getModelCard (meta.seo → title/desc)      │
│   Page: getModelCard, activeDiameter, getModelSizes, getGeo    │
│                                                                │
│ app/wheels/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx         │
│   getProduct({category:"wheels", brand, size})                 │
│   breadcrumbs: Главная / Каталог дисков / Бренд / Модель /     │
│                Размер (modelUrl)                               │
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ SHARED API ───────────────────────────────────────────────────┐
│ src/shared/api/catalog.ts                                      │
│   getModelCard({category:"wheels", brandSlug, modelSlug, city})│
│     → modelCardPath → fetch /api/catalog/wheel-models/...      │
│     → toModelCard(dto)          (diameters → r-ключи)          │
│     → article: toArticleBlock(mockArticleIfAbsent(...))        │
│   getModelSizes({category:"wheels", brandSlug, modelSlug,      │
│                  diameter:"r16", city})                        │
│     → modelSizesUrl → fetch /api/catalog/wheels?model=…&       │
│                          brand=…&diameter[]=16&city=…          │
│     → toWheelProduct(dto)                                      │
│ src/shared/api/product.ts (без изменений пути)                 │
│   getProduct → fetch /api/catalog/wheels/{brand}/{size}        │
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ ВНЕШНИЙ API (Laravel) ────────────────────────────────────────┐
│ /api/catalog/wheel-models/{brand}/{model}  (404 — нет пары)    │
│ /api/catalog/wheels?model&brand&diameter[]&city&per_page       │
│ /api/catalog/wheels/{brand}/{size}         (карточка, без модели)│
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ РЕНДЕР (существующие компоненты) ─────────────────────────────┐
│ Badges(model.badges)                                           │
│ ModelDescription(params, description, image, article)          │
│ ModelSizes(diameters, sizes, activeDiameter)                   │
│   └─ ProductCard → productUrl → /wheels/{brand}/{model}/{size} │
└────────────────────────────────────────────────────────────────┘
```

## Прогоны

**Красный** (до файлов реализации):

- `npm test`: `Test Files 4 failed | 24 passed (28)`, `Tests 12 failed | 149 passed (161)` — `modelCardAdapter`, `modelDiameters`, `articleBlockAdapter` импортируют ещё не созданные функции; `productUrl` падает на новых адресах дисков.

**Зелёный** (после реализации):

- `npm test`: `28 passed (28)`, `162 passed (162)`.
- `npm run lint`: 0 ошибок, 4 прежних warning (`ModelDescription brandName`, `auth _password` ×3).
- `npx tsc --noEmit`: без ошибок (после `npx next typegen` — перегенерированы типы маршрутов под переехавшую карточку).
- Смоук в dev (порт 30034): `/wheels/ls/ls-367` — 200, карточка `/wheels/ls/ls-367/disk-…` — 200, ссылки листинга и крошка — трёхсегментные; модель и карточка шин — 200; старый двухсегментный адрес диска — 404 (ожидаемо, редиректов нет).
- Смоук поймал две ошибки одного правила и они исправлены до закрытия: `modelUrl` и `toWheelProduct` срезали префикс бренда с **короткого** слага модели (`ls-367` → `367`). Тесты `test_model_url_by_category` и `wheelListAdapter` скорректированы под канонический слог листинга.

## Открытые вопросы

Нет.
