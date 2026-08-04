# План: модуль выбора города (city query-параметр) — ✅ ВЫПОЛНЕНО 04.08.2026

## Контекст

Модуль выбора города используется в 3+ местах (header, главная, каталог, карточка товара). Сейчас:
- **Работает:** `CityBadge` (header), `MainFilter` (главная) — читают `useUIStore.city`, открывают `GeoPopup`
- **Сломано:** `CatalogFilter` (хардкод `Челябинск`, мёртвый `href="#"`), `ProductCard` (хардкод)
- **В URL города нет** — при обновлении страницы теряется

Цель: единый модуль, город в query-параметре URL (`?city=chelyabinsk`), параметр сохраняется при навигации (в т.ч. в URL товара).

## Архитектурное решение

**Гибрид: URL — источник истины, Zustand — синхронное зеркало.**

| Слой | Что | Зачем |
|---|---|---|
| URL `?city=chelyabinsk` | Источник истины | Персистентность, шаринг, SSR |
| `CityHydrator` (1 шт. в layout, `<Suspense>`) | Читает `useSearchParams()` → пишет `cityValue` в Zustand | Единственная точка работы с `useSearchParams()`, не плодим Suspense-обёртки |
| `useCity()` хук | Читает Zustand + резолвит label из React Query-кеша | Один источник для всех компонентов |
| `GeoPopup` onSelect | `router.push(новый URL)` + `setCityValue(value)` | Мгновенный UI + персистентность |

**Почему не чистый URL без Zustand:** `useSearchParams()` требует `<Suspense>`-границы в каждом клиентском компоненте. Это ведёт к лавине Suspense-обёрток (CityBadge, CatalogFilter, ProductCard, MainFilter — каждый в своей части дерева).

**Города — как все опции: `{ label, value }`.** `label` = русское имя, `value` = латинский slug для URL. Словарь предоставляет «бэк» (мок), фронт маппинги не строит (контракт `api-contract.md`).

## План реализации (13 шагов)

### Шаг 1. Данные: value для городов
- **Модифицировать** `src/data/geo.ts`:
  - `GeoCity`: добавить `value: string` (латинский slug для URL, например `"chelyabinsk"`, `"ekaterinburg"`)
  - `DEFAULT_CITY_VALUE = "chelyabinsk"` (рядом с `DEFAULT_CITY`)
  - Для 88 городов проставить value в моке (данные предоставляет «бэк»)

### Шаг 2. URL-утилиты
- **Создать** `src/shared/lib/cityUrl.ts`:
  - `CITY_PARAM = "city"`
  - `resolveCityValue(searchParams)` — извлечь `city` из searchParams (или DEFAULT)
  - `appendCityParam(url, cityValue)` — добавить `?city=...` к URL (если не default)
  - `mergeSearchParams(current, overrides)` — слить URLSearchParams с патчем (для GeoPopup)

### Шаг 3. Рефактор Zustand
- **Модифицировать** `src/stores/useUIStore.ts`:
  - Удалить `city: string`, `setCity`, импорт `DEFAULT_CITY`
  - Добавить `cityValue: string | null` (null = ещё не инициализирован), `setCityValue`
  - `geoOpen`, `menuOpen`, `cartPopupOpen` — без изменений

### Шаг 4. Хук useCity
- **Создать** `src/shared/layout/api/useCity.ts`:
  - Возвращает `{ cityValue, cityLabel, setGeoOpen, isReady }`
  - `cityLabel` резолвится из `useGeo().data.cities` по `value` (fallback: `DEFAULT_CITY`)
  - `isReady: false` пока `cityValue === null`

### Шаг 5. CityHydrator (синхронизатор URL → Zustand)
- **Создать** `src/shared/layout/client-islands/CityHydrator.tsx`:
  - `<Suspense fallback={null}>` → `useSearchParams()` → читает `city` → `setCityValue(valueFromUrl)`
  - Ничего не рендерит (`return null`)
- **Модифицировать** `src/app/layout.tsx`: добавить `<CityHydrator />` внутрь `<ClientLayout>`

### Шаг 6. GeoPopup — выбор города через URL
- **Модифицировать** `src/shared/layout/GeoPopup.tsx`:
  - `selectCity(c: GeoCity)`: `router.push(mergeSearchParams(...))` + `setCityValue(c.value)` + `setGeoOpen(false)`
  - Активный город — по `cityValue === c.value`
  - Поиск: `useState(searchQuery)` → `onChange` на input → фильтрация `geo.cities` по `label`

### Шаг 7. CityBadge (header)
- **Модифицировать** `src/shared/layout/client-islands/CityBadge.tsx`:
  - `useCity().cityLabel` вместо `useUIStore().city`
  - Разметка и классы без изменений

### Шаг 8. MainFilter (главная)
- **Модифицировать** `src/features/home/components/MainFilter.tsx`:
  - `useCity()` вместо стора напрямую
  - `handleSubmit`: передать `cityValue` в `buildCatalogUrl`

### Шаг 9. parseParams — параметр city
- **Модифицировать** `src/shared/lib/parseParams.ts`:
  - `buildQueryString(filter, includeParams?, cityValue?)` — добавить `city` если не default
  - `buildCatalogUrl(filter, cityValue?)` — пробросить
  - Обратная совместимость: cityValue опциональный, без него city в URL не попадает

### Шаг 10. CatalogFilter — починить city-change
- **Модифицировать** `src/features/catalog/components/CatalogFilter.tsx`:
  - Импортировать `useCity()`
  - `a.city-change`: `{cityLabel}` вместо хардкода, `onClick` → `setGeoOpen()`
  - Все вызовы `buildQueryString`/`buildCatalogUrl` — передать `cityValue`

### Шаг 11. ProductCard — город в карточке
- **Модифицировать** `src/features/catalog/components/ProductCard.tsx`:
  - `useCity().cityLabel` вместо хардкода
  - Ссылка на товар: добавить `?city=...` (через `appendCityParam`)

### Шаг 12. Страница каталога — city в pagination
- **Модифицировать** `src/app/catalog/tires/[[...params]]/page.tsx`:
  - Извлечь `city` из searchParams (серверно: `resolvedSearchParams.city`)
  - Передать `cityValue` в `buildCatalogUrl` для pagination

### Шаг 13. Страница автоподбора — city в ссылках
- **Модифицировать** `src/app/catalog/tires/auto/[[...auto]]/page.tsx`:
  - `qs = buildQueryString(current, false, cityValue)` — city из searchParams
  - Передать во все `<Link>` каскада

### Шаг 14. Верификация
- `grep "Челябинск" src/ --include="*.tsx"` — должен остаться только в `geo.ts` (DEFAULT_CITY) и SEO-текстах страниц
- Все `a.city-change`, `a.choice-city`, `.city-in-header` рендерят значение из `useCity()`
- Навигация: выбор города в попапе → URL обновлён → обновление страницы → город сохранён
- Переход каталог → товар → city в URL товара

## Файлы: создать / модифицировать

| Действие | Файл |
|---|---|
| **Создать** | `src/shared/lib/cityUrl.ts` |
| **Создать** | `src/shared/layout/api/useCity.ts` |
| **Создать** | `src/shared/layout/client-islands/CityHydrator.tsx` |
| **Модифицировать** | `src/data/geo.ts` |
| **Модифицировать** | `src/stores/useUIStore.ts` |
| **Модифицировать** | `src/shared/layout/GeoPopup.tsx` |
| **Модифицировать** | `src/shared/layout/client-islands/CityBadge.tsx` |
| **Модифицировать** | `src/shared/lib/parseParams.ts` |
| **Модифицировать** | `src/features/home/components/MainFilter.tsx` |
| **Модифицировать** | `src/features/catalog/components/CatalogFilter.tsx` |
| **Модифицировать** | `src/features/catalog/components/ProductCard.tsx` |
| **Модифицировать** | `src/app/catalog/tires/[[...params]]/page.tsx` |
| **Модифицировать** | `src/app/catalog/tires/auto/[[...auto]]/page.tsx` |
| **Модифицировать** | `src/app/layout.tsx` |

## Риски

1. **Suspense-граница**: `useSearchParams()` в статическом рендеринге требует Suspense. `CityHydrator` — единственный потребитель, обёрнут в `<Suspense fallback={null}>`. В корневом layout уже есть динамический `await getNav()`, так что весь layout динамический — Suspense может не понадобиться, но обёртка для безопасности.
2. **Back/forward браузера**: `useSearchParams()` реактивен на popstate → CityHydrator обновит Zustand автоматически.
3. **88 значений value в моке**: данные предоставляет «бэк» (мок), фронт их не генерирует. При переходе на API бэкенд вернёт `{ label, value }` — замена прозрачна.

---

## Факт выполнения (04.08.2026)

### ✅ Сделано
- `GeoCity.label + value` (label = рус., value = лат. slug), `DEFAULT_CITY_VALUE = "chelyabinsk"`
- Созданы: `cityUrl.ts` (resolveCityValue, appendCityParam, mergeSearchParams, resolveCityLabel), `useCity.ts`, `CityHydrator.tsx`
- Zustand `useUIStore`: `city` → `cityValue: string | null` + `setCityValue`
- `GeoPopup`: selectCity через `router.push`, вкладки регионов с `selectedRegion`, поиск по label, fix CSS `display: none`
- `CardCityBadge` — клиентский остров для `choice-city` в `ProductCard` (карточка осталась серверной)
- `CityBadge`, `MainFilter`, `CatalogFilter` — перевод на `useCity()`
- `parseParams`: `cityValue` в `buildQueryString`/`buildCatalogUrl`
- `ProductCard` — серверный, `cityLabel`/`cityValue` через props, `appendCityParam` для href
- Страницы каталога/авто/модели: проброс `city` из `searchParams`
- `GeoData.defaultCityValue`

### Инциденты
- GeoPopup не показывал города: CSS `display: none` на `.geo-location-window__city-list` — фикс через `selectedRegion` + `style={{ display: "block" }}`
- ProductCard стал клиентским из-за `useCity()` — переделан на серверный + `CardCityBadge` остров
