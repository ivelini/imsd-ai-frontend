# Блок статьи в зонах витрины (article в корне ответа)

> Sources: Реализация фронта aalyans.ru, 2026-11-07; тексты маршрутов от бэка (контракт-строка), 2026-11-11
> Raw: [article-block-zones](../../raw/project/2026-11-07-article-block-zones.md); [article-route-texts-live](../../raw/project/2026-11-11-article-route-texts-live.md)

## Overview

Блок статьи — SEO-текст маршрута из админки («Тексты маршрутов», `article_routes.article`,
ADR бэка 0059). Выводится в восьми зонах и только при наличии ключа `article` в корне
ответа. С 11.11.2026 поле — **готовая HTML-строка** (`string`), бэк отдаёт его вживую;
dev-мок снят. Заголовка нет — фронт рисует только HTML RichEditor.

## Контракт

- Поле в корне ответа, рядом с `data`/`meta`: `article?: string`.
- Строка — HTML RichEditor, отдаётся как есть; фронт не экранирует и не парсит. Порядок
  склеенных привязок и дедуп — на бэке.
- Ключа нет, если текста нет (не `null`, не `""`); пустая строка — тоже «нет текста».
- Текст зависит от маршрута и фильтров: точная привязка вытесняет общую, привязки с
  разными параметрами складываются; условия могут включать город.
- Живёт вне кешей: правка текста видна сразу.
- Эндпоинты (8): `GET /api/catalog/tires`, `/catalog/wheels`,
  `/catalog/tires|wheels/by-vehicle/{make}/{model}/{year}/{modification}`,
  `/catalog/tire-models/{brand}/{model}`, `/catalog/wheel-models/{brand}/{model}`,
  `/catalog/tires/{brand}/{model}/{size}`, `/catalog/wheels/{brand}/{size}`.
- ТЗ для бэка — `documentations/tz/article-block-backend.md` (статус «реализовано»).

## Зоны вывода

| Страница | Место |
|---|---|
| Каталог шин `/catalog/tires` | конец `.catalog-section.container`, после пагинации |
| Каталог дисков `/catalog/wheels` | то же |
| Подбор шин `/catalog/tires/auto/...` | уровень результата, после `SeoBlock`; пустая выдача — тоже |
| Подбор дисков `/catalog/wheels/auto/...` | то же |
| Модель шин `/tires/{brand}/{model}` | последний элемент `.model-description` |
| Модель дисков `/wheels/{brand}/{model}` | то же |
| Карточка шины и диска | секция `ProductTabs` перед `#availability` |

Промежуточные уровни подбора (марки/модели/годы/модификации) и id-фолбэк подбора блок не
выводят — их ответы `article` не несут.

## Реализация

- `src/shared/types/articleBlock.ts` — `ArticleBlockData { contentHtml }` (тип рендера;
  его же использует страница статьи). `ArticleBlockDto` удалён 11.11.2026.
- `src/shared/lib/articleBlock.ts` — чистый адаптер `toArticleBlock(article?: string | null)`
  → `null` при отсутствии/пустой строке, иначе `{ contentHtml }`.
- `src/shared/ui/ArticleBlock.tsx` — `.article-content.article-block` + `dangerouslySetInnerHTML`;
  стили — общий `.article-content` (параграфы, `h2`/`h3`, списки, картинки RichEditor по
  ширине колонки). Типографика h2 общая с h3 (один источник), h2 — 22px.
- DTO получили `article?: string` (`TireListDto`, `WheelListDto`, `ModelCardResponseDto`,
  `VehicleSelectionDto`, `VehicleWheelSelectionDto`, `ProductResponseDto<T>`); результаты
  страниц — `article: ArticleBlockData | null`.
- Шесть API-функций вызывают `toArticleBlock(body.article)`: `getCatalogProducts`,
  `getWheelsProducts`, `getModelCard`, `getVehicleTireSelection`,
  `getVehicleWheelSelection`, `getProduct`. Мок `src/data/articleBlock.ts` удалён.
- CSS: `.catalog-section > .article-block { margin-top: 40px; }` — отступ от пагинации;
  в модели и карточке отступ даёт контейнер зоны.

## Проверка

- 07.11.2026: красный — 1 suite (`Cannot find package '@/shared/lib/articleBlock'`);
  зелёный — 155 тестов, tsc/lint чисто; блок есть во всех семи зонах (модели дисков тогда
  не было), переполнений нет на 390/768/1366/1920.
- 11.11.2026: красный — 8 тестов (`contentHtml: undefined`); зелёный — 28 файлов / 162 теста,
  lint 0 ошибок, tsc чисто. Смоук: подбор шин — живой текст в `.article-content.article-block`
  (ровно один блок); каталог дисков без текста — блоков нет.

## See Also

- [Каталог (шины и диски): живой API](catalog-live-api.md)
- [Статьи и системные страницы: живой API](articles-live-api.md)
- [Баррел `shared/api/data.ts` (ADR 0001)](api-barrel-data-ts.md)
