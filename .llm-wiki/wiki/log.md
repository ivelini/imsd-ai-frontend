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

## [2026-10-20] ingest | Подбор шин по автомобилю на живом API
- Updated: catalog-live-api.md (раздел «Авто-подбор шин»: 5 эндпоинтов Vehicle, id в URL, секции OEM/альтернатива, пары front/rear, лимит 12; диски — фаза 2; SEO-блок скрыт)
- Updated: project-architecture.md (карта: авто-подбор шин живой; моки AUTO_*/SEO удалены)

## [2026-10-20] ingest | Подбор дисков по автомобилю на живом API
- Updated: catalog-live-api.md (раздел «Авто-подбор дисков»: wheels/by-vehicle, спецификации, допуски width/ET/hub, пары, лимит 12; мок wheels.ts удалён)
- Updated: project-architecture.md (карта: авто-подбор дисков живой; оба каскада live)

## [2026-10-20] ingest | Слаги Vehicle в URL авто-подбора
- Updated: catalog-live-api.md (адресация слагами, вложенные справочники make/model, композитный результат, numeric fallback и 307; store v4)
- Updated: project-architecture.md (карта: авто-подбор на слагах; numeric id — legacy)

## [2026-10-22] ingest | Карточка товара шин и дисков на живом API
- Updated: catalog-live-api.md (эндпоинты карточки и /reference/store, ProductDetailData, вкладки по контенту, pickupDate из badge, ссылки карточек, ADR 0007)
- Updated: project-architecture.md (карта: карточки товара живые, товарные моки удалены, формат слага позиции)
- Updated: adr-practice.md (индекс 0001–0007, ADR 0007)

## [2026-10-23] ingest | Бейджи товара: общий объект фронта и вывод в карточке
- Updated: catalog-live-api.md (контракт data.badges, ядро shared/types+badgeView+Badge, разметка плашки шаблона .benefit, ADR 0008, ТЗ бэку на остальные зоны)
- Updated: project-architecture.md (карта: ADR 0008 в разделе решений)
- Updated: adr-practice.md (индекс 0001–0008, ADR 0008)

## [2026-10-23] ingest | Бейджи: правило «пришёл data.badges — страница выводит плашки»
- Updated: catalog-live-api.md (раздел переписан: общее правило, полоса .benefits из шаблона, мок attention_blocks → badges, мок полосы в шапке убран, страницы-подключения)
- Updated: project-architecture.md (карта: ADR 0008 уточнён)
- Updated: adr-practice.md (индекс 0001–0008, формулировка 0008)

## [2026-10-27] ingest | Бейджи во всех зонах витрины: листинг, подбор по авто, карточка модели
- Updated: catalog-live-api.md (раздел бейджей: зоны витрины, перенос стека в адаптерах, место плашек в карточке и на странице модели, находка в бэке по пути payload)

## [2026-11-05] ingest | Статьи и системные страницы: живой API
- Updated: project-architecture.md (карта: статьи и меню живы с 05.11, моки статей/сервисных страниц удалены, ADR 0009, See Also)
- Updated: adr-practice.md (индекс 0001–0009, формулировка 0009)

## [2026-11-07] ingest | Блок статьи в зонах витрины (article в корне ответа)
- Updated: catalog-live-api.md (раздел «Блок статьи в зонах»: контракт article, ядро shared/, мок только в dev, See Also)

## [2026-11-11] ingest | Модель дисков на живом API и адреса карточек с модельным сегментом
- Updated: catalog-live-api.md (раздел «Модель дисков»: эндпоинт, маршруты `/wheels/{brand}/{model}` и трёхсегментная карточка, общие ModelCard*-функции, activeDiameter, productUrl/modelUrl/modelCrumb, исправление срезания префикса слага; overview, карточка товара, See Also)
- Updated: project-architecture.md (overview, роуты, «Живое», ADR: 0007 superseded в части дисков, 0011)
- Updated: adr-practice.md (индекс 0001–0011, 0007/0010/0011)
- Updated: model-sizes-pagination.md (механика общая с моделью дисков)
- Updated: index.md

## [2026-11-11] ingest | Блок статьи: тексты маршрутов, контракт-строка, снятие мока
- Updated: article-block-zones.md (контракт `article?: string`, 8 зон, dev-мок снят, h2 общей типографикой, проверки 11.11)
- Updated: catalog-live-api.md (раздел «Блок статьи»: строка из текстов маршрутов, ArticleBlockDto удалён)
- Updated: project-architecture.md (overview, ADR 0010 обновлён)
- Updated: adr-practice.md (0010 обновлён)
- Updated: index.md
