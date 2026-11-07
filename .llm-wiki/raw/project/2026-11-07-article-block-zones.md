# Блок статьи в зонах витрины (article в корне ответа)

> Source: Код (src/shared/types/articleBlock.ts, src/shared/lib/articleBlock.ts, src/shared/ui/ArticleBlock.tsx, src/data/articleBlock.ts, src/shared/api/{catalog,vehicle,product}.ts, страницы каталогов/подбора/модели/карточек, src/app/style.css), план `.claude/plans/article-block-zones.md`, ТЗ `documentations/tz/article-block-backend.md`; реализация 07.11.2026
> Collected: 2026-11-07
> Published: 2026-11-07

## Проблема

На витрине нужен блок статьи — HTML-контент, привязанный к зоне через маркировки на бэке
(`article_markings`, ADR бэка `marking/0058`). Бэк поле ещё не отдаёт: в Scramble-экспорте
`article` в ответах каталога отсутствует. Условие вывода — наличие объекта `article` в корне
ответа; поле есть — блок есть, поля нет или `null` — блока нет.

## Контракт

`article: { body: string } | null` в корне ответа, рядом с `data` и `meta`. `body` — HTML
RichEditor, отдаётся как есть (фронт не экранирует и не парсит). Заголовка нет — по решению
пользователя блок рисует только HTML. Объект живёт вне кешей (как баджи): правка статьи
видна сразу.

Эндпоинты: `GET /api/catalog/tires`, `/catalog/wheels`,
`/catalog/tires|wheels/by-vehicle/{make}/{model}/{year}/{modification}`,
`/catalog/tire-models/{brand}/{model}`, `/catalog/tires/{brand}/{model}/{size}`,
`/catalog/wheels/{brand}/{size}`.

## Зоны вывода

- Каталог шин `/catalog/tires` и каталог дисков `/catalog/wheels` — конец
  `.catalog-section.container`, после пагинации.
- Подбор шин и дисков по авто — уровень результата, после `SeoBlock`; пустая выдача
  («товаров не найдено») тоже получает блок.
- Модель шин `/tires/{brand}/{model}` — последний элемент `.model-description`.
- Карточка шины и карточка диска (`ProductTabs` общий) — секция перед `#availability`
  (h2 «НАЛИЧИЕ»).
- Промежуточные уровни подбора (марки/модели/годы/модификации) блок не выводят: их ответы
  `article` не несут.
- Страницы модели дисков нет (нет API, макета и свободного URL) — вынесена в отдельный план.

## Реализация

- Типы: `ArticleBlockDto { body }`, `ArticleBlockData { contentHtml }` в
  `src/shared/types/articleBlock.ts` (потребителей несколько доменов).
- Адаптер: `toArticleBlock(dto?)` в `src/shared/lib/articleBlock.ts` — нет объекта → `null`.
- Компонент: `src/shared/ui/ArticleBlock.tsx` — `.article-content.article-block` +
  `dangerouslySetInnerHTML`; стили статьи (p/h3/ul, картинки RichEditor по ширине колонки).
- DTO получили `article?: ArticleBlockDto | null`: `TireListDto`, `WheelListDto`,
  `VehicleSelectionDto`, `VehicleWheelSelectionDto`, `TireModelResponseDto`,
  `ProductResponseDto<T>`. Результаты страниц — `article: ArticleBlockData | null`.
- Мок: `src/data/articleBlock.ts` (`MOCK_ARTICLE_BLOCK` + `mockArticleIfAbsent`) подставлен
  в шести API-функциях: `getCatalogProducts`, `getWheelsProducts`,
  `getVehicleTireSelection`, `getVehicleWheelSelection`, `getTireModel`, `getProduct`.
  Мок работает **только при `NODE_ENV=development`** — тесты и прод идут по настоящему
  контракту. Снятие: удалить файл и заменить вызовы на `toArticleBlock(body.article)`.
- CSS: одно правило `.catalog-section > .article-block { margin-top: 40px; }` (отступ от
  пагинации); в модели и карточке отступ даёт контейнер зоны.

## Проверка

- Красный (до реализации): `npm test` — 1 failed suite
  (`Cannot find package '@/shared/lib/articleBlock'`), 147 прежних тестов зелёные.
- Зелёный: 155 тестов, `tsc --noEmit` чисто, `lint` — 0 ошибок (4 прежних предупреждения).
- Живая проверка (Playwright, dev :30034): блок есть во всех семи зонах; на каталогах —
  после пагинации, на модели — внутри `.model-description`, в карточках — перед
  `#availability`; переполнения нет на 390/768/1366/1920.
- Отклонения от плана: мок ограничен dev-режимом; блок добавлен в пустой результат подбора
  (тот же уровень результата).
