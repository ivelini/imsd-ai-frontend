# Архитектурные правила frontend (Next.js + React)

> Sources: .claude/rules/frontend-architecture.md, 2026-08-19
> Raw: [frontend-architecture.md](../../raw/project/2026-08-19-rule-frontend-architecture.md)

## Overview

18 правил структуры, состояния, границы server/client и работы с данными. Ключевое: «React Query для данных, Zustand для UI», фильтры каталога и пагинация — в URL, по умолчанию Server Component, бизнес-логика — только на бэкенде, без Server Actions.

## Ключевые правила

- **Структура**: `app/` (роутинг и композиция), `features/` (домены), `shared/` (ядро). Домены не импортируют компоненты друг друга; временных `src/components/` не создавать.
- **Состояние**: React Query — клиентские данные (корзина, город, ЛК); Zustand — только UI (попапы, меню); фильтры и пагинация — в URL.
- **Server/Client**: по умолчанию Server Component; клиентские — интерактив, анимация, браузерные API. Каталог/автоподбор/модель/статьи — серверные с клиентскими островами; корзина/ЛК — клиентские; главная — серверная.
- **API**: вся бизнес-логика на бэкенде (REST); фронт — UI, маршрутизация, кэширование. Без Server Actions.
- **Данные**: единые async-функции в `shared/api/data.ts` (мок `setTimeout` → позже fetch + rewrites `/api/*`, same-origin — CORS не нужен). Компоненты не импортируют `@/data/*` напрямую.
- **Хуки**: `features/<domain>/api/` + `shared/layout/api/` (useGeo); один `useQuery`/`useMutation` с зашитым queryKey (`['domain', 'entity', ...params]`).
- **Корзина**: React Query + localStorage, оптимистичные мутации, `onSettled` пишет в localStorage.
- **Типы/формы**: приоритет DTO бэка; формы — React Hook Form + Zod (валидация финальная на бэке); данные на клиенте — без `useEffect`-запросов.
- **Тесты**: Vitest + React Testing Library.

## See Also

- [api-barrel-data-ts](api-barrel-data-ts.md) — баррел `data.ts` как точка подключения API (правило 7)
- [api-contract](api-contract.md)
- [ui-porting-rules](ui-porting-rules.md)
- [project-architecture](project-architecture.md)
