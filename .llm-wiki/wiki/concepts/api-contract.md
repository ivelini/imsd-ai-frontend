# Контракт API: данные для отображения формирует бэк

> Sources: .claude/rules/api-contract.md, 2026-08-19
> Raw: [api-contract.md](../../raw/project/2026-08-19-rule-api-contract.md)

## Overview

Все отображаемые данные приходят от бэкенда в готовом для рендера виде (`{ label, value }`, готовые строки). Фронт не строит словари и маппинги — их наличие на фронте считается недоработкой API и подсвечивается пользователю.

## Правила

- Опции фильтров/селектов, тексты, заголовки, метки — готовые `{ label, value }` от бэка.
- Хардкод-маппинг на фронте (`season: "summer"` → «Летняя») — недоработка API: требовать у бэка label/готовые строки.
- Мок-слой (`src/data/*`) имитирует ответ бэкенда — label формируется так, как сделает API.
- `value` — латинский slug, совпадает 1:1 с сегментами/query URL (`winter`, `r15`, `viatti`, `russia`); никаких русских значений в URL и value.
- Сопоставление с URL — прямое `option.value === segment`, без маппингов.

## See Also

- [catalog-url-grammar](catalog-url-grammar.md) — грамматика сегментов, которым соответствуют value
- [frontend-architecture-rules](frontend-architecture-rules.md)
- [project-architecture](project-architecture.md)
