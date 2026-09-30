# Knowledge Base Index

## concepts

Архитектурные решения, правила и карта проекта aalyans.ru (Next.js frontend).

| Article | Summary | Updated |
|---------|---------|---------|
| [Архитектура проекта (карта)](concepts/project-architecture.md) | Слои src/.template/, роуты, данные/состояние, разработка, решения ADR 0001–0004; каталог шин живой с 21.08, мокап booking с 12.09 | 2026-09-12 |
| [Домен booking (шиномонтаж)](concepts/booking-domain.md) | Макет .template/booking/: поток 4 шагов, состояния отказа, «Мои записи»; правила (слот не удерживается, код 15 мин, отмена за 2 ч) | 2026-09-12 |
| [Каталог шин: живой API](concepts/catalog-live-api.md) | Листинг/гео/SEO на бэке: адаптеры, city-слаг (резолв бэком), meta.seo, euro_label, SeoBlock {title, subtitle} | 2026-08-21 |
| [Баррел `shared/api/data.ts` (ADR 0001)](concepts/api-barrel-data-ts.md) | Доменные модули shared/api + баррел export *; подключение API без правки потребителей | 2026-08-19 |
| [Конфиг-грамматика URL каталога (ADR 0002)](concepts/catalog-url-grammar.md) | CatalogUrlConfig + parseUrl/buildUrl; префиксные размеры w185/p60/r15 (21.08), невалидный сегмент → 404 | 2026-08-21 |
| [Пагинация типоразмеров модели (ADR 0003)](concepts/model-sizes-pagination.md) | Вкладки диаметров (диаметр в URL) + «Показать ещё» по 24 | 2026-08-19 |
| [Город как контекст запроса (ADR 0004)](concepts/city-request-context.md) | `?city=` в URL (слаг); резолв бэком с 21.08 (city_id → слаг → дефолт), city отдельным аргументом геттеров | 2026-08-21 |
| [Архитектурные правила frontend](concepts/frontend-architecture-rules.md) | 18 правил: React Query/Zustand, server/client, data.ts, хуки, формы | 2026-08-19 |
| [Контракт API: данные формирует бэк](concepts/api-contract.md) | Готовые { label, value } от бэка; value == сегменты URL; маппинги — недоработка API | 2026-08-19 |
| [Правила переноса вёрстки](concepts/ui-porting-rules.md) | Разметка 1-в-1, style.css/BEM, без Tailwind, брейкпоинты 640/1024/1366; стили непортированного домена остаются в .template | 2026-09-12 |
| [Правила работы с Git](concepts/git-workflow.md) | Коммиты только по указанию; model: <имя> в теле коммита | 2026-08-19 |
| [Практика ADR в проекте](concepts/adr-practice.md) | 4 поля, полстраницы, анти-правила, статусы; шаблон 0000-template; индекс 0001–0004 | 2026-08-19 |
