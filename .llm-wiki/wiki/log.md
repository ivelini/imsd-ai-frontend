# Wiki Log

## [2026-08-19] ingest | Архитектура проекта (карта)
- Created: api-barrel-data-ts.md
- Created: catalog-url-grammar.md
- Created: model-sizes-pagination.md
- Created: city-request-context.md
- Created: frontend-architecture-rules.md
- Created: api-contract.md
- Created: ui-porting-rules.md
- Created: git-workflow.md

## [2026-08-19] ingest | Практика ADR в проекте
- Updated: project-architecture.md (See Also)

## [2026-08-21] ingest | Каталог шин: живой API (листинг, гео, SEO-мета)
- Created: catalog-live-api.md
- Updated: city-request-context.md (резолв города переехал на бэк)
- Updated: project-architecture.md (карта: каталог живой, моки удалены)

## [2026-08-21] ingest | Конфиг-грамматика URL каталога (ADR 0002)
- Updated: catalog-url-grammar.md (префиксные размеры w/p, 404 на мусор)
- Updated: catalog-live-api.md (адаптер фильтров: префиксная нормализация)
- Updated: project-architecture.md (карта: сегменты season/brand/wN/pN/rN)

## [2026-09-12] ingest | Перенос мокапа шиномонтажа (booking) в .template
- Created: booking-domain.md
- Updated: project-architecture.md (карта: 27 страниц, домен booking, стили доменов в style.css, verify 5×27)
- Updated: ui-porting-rules.md (стили непортированного домена остаются в .template до React-порта)

## [2026-09-30] ingest | React-порт записи на шиномонтаж на живом API
- Updated: booking-domain.md (поток на пяти роутах, контракт API, отказы по машинному коду, ADR 0005)
- Updated: project-architecture.md (карта: роуты /booking/*, живой API записи, стили домена в src)
- Updated: ui-porting-rules.md (пример переезда стилей вместе с портом домена)
- Updated: adr-practice.md (индекс 0001–0005)
