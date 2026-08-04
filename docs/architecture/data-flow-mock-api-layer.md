---
tags: [проект/template, архитектура, api, react-query]
created: 2026-08-03
updated: 2026-08-03
source: claude
---

# Движение данных (mock → React Query → API)

## Чтение

```
URL → Server Component (читает params)
  │
  ├─ await getXxx()               ← каталог, автоподбор, модель, статьи, layout, главная
  │   └─ данные → props дочерним компонентам (включая клиентские карусели)
  │
  └─ useDomainHook()              ← ТОЛЬКО: корзина, город в шапке, ЛК
       └─ useQuery / useMutation
            └─ getXxx() / addXxx()
                 └─ shared/api/data.ts
                      ├─ сейчас: setTimeout → data/*
                      └─ потом:  fetch → API_BASE + rewrites() (см. ниже)
```

## Подключение бэкенда (Laravel, другой домен)

```
Браузер → https://aalyans.ru/api/*   (same-origin, CORS не нужен)
  → next.config.ts: rewrites() → https://api.aalyans.ru/*
  → shared/api/data.ts: fetch(`${API_BASE}/...`)  (API_BASE = NEXT_PUBLIC_API_URL ?? "/api")
```

- `rewrites()` в `next.config.ts` — все `/api/*` проксируются на бэк-домен
- `API_BASE` уже заложен в `shared/api/data.ts`
- При смене домена бэка меняется только rewrite в конфиге
- `allowedDevOrigins` — только для dev-ресурсов Next, к API не относится

## Мутация (корзина)

```
Клик «Купить»
  → useAddToCart().mutate(item)
    → addToCart(item)
      → onMutate: оптимистично обновить кеш (мгновенно)
      → onError:  откатить кеш
      → onSettled: invalidateQueries(['cart']) + запись в localStorage
  → <CartCountBadge /> в Header обновляется автоматически
  → попап корзины: useUIStore (Zustand, только UI-флаг)
```

## Server / Client

```
СЕРВЕР (await getXxx, HTML)       КЛИЕНТ (React Query, интерактив)
────────────────────────────      ───────────────────────────────
Каталог (фильтры, товары, SEO)    Корзина (items, count, мутации)
Автоподбор (brand→...→result)     Город в шапке (client island)
Модель, Товар                     ЛК (целиком)
Статьи                            MainFilter (свитчер → router.push)
Layout (nav, benefits, footer)    Карусели товаров (scroll-snap)
Главная (товары → props)          Меню-бургер (UI-флаг, Zustand)
```

## React Query — область применения

```
Zustand (useUIStore)        React Query
─────────────────────       ─────────────
• город (client island)     • корзина (items, count, мутации)
• попапы (geo, cart)        • ЛК
• меню (бургер)
• UI-флаги
```
