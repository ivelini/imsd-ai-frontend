# Knowledge Base Index

## concepts

Архитектурные решения, правила и карта проекта aalyans.ru (Next.js frontend).

| Article | Summary | Updated |
|---------|---------|---------|
| [Архитектура проекта (карта)](concepts/project-architecture.md) | Слои src/.template/, роуты, данные/состояние, разработка, решения ADR 0001–0005; каталог шин живой с 21.08, запись на шиномонтаж — с 30.09, фоллбэк ошибок бэка — с 16.10 | 2026-10-16 |
| [Домен booking (шиномонтаж)](concepts/booking-domain.md) | Пять роутов /booking/* на живом API: контракты слотов/каталога/кода/подтверждения, ловушки (quantities объектом, обязательные ключи, пара параметров), отказы по машинному коду, черновик в sessionStorage | 2026-09-30 |
| [Каталог (шины и диски): живой API](concepts/catalog-live-api.md) | Листинг/гео/SEO шин и дисков на бэке: адаптеры toTire*/toWheel*, city-слаг, meta.seo, origin (плашки «Самовывоз»/«ПВЗ»), наличие, зачёркнутая цена; диски — decimal-нормализация, авто-подбор — мок; SeoBlock | 2026-10-16 |
| [Фоллбэк ошибок бэка](concepts/backend-error-fallback.md) | При 5xx/недоступности — HTTP 500 и карточка «Сервис временно недоступен» из макета внутри живой обвязки (error.tsx; цена — пустой город); global-error — нижний слой; кто ждёт живой бэк, прогоны | 2026-10-16 |
| [Баррел `shared/api/data.ts` (ADR 0001)](concepts/api-barrel-data-ts.md) | Доменные модули shared/api + баррел export *; подключение API без правки потребителей | 2026-08-19 |
| [Конфиг-грамматика URL каталога (ADR 0002)](concepts/catalog-url-grammar.md) | CatalogUrlConfig + parseUrl/buildUrl; префиксные размеры w185/p60/r15 (21.08), невалидный сегмент → 404 | 2026-08-21 |
| [Пагинация типоразмеров модели (ADR 0003)](concepts/model-sizes-pagination.md) | Вкладки диаметров (диаметр в URL) + «Показать ещё» по 24 | 2026-08-19 |
| [Город как контекст запроса (ADR 0004)](concepts/city-request-context.md) | `?city=` в URL (слаг); резолв бэком с 21.08 (city_id → слаг → дефолт), city отдельным аргументом геттеров | 2026-08-21 |
| [Архитектурные правила frontend](concepts/frontend-architecture-rules.md) | 18 правил: React Query/Zustand, server/client, data.ts, хуки, формы | 2026-08-19 |
| [Контракт API: данные формирует бэк](concepts/api-contract.md) | Готовые { label, value } от бэка; value == сегменты URL; маппинги — недоработка API | 2026-08-19 |
| [Правила переноса вёрстки](concepts/ui-porting-rules.md) | Разметка 1-в-1, style.css/BEM, без Tailwind, брейкпоинты 640/1024/1366; стили непортированного домена остаются в .template (booking переехал 30.09) | 2026-09-30 |
| [Правила работы с Git](concepts/git-workflow.md) | Коммиты только по указанию; model: <имя> в теле коммита | 2026-08-19 |
| [Практика ADR в проекте](concepts/adr-practice.md) | 4 поля, полстраницы, анти-правила, статусы; шаблон 0000-template; индекс 0001–0005 | 2026-09-30 |
