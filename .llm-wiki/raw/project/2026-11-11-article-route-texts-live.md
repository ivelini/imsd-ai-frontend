# Блок статьи: тексты маршрутов от бэка, контракт-строка, снятие мока (2026-11-11)

> Source: Код — `src/shared/types/articleBlock.ts`, `src/shared/lib/articleBlock.ts`,
> `src/shared/api/{catalog,vehicle,product}.ts`, `src/features/catalog/types/{index,vehicle}.ts`,
> `src/features/product/types/index.ts`, `src/app/style.css`, `tests/unit/articleBlockAdapter.test.ts`;
> план `.claude/plans/article-route-texts-frontend.md`; сводка бэка
> `frontend-article-route-texts-handover.md` (коммит `c5eaaae2`); Scramble-экспорт — 8 схем каталога
> Collected: 2026-11-11
> Published: 2026-11-11

## Проблема

Бэк реализовал SEO-тексты маршрутов каталога: в корень 8 ответов добавлен ключ `article` —
**готовая HTML-строка** (тексты из админки «Тексты маршрутов», `article_routes.article`,
ADR бэка 0059). Прежний фронтовый контракт ждал объект `{ body: string }` и до появления
поля подставлял dev-мок. Нужно перейти на живые тексты и снять мок.

## Контракт

- `article?: string` в корне ответа, рядом с `data`/`meta`; одна склеенная HTML-строка,
  порядок привязок и дедуп — на бэке.
- Ключа нет, если текста нет (не `null`, не `""`). Пустая строка трактуется как отсутствие.
- HTML — доверенный контент RichEditor, вставляется как есть, без санитизации.
- 8 эндпоинтов: листинги шин/дисков, подбор шин/дисков (slug-путь), модели шин/дисков,
  карточки шин/дисков. Id-фолбэк подбора текста не отдаёт.
- Блок собирается после кеша ответа: правка текста видна сразу.

## Реализация

- `ArticleBlockDto` (`{ body }`) удалён; DTO ответов получили `article?: string`
  (`TireListDto`, `WheelListDto`, `ModelCardResponseDto`, `VehicleSelectionDto`,
  `VehicleWheelSelectionDto`, `ProductResponseDto<T>`).
- `toArticleBlock(article?: string | null)` → `null` при отсутствии/пустой строке, иначе
  `{ contentHtml }` (`ArticleBlockData` остаётся типом рендера — его же использует страница статьи).
- Мок `src/data/articleBlock.ts` (`mockArticleIfAbsent`) удалён; 6 API-функций
  (`getCatalogProducts`, `getWheelsProducts`, `getModelCard`, `getVehicleTireSelection`,
  `getVehicleWheelSelection`, `getProduct`) вызывают `toArticleBlock(body.article)`.
- Зоны не менялись: каталоги, подбор, модели шин и дисков, карточки — 8 маршрутов.
- Стиль: типографика `.article-content h2` общая с `h3` (один источник), h2 — размер 22px;
  иначе в каталогах `<h2>` текста ловил `.catalog-section h2` (24px заголовок страницы).

## Документация

- ADR 0010 обновлён: поле — строка HTML, источник — тексты маршрутов, мок снят.
- CLAUDE.md — раздел «Блок статьи»; ТЗ `documentations/tz/article-block-backend.md` —
  статус «реализовано», контракт-строка, 8 эндпоинтов.

## Проверка

- Красный: 8 тестов падали (`contentHtml: undefined` — адаптер читал `.body`).
- Зелёный: 28 файлов / 162 теста; lint 0 ошибок; tsc чисто.
- Смоук в dev: подбор шин `/catalog/tires/auto/acura/integra/1999/1-8i` — 200, живой текст
  в `.article-content.article-block` (ровно один блок); каталог дисков без текста — 200,
  блоков статьи нет.
