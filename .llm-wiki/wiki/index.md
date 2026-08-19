# Knowledge Base Index

## concepts

Архитектурные решения, правила и карта проекта aalyans.ru (Next.js frontend).

| Article | Summary | Updated |
|---------|---------|---------|
| [Архитектура проекта (карта)](concepts/project-architecture.md) | Слои src/.template/, роуты, данные/состояние, разработка, решения ADR 0001–0004 | 2026-08-19 |
| [Баррел `shared/api/data.ts` (ADR 0001)](concepts/api-barrel-data-ts.md) | Доменные модули shared/api + баррел export *; подключение API без правки потребителей | 2026-08-19 |
| [Конфиг-грамматика URL каталога (ADR 0002)](concepts/catalog-url-grammar.md) | CatalogUrlConfig + parseUrl/buildUrl; шины и диски — данные, не копии каркаса | 2026-08-19 |
| [Пагинация типоразмеров модели (ADR 0003)](concepts/model-sizes-pagination.md) | Вкладки диаметров (диаметр в URL) + «Показать ещё» по 24 | 2026-08-19 |
| [Город как контекст запроса (ADR 0004)](concepts/city-request-context.md) | Резолв фронтом, `?city=` в URL, city отдельным аргументом геттеров | 2026-08-19 |
| [Архитектурные правила frontend](concepts/frontend-architecture-rules.md) | 18 правил: React Query/Zustand, server/client, data.ts, хуки, формы | 2026-08-19 |
| [Контракт API: данные формирует бэк](concepts/api-contract.md) | Готовые { label, value } от бэка; value == сегменты URL; маппинги — недоработка API | 2026-08-19 |
| [Правила переноса вёрстки](concepts/ui-porting-rules.md) | Разметка 1-в-1, style.css/BEM, без Tailwind, брейкпоинты 640/1024/1366 | 2026-08-19 |
| [Правила работы с Git](concepts/git-workflow.md) | Коммиты только по указанию; model: <имя> в теле коммита | 2026-08-19 |
