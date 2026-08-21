# Размеры шин в URL с w/p-префиксами + 404 на мусор

## Цель

Все штатные комбинации фильтра (профиль без ширины, ширина без профиля, любое подмножество размеров) выразимы в URL каталога без потерь при round-trip. Невалидный URL каталога → 404, а не молчаливая порча фильтра. Контракт справочника фильтра — префиксные значения (`w185`, `p60`, по аналогии с `r15`). Обратная совместимость со старым форматом не нужна.

## Задачи

1. `parseParams.ts`:
   - `widthSegment` (`/^w(\d+)$/i` → `width`), `profileSegment` (`/^p(\d+)$/i` → `profile`)
   - `tireBrandSeasonSegment` — строгая семантика: сезон — только первый сегмент и без бренда; бренд — нечисловая строка (не w/p/r); всё остальное возвращает `false` (не распознан). `tireNumberSegment` удаляется
   - `parseUrl`: сегмент, не распознанный ни одним парсером → бросает `InvalidCatalogUrlError` (export из parseParams)
   - `tireSegmentOrder` → `[season, brand, w{width}, p{profile}, r{diameter}]`
   - query-каналы width/profile (auto-вкладка) — префиксные: `fallback("width", widthVal)`, `writeTireParams` пишет `w185`/`p60`
   - WHEELS_CONFIG не трогаем (у дисков ширина — число `6.5`); строгий parseUrl применяется автоматически: нераспознанный сегмент у дисков — тоже 404
2. `src/app/catalog/tires/[[...params]]/page.tsx`: `try { parseCatalogParams } catch (InvalidCatalogUrlError) { notFound() }` — в page и generateMetadata. Хелпер `parseCatalogParamsOr404` — в `shared/lib`.
3. `CatalogFilter.tsx`: селекты width/profile — кодировка value как у диаметра (`w${width}`/`p${profile}`, парсинг префикса по аналогии с `diam`).
4. `shared/api/catalog.ts` `toFilterOptions` — без изменений: lowercase уже есть, префиксы придёт от бэка.
5. `toTireListQuery` — без изменений: бэк листинга принимает числа (`width[]=185`).
6. ADR 0002 — обновление.

## Не меняется

`toTireListQuery`, WHEELS_CONFIG-грамматика, `MainFilter`, `buildQueryString`-механика (только writeTireParams префиксуется), существующие тесты (studded, C-размеры, r15).

## Схема

```
URL: /catalog/tires/summer/michelin/w185/p60/r15
│
├─ сегменты (каноничный порядок: season?, brand?, w?, p?, r?):
│   ├─ tireBrandSeasonSegment  summer → season (только первым), michelin → brand (нечисловая строка)
│   ├─ widthSegment     w185 → width=185
│   ├─ profileSegment   p60  → profile=60
│   ├─ diameterSegment  r15 → 15, r13c → "13c"
│   └─ НЕ распознано ни одним парсером (голое число, дубль сезона,
│      сезон после бренда, второй бренд) → InvalidCatalogUrlError
│
▼ page.tsx: catch InvalidCatalogUrlError → notFound() → 404
▼ валидный FilterState → getCatalogProducts(...) + CatalogFilter current
```

## Тест-лист (согласован 21.08.2026)

Все тесты — в `tests/unit/parseParamsFilter.test.ts`, блок «префиксные размеры w/p»:

1. **test_parse_profile_without_width** — {params:["p60","r15"]} → profile=60, width undefined, diameter=15
2. **test_parse_width_without_profile** — {params:["w185","r15"]} → width=185, profile undefined
3. **test_roundtrip_profile_only** — buildCatalogUrl({profile:60, diameter:15}) → содержит "/p60/r15", без "w"; парсинг → {profile:60, diameter:15}, width undefined
4. **test_roundtrip_full_filter** — {season, brand, width:185, profile:60, diameter:15} → URL "/catalog/tires/summer/michelin/w185/p60/r15" → парсинг → исходное состояние
5. **test_plain_number_throws_invalid** (страж) — {params:["185","60","r15"]} → бросает InvalidCatalogUrlError
6. **test_unknown_segment_throws_invalid** (страж) — {params:["summer","michelin","w185","foo"]} → бросает InvalidCatalogUrlError
7. **test_segment_over_query_priority** — {params:["w185"], width:"w195"} → width=185
8. **test_parse_width_profile_query** (регрессия) — {}, {width:"w185", profile:"p60"} → 185/60

## Прогоны

- Красный (23:10, тесты до реализации): 8 failed | 10 passed (18) — падения по ожидаемым причинам: w185 → NaN, нет /p60/r15, нет броска InvalidCatalogUrlError
- Зелёный (23:14): 48 passed (7 files) — включая обновлённый filterValuesAdapter.test.ts (префиксный контракт + переходный период)
- Lint: новых ошибок нет (3 старые — set-state-in-effect, не трогались)

## Итог (реализовано 21.08.2026)

- `parseParams.ts`: widthSegment/profileSegment, строгий tireBrandSeasonSegment, InvalidCatalogUrlError, tireSegmentOrder w/p/r, query-каналы с префиксом
- `page.tsx` tires: parseCatalogParamsOr404 → notFound()
- `CatalogFilter.tsx`: селекты w/p (wnum/pnum по аналогии с diam)
- `catalog.ts`: toFilterOptions — нормализация префиксов (голое число бэка → w185/p60, переходный период)
- Дополнительно: `filterValuesAdapter.test.ts` обновлён под новый контракт
