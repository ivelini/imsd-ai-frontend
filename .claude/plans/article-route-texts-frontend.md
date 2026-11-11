# Блок статьи: переход с мока на тексты маршрутов от бэка

- **Дата:** 2026-11-10
- **Статус:** согласован
- **Согласовано:** 2026-11-10
- **Источник контракта:** `../backend/.claude/plans/frontend-article-route-texts-handover.md` (бэк, коммит `c5eaaae2`), Scramble-экспорт — 8 схем каталога (`article: string`, optional), ADR бэка 0059
- **База:** рабочее дерево содержит реализованный план `wheel-models-live.md` (модель дисков) — восьмая зона; без него зон семь.

## Решения, согласованные в обсуждении

| Вопрос | Ответ (дословно) | Следствие в плане |
|---|---|---|
| Переходим ли на тексты маршрутов от бэка? | «бэк сделал вывод статей для маршрутов. у тебя это сейчас на моках. составляем план перехода на данные от бэка» | Контракт — `article?: string` в корне 8 ответов; dev-мок `src/data/articleBlock.ts` удаляется, вызовы `mockArticleIfAbsent` снимаются |

Решения, зафиксированные источником (не обсуждались — следуют из handover, ADR и прецедентов):

| Решение | Источник |
|---|---|
| `article` — одна готовая HTML-строка в корне ответа; ключа нет — блока нет (не `null`, не `""`) | handover §Контракт; Scramble: `"article": {"type": "string"}` optional |
| Место и обёртка блока не меняются: 8 существующих зон, `.article-content.article-block` | ADR 0010, план `article-block-zones.md`, зона модели дисков — `wheel-models-live.md` |
| HTML вставляется как есть; санитизации и заголовка на фронте нет | ADR 0010; handover: «обёртку задаёт фронт», «текст доверенный» |
| `ArticleBlockData` (`{contentHtml}`) остаётся типом рендера; `ArticleBlockDto` (`{body}`) удаляется — поле стало строкой | минимальная правка: компоненты и зоны не трогаются |
| Пустая строка трактуется как отсутствие текста — блока нет (`if (!article)`) | контракт обещает отсутствие ключа; защита от пустой строки бесплатна |
| Добавить стиль `.article-content h2` — пример текста бэка содержит `<h2>`, а в каталогах `<h2>` ловит `.catalog-section h2` (24px заголовок страницы) | handover §Примеры; `src/app/style.css:80` — **дефолт, не подтверждён** |

## Цель и ожидаемый результат

1. Все 8 зон витрины выводят реальный текст маршрута из ответа бэка: каталоги шин и дисков, подбор шин и дисков, модели шин и дисков, карточки шин и дисков.
2. Dev-мок и его вызовы удалены; при отсутствии текста блок не рендерится (пустой заглушки нет).
3. Форма поля соответствует Scramble: `article?: string`; объект `{ body }` из прежнего контракта не поддерживается.
4. `<h2>` внутри текста выглядит как заголовок статьи, а не как заголовок страницы каталога.

## Архитектурная сверка

- **Слой:** ядро `shared/types` + `shared/lib` (адаптер), DTO-типы доменов (`features/catalog/types`, `features/product/types`), API-функции (`shared/api`), мок `src/data` (удаление). Компоненты и страницы не меняются.
- **Server/client:** без изменений; `ArticleBlock` — server component, зоны — серверные страницы (карточки передают блок в клиентские `ProductTabs`, как сейчас).
- **Данные:** DTO бэка → `toArticleBlock` → `{ contentHtml } | null`; компоненты `@/data/*` не импортируют (после удаления мока — ни один API-модуль тоже).
- **Состояние:** не затрагивается.
- **Границы доменов:** `shared/lib/articleBlock.ts` используют `shared/api/{catalog,vehicle,product}.ts` — по-прежнему ядро; кросс-доменных импортов нет.
- **API-контракт:** тип поля берётся из Scramble (`article?: string`), источник — тексты маршрутов админки; `value`-словарей нет. Фронт не собирает текст и не делает второй запрос.
- **Роутинг:** без изменений.
- **Вёрстка:** разметка зон 1-в-1 уже реализована; добавляется одно правило `.article-content h2` в конце `src/app/style.css` с пометкой даты — паттерн существующих блоков стилей.
- **Тестируемость:** адаптер — чистая функция; тесты зон используют общий `mockFetch` и проверяют перенос строки до `{contentHtml}`.
- **Переиспользование (правило двух):** адаптер и компонент уже общие для 8 зон; новый код не появляется — удаляется мок и меняется сигнатура одной функции.
- **Паттерн:** не вводится — нет второй копии и оси изменения.

## Бюджет сложности

Новые сущности: **нет**. Удаляется `src/data/articleBlock.ts` (мок).

Изменяемые файлы (путь → зачем):

- `src/shared/types/articleBlock.ts` — `ArticleBlockDto` удалён, `ArticleBlockData` остаётся; комментарий контракта.
- `src/shared/lib/articleBlock.ts` — `toArticleBlock(article?: string | null)`; пустая строка → `null`.
- `src/shared/api/catalog.ts` — 3 вызова `toArticleBlock(body.article)` без мока (листинги шин/дисков, карточка модели).
- `src/shared/api/vehicle.ts` — 2 вызова без мока (подбор шин/дисков).
- `src/shared/api/product.ts` — 1 вызов без мока (карточки шин/дисков).
- `src/features/catalog/types/index.ts`, `src/features/catalog/types/vehicle.ts`, `src/features/product/types/index.ts` — `article?: string` в DTO ответов (6 типов).
- `src/app/style.css` — `.article-content h2` в конце файла, пометка 10.11.2026.
- `tests/unit/articleBlockAdapter.test.ts` — строковые фикстуры, пустая строка.
- Документация: `documentations/adr/0010-article-block-zones.md`, `CLAUDE.md`, `documentations/tz/article-block-backend.md`.

Переиспользуем: `ArticleBlock`, `ArticleBlockData`, `ProductTabs`, `ModelDescription`, все зоны и их разметка, `mockFetch` в тестах.

**Не делаем:**

- Не меняем места, разметку и классы блока в зонах (решение `article-block-zones.md`).
- Не добавляем заголовок/обёртку блока и не санитизируем HTML.
- Не трогаем страницу статьи `/articles/{slug}` и `GET /api/articles/{id}` — у неё свой контракт.
- Не расширяем стили под все теги RichEditor: таблицы, видео и прочее — только h2 под пример бэка.
- Не поддерживаем старый объект `{ body }` и не пишем двойной адаптер.
- Не добавляем кеширование, отдельный запрос за текстом, новые эндпоинты.

**Сначала минимальный вариант.** Простейший рабочий: поменять сигнатуру адаптера, типы DTO и снять мок — 6 вызовов в 3 API-файлах. Отклонённый тяжёлый: убрать `ArticleBlockData` и передавать строку напрямую в `ArticleBlock` — трогает 8+ файлов зон и страницу статьи ради удаления одного обёрточного поля; цена больше, поведение то же.

## Задачи с контрактом шага

| Шаг | Файл::функция/тип | Вход → Выход |
|---|---|---|
| 1. Контракт | `shared/types/articleBlock.ts` → `ArticleBlockData` | строка HTML → готовый блок; `ArticleBlockDto` удалён |
| | `shared/lib/articleBlock.ts` → `toArticleBlock(article?)` | `string \| null \| undefined` → `ArticleBlockData \| null` |
| 2. DTO ответов | `features/catalog/types/index.ts`, `features/catalog/types/vehicle.ts`, `features/product/types/index.ts` | `article?: string` (6 DTO) |
| 3. Снятие мока | `shared/api/catalog.ts` → `getCatalogProducts`, `getModelCard`, `getWheelsProducts` | `body.article` → `toArticleBlock(body.article)` |
| | `shared/api/vehicle.ts` → `toVehicleSelection`, `toWheelSelection` | `dto.article` → `toArticleBlock(dto.article)` |
| | `shared/api/product.ts` → `getProduct` | `body.article` → `toArticleBlock(body.article)` |
| | `src/data/articleBlock.ts` | удалить файл и импорты `mockArticleIfAbsent` |
| 4. Стиль | `src/app/style.css` → `.article-content h2` | RichEditor-заголовок → типографика статьи |
| 5. Тесты | `tests/unit/articleBlockAdapter.test.ts` | строковые фикстуры → `{ contentHtml }` / `null` |
| 6. Документация | ADR 0010 (обновление контракта), `CLAUDE.md` (блок статьи), ТЗ `article-block-backend.md` (статус и контракт) | — |

Бюджет диффа: шаг 1–2 — 5 файлов; шаг 3 — 4 (включая удаление); шаг 4 — 1; шаг 5 — 1; шаг 6 — 3. Итого ≤ 14 файлов, ≤ 180 строк.

**STOP-условия:** новая зависимость; изменение места/разметки блока; поддержка двух форм поля одновременно; правка страницы статьи и её API; расширение стилей сверх h2; дифф больше 14 файлов.

## Тест-лист

### `tests/unit/articleBlockAdapter.test.ts` (правка)

Тест 1
1. Поведение: текст отсутствует — блока нет; пустая строка тоже не даёт блока (условие «нет текста», а не «нет объекта»)
2. Вход: `undefined`, `null`, `""`
3. Ожидание: `null` во всех трёх случаях
4. Имя: `test_absent_article_gives_null`

Тест 2
1. Поведение: строка HTML из корня ответа становится телом блока без преобразований — заголовок и разметка RichEditor уходят как есть
2. Вход: `"<h2>Aplus A503</h2><p>Текст <b>жирный</b></p>"`
3. Ожидание: `{ contentHtml: "<h2>Aplus A503</h2><p>Текст <b>жирный</b></p>" }`
4. Имя: `test_html_string_maps_to_content`

Тесты 3–9 (существующие, меняется только фикстура): `test_tire_list_carries_article`, `test_wheel_list_carries_article`, `test_tire_selection_carries_article`, `test_wheel_selection_carries_article`, `test_model_result_carries_article`, `test_wheel_model_result_carries_article`, `test_product_result_carries_article` — в теле ответа `article` теперь строка (`"<p>A</p>"` и т. п.); ожидания `{ contentHtml }` и `null` без изменений.

Порядок: красный → зелёный → рефакторинг; прогоны фиксируются в разделе «Прогоны» ниже.

## Схема вызовов

```
┌─ ТРИГГЕРЫ (server pages) ──────────────────────────────────────┐
│ /catalog/tires|wheels, /catalog/{tires|wheels}/auto/...        │
│ /tires|wheels/{brand}/{model}, карточки товара                 │
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ SHARED API ───────────────────────────────────────────────────┐
│ catalog.ts: getCatalogProducts / getWheelsProducts /           │
│             getModelCard                                       │
│ vehicle.ts: getVehicleTireSelection / getVehicleWheelSelection  │
│ product.ts: getProduct                                         │
│   body.article: string | undefined                             │
│   → toArticleBlock(article)  (shared/lib/articleBlock.ts)      │
│   → ArticleBlockData { contentHtml } | null                    │
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ ВНЕШНИЙ API (Laravel) ────────────────────────────────────────┐
│ 8 эндпоинтов каталога: article — строка HTML или ключа нет     │
└───────────────────────────────┬────────────────────────────────┘
                                ▼
┌─ РЕНДЕР (существующие зоны) ───────────────────────────────────┐
│ catalogs:  ArticleBlock (className="article-block")            │
│ auto:      ArticleBlock после SEO-блока                        │
│ models:    ModelDescription → ArticleBlock                     │
│ cards:     ProductTabs → ArticleBlock (перед «Наличие»)        │
└────────────────────────────────────────────────────────────────┘
```

## Прогоны

**Красный** (до реализации):

- `npm test`: `Test Files 1 failed | 27 passed (28)`, `Tests 8 failed | 154 passed (162)` — адаптер ещё читает `.body`, тесты получают `contentHtml: undefined`.

**Зелёный** (после реализации):

- `npm test`: `28 passed (28)`, `162 passed (162)`.
- `npm run lint`: 0 ошибок, 4 прежних warning (`ModelDescription brandName`, `auth _password` ×3).
- `npx tsc --noEmit`: без ошибок.
- Смоук в dev (порт 30034): подбор шин `/catalog/tires/auto/acura/integra/1999/1-8i` — 200, живой текст в `.article-content.article-block` (ровно один блок); каталог дисков `/catalog/wheels` без текста — 200, блоков статьи нет.
- Упрощение: типографика h2 общая с h3 (один источник), h2 — только размер 22px; шапка тестового файла обновлена под контракт-строку.

## Открытые вопросы

Нет.
