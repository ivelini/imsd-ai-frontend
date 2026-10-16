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

## [2026-10-15] ingest | Плашка «Самовывоз» в карточке каталога из origin.delivery_days_after_order
- Updated: catalog-live-api.md (контракт листинга + origin, маппинг pickup → ProductBase, BadgeValue)

## [2026-10-16] ingest | Фоллбэк ошибок бэка: самостоятельная страница ошибки
- Created: backend-error-fallback.md
- Updated: project-architecture.md (карта: фоллбэк ошибок бэка, See Also)

## [2026-10-16] ingest | Макет страницы ошибки «Сервис временно недоступен» (.template/error.html)
- Updated: backend-error-fallback.md (макет с шапкой/подвалом, расхождение с global-error, не портирован)
- Updated: project-architecture.md (карта: мокап 28 страниц, страница error.html, verify 5×28)

## [2026-10-16] ingest | Живые поля карточки каталога: ПВЗ, наличие, зачёркнутая цена
- Updated: catalog-live-api.md (контракт листинга: pick_up/count_in_stock/old_price, маппинги pvzDelivery/quantity/oldPrice, формат описаний попапов — HTML)
- Updated: project-architecture.md (карта: поля карточки из листинга)

## [2026-10-16] ingest | Порт макета страницы ошибки в error.tsx (живая обвязка)
- Updated: backend-error-fallback.md (страница ошибки — карточка макета в живой обвязке; global-error — нижний слой; цена — пустой город)
- Updated: project-architecture.md (карта: фоллбэк — error.tsx в обвязке)

## [2026-10-16] ingest | Каталог дисков на живом API
- Updated: catalog-live-api.md (заголовок «Каталог (шины и диски)»: листинг/фильтр дисков, адаптеры toWheel*, нормализация decimal и значений фасетов, карточки без ссылок)
- Updated: project-architecture.md (карта: каталог дисков живой; мок — авто-подбор)

## [2026-10-16] ingest | Страница модели шин на живом API
- Updated: catalog-live-api.md (контракт tire-models, маршруты бренд/модель, короткий слаг, размеры листингом, переходный 404 мок-крошки)
- Updated: project-architecture.md (карта: роуты модели/товара, модель живая)

## [2026-10-16] ingest | Фото товаров из API: раздача и размер колонки
- Updated: catalog-live-api.md (storage:link, колонка 172px, пожелание превью)
- Updated: project-architecture.md (карта: фото товаров)
