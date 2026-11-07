# Блок статьи в зонах витрины (article в корне ответа)

## Решения, согласованные в обсуждении

| Вопрос | Ответ | Следствие в плане |
|---|---|---|
| Что приходит в объекте `article` | «Только HTML» | Контракт: `article: { body: string } \| null` в корне ответа; блок без заголовка, рисует только HTML |
| Где выводить на каталоге шин | «внизу блока catalog-section container» | Внутри `<section className="catalog-section container">`, после пагинации |
| Где выводить на странице модели шин | «внизу блока model-description» | Последний элемент внутри `.model-description` (flex-колонка с gap 30px) |
| Где выводить на странице товара | «поставить блок описание перед блоком наличие» | В `ProductTabs` перед секцией `#availability` (h2 «НАЛИЧИЕ»); это единственный блок, который в DOM называется «Наличие» |
| Условие вывода | «наличие объекта article в ответе от бэка в корне» | `toArticleBlock(body.article)` → `null` — блок не рендерится |
| Данные на время проверки | «пока сделай на моках» | Мок в `src/data/articleBlock.ts` подставляется в API-функциях; снимается удалением файла и одного вызова в каждой функции |
| Расширение зон | «каталог шин, каталог дисков, каталог по авто для шин, каталог по авто для дисков, модели шин и дисков, карточки шин и дисков» | Семь зон; на каталогах и подборе — внизу `.catalog-section`, на модели — внизу `.model-description`, в карточках — перед `#availability` |
| «Модели дисков» | Сначала «Создать страницу модели дисков», после уточнения — «Отдельный план» | Страницы модели дисков на сайте нет (нет API, макета и свободного URL); вынесена в отдельный план, в этот не входит |

## Цель и ожидаемый результат

Блок статьи — HTML-контент из объекта `article` в корне ответа — выводится во всех продуктовых
зонах витрины. Бэк object ещё не отдаёт: на время проверки подставляется мок, чтобы оценить
вёрстку и расположение. После появления контракта на бэке мок снимается без правок компонентов.

Зоны:

| Страница | Роут | Место |
|---|---|---|
| Каталог шин | `/catalog/tires` | конец `.catalog-section.container`, после пагинации |
| Каталог дисков | `/catalog/wheels` | конец `.catalog-section.container`, после пагинации |
| Подбор по авто — шины | `/catalog/tires/auto/{make}/{model}/{year}/{mod}` | конец `.catalog-section.container`, после `SeoBlock` (только уровень результата) |
| Подбор по авто — диски | `/catalog/wheels/auto/{make}/{model}/{year}/{mod}` | конец `.catalog-section.container`, после `SeoBlock` (только уровень результата) |
| Модель шины | `/tires/{brand}/{model}` | конец `.model-description` |
| Карточка шины | `/tires/{brand}/{model}/{size}` | `ProductTabs`, перед секцией `#availability` |
| Карточка диска | `/wheels/{brand}/{size}` | тот же `ProductTabs` (общий компонент) |

Промежуточные уровни подбора (марки, модели, годы, модификации) блок не получают: их ответы
не несут `article`, а статья появляется только на уровне результата.

## Задачи с контрактом шага

| Шаг | Файл::метод | Вход → Выход |
|---|---|---|
| 1. Типы блока | `src/shared/types/articleBlock.ts` | `ArticleBlockDto { body: string }`; `ArticleBlockData { contentHtml: string }` |
| 2. Адаптер | `src/shared/lib/articleBlock.ts → toArticleBlock` | `ArticleBlockDto \| null \| undefined` → `ArticleBlockData \| null` |
| 3. Мок | `src/data/articleBlock.ts → mockArticleIfAbsent` | `ArticleBlockDto \| null \| undefined` → `ArticleBlockDto \| null` (мок вместо отсутствующего) |
| 4. Каталог шин | `src/shared/api/catalog.ts → getCatalogProducts` | `FilterState, city` → `TireListResult` (+ `article`) |
| 5. Каталог дисков | `src/shared/api/catalog.ts → getWheelsProducts` | `FilterState, city` → `WheelListResult` (+ `article`) |
| 6. Подбор шин | `src/shared/api/vehicle.ts → getVehicleTireSelection` | `VehicleSelectionRef, FilterState, city` → `VehicleSelection` (+ `article`) |
| 7. Подбор дисков | `src/shared/api/vehicle.ts → getVehicleWheelSelection` | `VehicleSelectionRef, FilterState, city` → `VehicleWheelSelection` (+ `article`) |
| 8. Модель шин | `src/shared/api/catalog.ts → getTireModel` | `brandSlug, modelSlug, city` → `{ model, seo, article }` |
| 9. Карточка | `src/shared/api/product.ts → getProduct` | `ProductRoute, city` → `ProductResult` (+ `article`) |
| 10. Компонент | `src/shared/ui/ArticleBlock.tsx → ArticleBlock` | `ArticleBlockData` → JSX `.article-content.article-block` |
| 11. Зона каталога шин | `src/app/catalog/tires/[[...params]]/page.tsx` | `result.article` → `ArticleBlock` после `Pagination` |
| 12. Зона каталога дисков | `src/app/catalog/wheels/[[...params]]/page.tsx` | `result.article` → `ArticleBlock` после `Pagination` |
| 13. Зона подбора шин | `src/app/catalog/tires/auto/[[...auto]]/page.tsx` | `result.article` → `ArticleBlock` после `SeoBlock` |
| 14. Зона подбора дисков | `src/app/catalog/wheels/auto/[[...auto]]/page.tsx` | `result.article` → `ArticleBlock` после `SeoBlock` |
| 15. Зона модели шин | `src/features/catalog/components/ModelDescription.tsx` + страница модели | `article` → последний элемент `.model-description` |
| 16. Зона карточки | `src/features/product/components/ProductTabs.tsx` + обе страницы карточки | `article` → секция перед `#availability` |
| 17. Отступ в каталогах | `src/app/style.css` | правило `.catalog-section > .article-block { margin-top: 40px; }` |
| 18. ТЗ для бэка | `documentations/tz/article-block-backend.md` | контракт `article` в корне семи эндпоинтов (шесть API-функций фронта) |

DTO получают поле `article?: ArticleBlockDto | null`:

- `TireListDto`, `WheelListDto`
- `VehicleSelectionDto`, `VehicleWheelSelectionDto`
- `TireModelResponseDto`
- `ProductResponseDto<T>`

Результаты страниц получают `article: ArticleBlockData | null`:

- `TireListResult`, `WheelListResult`
- `VehicleSelection`, `VehicleWheelSelection`
- результат `getTireModel` (`{ model, seo, article }`)
- `ProductResult`

## Новые сущности (путь → зачем)

- `src/shared/types/articleBlock.ts` — типы DTO и данных блока; потребителей шесть (каталоги, подбор, модель, карточки) → `shared/types`
- `src/shared/lib/articleBlock.ts` — чистый адаптер; потребителей три модуля (`catalog.ts`, `vehicle.ts`, `product.ts`)
- `src/shared/ui/ArticleBlock.tsx` — общий компонент зоны; несколько доменов → `shared/ui`
- `src/data/articleBlock.ts` — временный мок до появления `article` на бэке
- `documentations/tz/article-block-backend.md` — контракт для бэкенда (прецедент `tz/badges-zones-backend.md`)
- `tests/unit/articleBlockAdapter.test.ts` — тесты адаптера и корневого поля

Переиспользуем: стили `.article-content` (уже с правилом для картинок RichEditor, 06.11.2026),
`TireListResult`, `WheelListResult`, `VehicleSelection`, `VehicleWheelSelection`, `ProductResult`,
`ProductTabs`, `ModelDescription`, `.catalog-section`/`.section`.

## Не делаем

- Заголовок блока — по ответу «только HTML»; если бэк позже пришлёт `title`, добавим поле в `ArticleBlockData`
- Страница модели дисков — отдельный план (нет API, макета и свободного URL)
- Промежуточные уровни подбора по авто (марки/модели/годы/модификации) — `article` не выводят
- Новый CSS-блок: только одно правило отступа в каталогах
- Компонентные тесты на RTL — в проекте их нет (vitest, environment `node`, без RTL)
- ADR — вопрос на закрытии плана, не на старте
- Правки бэка — только ТЗ

## STOP-условие

Остановиться и спросить, если по ходу нужно: новая зависимость; RTL/testing-library;
изменение контракта сверх `{ body }`; зоны вне перечисленных семи; правки страницы модели
дисков; дифф больше 22 файлов.

## Тест-лист

`tests/unit/articleBlockAdapter.test.ts` — адаптер и корневое поле

Тест 1
1. Поведение: поля `article` нет (undefined) или оно null — блок не выводится; реализация с `?? {}` вернёт пустой блок и этот тест завалит
2. Вход: `toArticleBlock(undefined)`, `toArticleBlock(null)`
3. Ожидание: оба вызова → `null`
4. Имя: test_absent_article_gives_null

Тест 2
1. Поведение: HTML тела переносится в данные рендера без экранирования и парсинга — иначе верстка бэка потеряется
2. Вход: `{ body: "<p>Текст <b>жирный</b></p>" }`
3. Ожидание: `{ contentHtml: "<p>Текст <b>жирный</b></p>" }`
4. Имя: test_body_html_maps_to_content

Тест 3
1. Поведение: `article` из корня ответа листинга шин доходит до результата страницы каталога
2. Вход: fetch-мок `{ data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0, seo: null }, article: { body: "<p>A</p>" } }`
3. Ожидание: `result.article` равен `{ contentHtml: "<p>A</p>" }`
4. Имя: test_tire_list_carries_article

Тест 4
1. Поведение: `article` из корня ответа листинга дисков доходит до результата страницы каталога дисков
2. Вход: fetch-мок `GET /api/catalog/wheels` с `article: { body: "<p>W</p>" }`
3. Ожидание: `result.article` равен `{ contentHtml: "<p>W</p>" }`
4. Имя: test_wheel_list_carries_article

Тест 5
1. Поведение: `article` из корня ответа подбора шин доходит до результата; без поля — null
2. Вход: fetch-мок `GET /api/catalog/tires/by-vehicle/...` с `article: { body: "<p>T</p>" }` и вариант без `article`
3. Ожидание: `result.article` равен `{ contentHtml: "<p>T</p>" }` / `null`
4. Имя: test_tire_selection_carries_article

Тест 6
1. Поведение: `article` из корня ответа подбора дисков доходит до результата; без поля — null
2. Вход: fetch-мок `GET /api/catalog/wheels/by-vehicle/...` с `article: { body: "<p>V</p>" }` и вариант без `article`
3. Ожидание: `result.article` равен `{ contentHtml: "<p>V</p>" }` / `null`
4. Имя: test_wheel_selection_carries_article

Тест 7
1. Поведение: `article` из корня ответа модели шин доходит до результата; без поля — null
2. Вход: fetch-мок ответа `GET /api/catalog/tire-models/yokohama/bluearth-e70b` с `article: { body: "<p>M</p>" }` и вариант без `article`
3. Ожидание: `result.article` равен `{ contentHtml: "<p>M</p>" }` / `null`
4. Имя: test_model_result_carries_article

Тест 8
1. Поведение: `article` из корня карточки товара доходит до результата; без поля — null (блок не выводится)
2. Вход: fetch-мок ответа `GET /api/catalog/tires/yokohama/bluearth-e70b/{size}` с `article: { body: "<p>P</p>" }` и вариант без `article`
3. Ожидание: `result.article` равен `{ contentHtml: "<p>P</p>" }` / `null`
4. Имя: test_product_result_carries_article

## Схема вызовов

```
┌─ ТРИГГЕР ──────────────────────────────────────────────────┐
│ HTTP GET (Server Component): каталоги, подбор, модель,     │
│ карточки                                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─ ПРИЛОЖЕНИЕ ───────────────────────────────────────────────┐
│ [Page] CatalogPage (шины | диски)                          │
│   ├─ getCatalogProducts | getWheelsProducts                │
│   └─ <ArticleBlock> после <Pagination>                     │
│                                                            │
│ [Page] AutoPage (шины | диски), уровень результата         │
│   ├─ getVehicleTireSelection | getVehicleWheelSelection    │
│   └─ <ArticleBlock> после <SeoBlock>                       │
│                                                            │
│ [Page] ModelPage (шины)                                    │
│   ├─ getTireModel → { model, seo, article }                │
│   └─ <ModelDescription article={...}>                      │
│        └─ <ArticleBlock> последним в .model-description    │
│                                                            │
│ [Page] ProductPage | WheelProductPage                      │
│   ├─ getProduct → ProductResult.article                    │
│   └─ <ProductTabs article={...}>                           │
│        └─ <ArticleBlock> перед секцией #availability       │
│                                                            │
│ [API]  catalog.ts (2), vehicle.ts (2), product.ts (1)      │
│   body.article → mockArticleIfAbsent (временно)            │
│        ↓                                                   │
│ [Pure] toArticleBlock → ArticleBlockData | null            │
│        ↓                                                   │
│ [UI]   shared/ui/ArticleBlock → .article-content           │
└─────────┼──────────────────────────────────────────────────┘
          │ fetch
          ▼
┌─ ВНЕШНИЙ МИР ──────────────────────────────────────────────┐
│ Laravel API: /api/catalog/tires, /catalog/wheels,          │
│ /catalog/tires|wheels/by-vehicle/...,                      │
│ /catalog/tire-models/{b}/{m}, /catalog/tires|wheels/{...}  │
└───────────────┬────────────────────────────────────────────┘
                │ { data, meta, article: { body } | null }
                ▼
┌─ ДАННЫЕ ───────────────────────────────────────────────────┐
│ Зона вывода: article → .article-content (HTML RichEditor)  │
│ Кеша фронт не вводит — кеш на бэке                         │
└────────────────────────────────────────────────────────────┘
```

## Прогоны

- **Красный** (07.11.2026, до файлов реализации): `npm test` — 1 failed suite
  (`Cannot find package '@/shared/lib/articleBlock'`), 26 passed; 147 тестов зелёные.
- **Зелёный** (после реализации): `npm test` — 27 files, 155 tests passed;
  `npx tsc --noEmit` — чисто; `npm run lint` — 0 ошибок (4 прежних предупреждения).
- **Живая проверка** (Playwright, dev :30034): блок есть во всех семи зонах; на каталогах —
  после пагинации, на модели — внутри `.model-description`, в карточках — перед
  `#availability`; переполнения нет на 390/768/1366/1920.
- **Отклонения от плана:** (1) мок подставляется только при `NODE_ENV=development` —
  иначе тесты «без article → null» не могли бы пройти по настоящему контракту;
  (2) блок добавлен и в пустой результат подбора («товаров не найдено») — это тот же
  уровень результата, условие «article есть — блок есть» от наличия товаров не зависит.
- **Ревью (07.11.2026):** архитектурный ревьюер + ручная сверка — нарушений набора,
  требующих правок, нет. Формулировка плана «шесть эндпоинтов» исправлена на
  «семь (шесть API-функций)».
- **Долги после ревью (07.11.2026):** дубль `mockFetch` вынесен в
  `tests/unit/helpers/mockFetch.ts` (три тест-файла); `ArticleBlock` принимает
  `className`, страницы статьи и системной страницы используют его без смены разметки
  (проверено: `.article-content` без `article-block`); мёртвые ссылки на удалённые планы
  убраны из двух ТЗ и wiki.

## Открытые вопросы

- Страница модели дисков: отдельный план (API, URL, вёрстка) — вне этого плана.

**Согласовано:** 2026-11-07
