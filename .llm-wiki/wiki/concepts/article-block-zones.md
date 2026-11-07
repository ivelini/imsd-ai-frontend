# Блок статьи в зонах витрины (article в корне ответа)

> Sources: Реализация фронта aalyans.ru, 2026-11-07
> Raw: [article-block-zones](../../raw/project/2026-11-07-article-block-zones.md)

## Overview

Блок статьи — HTML-контент, привязанный к зоне витрины через маркировки бэка
(`article_markings`, ADR бэка `marking/0058`). Выводится в семи зонах и только при наличии
объекта `article` в корне ответа. Бэк поле ещё не отдаёт: на время проверки работает мок,
включённый только в dev. Заголовка нет — фронт рисует только HTML RichEditor.

## Контракт

- Поле в корне ответа, рядом с `data`/`meta`: `article: { body: string } | null`.
- `body` — HTML RichEditor, отдаётся как есть; фронт не экранирует и не парсит.
- Поля нет или `null` — блока нет.
- Живёт вне кешей (как баджи): правка статьи видна сразу.
- Эндпоинты: `GET /api/catalog/tires`, `/catalog/wheels`,
  `/catalog/tires|wheels/by-vehicle/{make}/{model}/{year}/{modification}`,
  `/catalog/tire-models/{brand}/{model}`, `/catalog/tires/{brand}/{model}/{size}`,
  `/catalog/wheels/{brand}/{size}`.
- ТЗ для бэка — `documentations/tz/article-block-backend.md`.

## Зоны вывода

| Страница | Место |
|---|---|
| Каталог шин `/catalog/tires` | конец `.catalog-section.container`, после пагинации |
| Каталог дисков `/catalog/wheels` | то же |
| Подбор шин `/catalog/tires/auto/...` | уровень результата, после `SeoBlock`; пустая выдача — тоже |
| Подбор дисков `/catalog/wheels/auto/...` | то же |
| Модель шин `/tires/{brand}/{model}` | последний элемент `.model-description` |
| Карточка шины и диска | секция `ProductTabs` перед `#availability` |

Промежуточные уровни подбора (марки/модели/годы/модификации) блок не выводят — их ответы
`article` не несут. Страницы модели дисков нет (нет API, макета и свободного URL) — отдельный
план.

## Реализация

- `src/shared/types/articleBlock.ts` — `ArticleBlockDto { body }`, `ArticleBlockData { contentHtml }`
  (потребителей несколько доменов).
- `src/shared/lib/articleBlock.ts` — чистый адаптер `toArticleBlock(dto?)` → `null`, если объекта нет.
- `src/shared/ui/ArticleBlock.tsx` — `.article-content.article-block` + `dangerouslySetInnerHTML`;
  стили — общий `.article-content` (параграфы, `h3`, списки, картинки RichEditor по ширине колонки).
- DTO получили `article?: ArticleBlockDto | null` (`TireListDto`, `WheelListDto`,
  `VehicleSelectionDto`, `VehicleWheelSelectionDto`, `TireModelResponseDto`,
  `ProductResponseDto<T>`); результаты страниц — `article: ArticleBlockData | null`.
- Мок `src/data/articleBlock.ts` (`MOCK_ARTICLE_BLOCK`, `mockArticleIfAbsent`) подставлен в шести
  API-функциях (`getCatalogProducts`, `getWheelsProducts`, `getVehicleTireSelection`,
  `getVehicleWheelSelection`, `getTireModel`, `getProduct`) и работает только при
  `NODE_ENV=development`. Снятие: удалить файл, заменить вызовы на `toArticleBlock(body.article)`.
- CSS: `.catalog-section > .article-block { margin-top: 40px; }` — отступ от пагинации; в модели
  и карточке отступ даёт контейнер зоны.

## Проверка

- Красный: 1 failed suite (`Cannot find package '@/shared/lib/articleBlock'`), 147 прежних
  тестов зелёные. Зелёный: 155 тестов, `tsc` чисто, lint — 0 ошибок.
- Живая проверка: блок есть во всех семи зонах; переполнения нет на 390/768/1366/1920.

## See Also

- [Каталог (шины и диски): живой API](catalog-live-api.md)
- [Статьи и системные страницы: живой API](articles-live-api.md)
- [Баррел `shared/api/data.ts` (ADR 0001)](api-barrel-data-ts.md)
