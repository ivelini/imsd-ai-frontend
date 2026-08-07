# План: архитектурные исправления (06.08.2026)

## Цель

Устранить нарушения архитектурных правил проекта, выявленные при аудите 06.08.2026.

## Контекст (для новой сессии)

Проект: интернет-магазин шин и дисков aalyans.ru, Next.js 16 App Router, TypeScript. Проект на стадии моков (`src/data/*` → `setTimeout` → `shared/api/data.ts`).

### Слои

```
src/
├── app/            — роутинг Next.js (тонкие страницы, делегируют в features/shared)
├── features/       — домены (8 шт): account, articles, auth, cart, catalog, checkout, home, product
│   └── <domain>/api/ (React Query), components/, types/
├── shared/         — ядро: api/ (data.ts 700 строк), layout/, lib/, ui/, types/
├── data/           — моки (10 файлов)
└── stores/         — Zustand: useUIStore.ts, useFilterStore.ts
```

### Ключевые правила (`.claude/rules/frontend-architecture.md`)

| # | Правило |
|---|---------|
| 2 | Домены не импортируют компоненты друг друга; типы — можно |
| 3 | React Query для данных, Zustand для UI; фильтры — в URL |
| 7 | Доступ к данным только через `shared/api/data.ts`; `@/data/*` — запрещён |
| 8 | Хук = один useQuery/useMutation; queryKey `['domain', 'entity', ...params]` |
| 9 | Корзина: React Query + localStorage, мутации с оптимистичным обновлением |
| 10 | Типы: локальные в `features/*/types/`, переиспользуемые в `shared/types/` |

### Как работает план

Каждый шаг самодостаточен для отдельной сессии. В сессии: читаешь план → читаешь файлы из «📖 Что читать» → реализуешь → `npm run build` → отмечаешь `[x]`.

---

## 🔴 Критично (исправить до подключения API)

### 1. [x] Разделить `shared/api/data.ts` на доменные модули

**Проблема:** God Object, 700 строк, все API-функции в одном файле. При подключении API — точка конкуренции в PR. Нарушение Single Responsibility.

**📖 Что читать:**
- `src/shared/api/data.ts` — 700 строк. Секции с границами строк:
  - `1-38` — импорты, API_BASE, delay, NavData
  - `39-69` — `getNav()` (NavData + сборка)
  - `70-81` — `getServicePage()`
  - `82-107` — `GeoData`, `getGeo()`
  - `108-125` — `HomeData`, `getHomeData()`, `getAttentionBlocks()`
  - `126-137` — `CatalogStartData`, `getCatalogStart()`
  - `138-161` — `CatalogStartData` тип (продолжение)
  - `162-270` — Catalog: `getTireModel()`, `getAutoResult()`, `getCarBlock()`, `getProduct()` + типы
  - `271-336` — Catalog: `getCatalogFilters()`, `getCatalogProducts()`, `getAutoBrands()` ... `fetchAutoResult()`
  - `337-423` — Wheels: все getWheels* + fetchWheelsAutoResult
  - `424-509` — Cart: `getCartTotalInfo()`, `getCartItems()`, `CartAddPayload`, `addToCart()`, `updateCartItem()`, `removeFromCart()`
  - `510-621` — Checkout: `CheckoutOptions`, `getCheckoutOptions()`, `Order`, `CreateOrderPayload`, `createOrder()`, `getOrder()`, `getOrderByNumber()`
  - `622-677` — Auth: `Session`, `getSession()`, `loginMock()`, `registerMock()`, `logoutMock()`
  - `678-700` — Articles: `Article`, `getArticles()`, `getArticle()`, `getRelatedArticles()`
- `src/shared/api/queryKeys.ts` — 24 строки, нужно дополнить ключами `auto`
- `src/shared/api/types.ts` — 15 строк, `PaginatedResult`, `ApiError`

**🔗 Потребители (32 файла импортируют из `@/shared/api/data`):**

Страницы (`src/app/`):
- `layout.tsx:3` → `getNav`
- `page.tsx:5` → `getHomeData`
- `cart/page.tsx:2` → `getCartTotalInfo`
- `checkout/page.tsx:2` → `getCheckoutOptions, getCartTotalInfo`
- `articles/page.tsx:2` → `getArticles`
- `articles/[id]/page.tsx:3` → `getArticle, getRelatedArticles`
- `catalog/page.tsx:3` → `getCatalogStart`
- `catalog/tires/[[...params]]/page.tsx:2` → `getCatalogFilters, getCatalogProducts`
- `catalog/tires/auto/[[...auto]]/page.tsx:12` → `getAutoBrands, getAutoModels, getAutoYears, getAutoModifications, fetchAutoResult, getCarBlock`
- `catalog/wheels/[[...params]]/page.tsx:2` → `getWheelsFilters, getWheelsProducts`
- `catalog/wheels/auto/[[...auto]]/page.tsx:11` → wheels auto functions
- `service-page/[slug]/page.tsx:5` → `getServicePage`
- `tires/[modelSlug]/page.tsx:3` → `getTireModel`
- `tires/[modelSlug]/[sizeSlug]/page.tsx:4` → `getProduct`

Feature-хуки (`src/features/`):
- `cart/api/useCart.ts:5` → `getCartItems`
- `cart/api/useCartCount.ts:5` → `getCartItems`
- `cart/api/useAddToCart.ts:5` → `addToCart, CartAddPayload`
- `cart/api/useUpdateCartItem.ts:5` → `updateCartItem`
- `cart/api/useRemoveFromCart.ts:5` → `removeFromCart`
- `auth/api/useSession.ts:5` → `getSession`
- `auth/api/useAuthMutations.ts:5` → `loginMock, registerMock, logoutMock`
- `checkout/api/useOrder.ts:5` → `getOrder`
- `checkout/api/useOrderByNumber.ts:5` → `getOrderByNumber`
- `catalog/api/useFilterOptions.ts:6` → `getCatalogFilters, getWheelsFilters`
- `catalog/api/useAutoBrands.ts:5` → `getAutoBrands, getWheelsAutoBrands`
- `catalog/api/useAutoCascade.ts:15` → `getAutoModels/getAutoYears/getAutoModifications` (+wheels)

Shared (`src/shared/`):
- `layout/api/useGeo.ts:5` → `getGeo`
- `layout/Header.tsx:4` → `NavData` (тип)
- `layout/Footer.tsx:2` → `NavData` (тип)
- `layout/CatalogMenu.tsx:4` → `NavData` (тип)

Feature-компоненты:
- `checkout/components/CheckoutPage.tsx:9-10` → `createOrder, CheckoutOptions, Order`
- `checkout/components/OrderPage.tsx:7` → `Order` (тип)
- `articles/components/ArticlePage.tsx:4` → `Article` (тип)
- `articles/components/ArticlesList.tsx:3` → `Article` (тип)
- `catalog/components/SeoBlock.tsx:2` → `SEO_CONTENT` (константа)
- `catalog/components/CatalogStart.tsx:4` → `CatalogStartData` (тип)

**План:**
- Создать подмодули в `src/shared/api/`:
  - `nav.ts` — `getNav`, `NavData`
  - `geo.ts` — `getGeo`, `GeoData`
  - `home.ts` — `getHomeData`, `getAttentionBlocks`
  - `catalog.ts` — все catalog/wheels/auto функции
  - `product.ts` — `getProduct`
  - `cart.ts` — `getCartItems`, `getCartTotalInfo`, `addToCart`, `updateCartItem`, `removeFromCart`, `CartAddPayload`
  - `checkout.ts` — `getCheckoutOptions`, `createOrder`, `getOrder`, `getOrderByNumber`
  - `auth.ts` — `getSession`, `loginMock`, `registerMock`, `logoutMock`
  - `articles.ts` — `getArticles`, `getArticle`, `getRelatedArticles`
  - `service-pages.ts` — `getServicePage`
  - `seo.ts` — `SEO_CONTENT` (константа)
- `data.ts` → реэкспорт из подмодулей (обратная совместимость — ни один потребитель не меняет импорты).
- `queryKeys.ts` → добавить секцию `auto` (сейчас хуки `useAutoCascade` используют inline-ключи `["auto", ...]`).

**🎯 Результат:** `npm run build` проходит без ошибок. Все 32 потребителя продолжают импортировать из `@/shared/api/data`.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_without_barrel** — после создания 12 модулей и удаления `data.ts` build падает («Module not found @/shared/api/data» у потребителей) — все ходят только через data.ts
2. **build_green_with_barrel** — после создания баррела build проходит, контракт не изменился
3. **grep_no_module_self_imports** — страж: `grep -rn "shared/api/data" src/shared/api/` (кроме `data.ts`) — 0 (единственная связь между модулями — checkout→cart по `cartStore`)
4. **smoke_pages** (ручная, лёгкая) — `/`, `/catalog/tires`, товар, `/cart` рендерятся без ошибок

**Решения по шагу (согласованы):** `delay`/`API_BASE` → новый `base.ts`; `cartStore` экспортируется из `cart.ts`; `getCatalogStart`+`CatalogStartData` → `catalog.ts`; `queryKeys.ts` — секция `auto` + перевод `useAutoCascade` на ключи (иначе ключи — мёртвый код); типы реэкспортируются из баррела (шаг 9 перенесёт в features).

---

### 2. [x] Убрать прямые импорты `@/data/*` из `cityUrl.ts` и `useCity.ts`

**Проблема:** Нарушение правила 7 — сломается при замене моков на fetch.

#### 2a. `src/shared/lib/cityUrl.ts`

**📖 Что читать:**
- `src/shared/lib/cityUrl.ts` — весь файл (44 строки)
- `src/data/geo.ts` — строки 116-117 (`DEFAULT_CITY`, `DEFAULT_CITY_VALUE`)

**Ключевой код (строка 2):**
```ts
import { DEFAULT_CITY, GEO_CITIES } from "@/data/geo";  // ❌ прямой импорт данных

export function resolveCityLabel(value?: string): string {
  if (!value) return DEFAULT_CITY;
  return GEO_CITIES.find((c) => c.value === value)?.label ?? DEFAULT_CITY;
}
```

**🔗 Потребители `resolveCityLabel` (6 файлов):**
- `app/catalog/tires/[[...params]]/page.tsx:4,24`
- `app/catalog/tires/auto/[[...auto]]/page.tsx:17,51`
- `app/catalog/wheels/[[...params]]/page.tsx:4,23`
- `app/catalog/wheels/auto/[[...auto]]/page.tsx:15,47`
- `app/tires/[modelSlug]/page.tsx:4,20`
- `app/tires/[modelSlug]/[sizeSlug]/page.tsx:5,33`

Все — серверные страницы, уже вызывают `await getGeo()` или имеют доступ к `searchParams`.

**План:**
- Изменить сигнатуру `resolveCityLabel` — принимать `cities` и `defaultCity` параметрами:
  ```ts
  export function resolveCityLabel(
    value: string | undefined,
    cities: { value: string; label: string }[],
    defaultCity: string,
  ): string
  ```
- Убрать `import { DEFAULT_CITY, GEO_CITIES }` из `cityUrl.ts`.
- В 6 страницах-потребителях: `await getGeo()`, затем `resolveCityLabel(cityValue, geo.cities, geo.defaultCity)`.
- `appendCityParam`, `mergeSearchParams`, `resolveCityValue`, `CITY_PARAM` — не зависят от данных, не трогать.

#### 2b. `src/shared/layout/api/useCity.ts`

**📖 Что читать:**
- `src/shared/layout/api/useCity.ts` — весь файл (26 строк)

**Ключевой код (строка 6):**
```ts
import { DEFAULT_CITY, DEFAULT_CITY_VALUE } from "@/data/geo";  // ❌

export function useCity() {
  const cityValue = useUIStore((s) => s.cityValue);
  const { data: geo } = useGeo();
  const slug = cityValue ?? DEFAULT_CITY_VALUE;                    // ❌
  const cityLabel = geo
    ? (geo.cities.find((c) => c.value === slug)?.label ?? DEFAULT_CITY)  // ❌
    : DEFAULT_CITY;
```

**План:**
- `GeoData` уже содержит `defaultCity` и `defaultCityValue` (см. `data.ts:93-98`).
- Заменить прямые константы на `geo.defaultCity` / `geo.defaultCityValue` из React Query.
- `isReady: true` — заменить на `isReady: !!geo` (сейчас хардкод).
- Импорт `@/data/geo` — удалить.

**🎯 Результат:** В `cityUrl.ts` и `useCity.ts` нет импортов `@/data/*`. `npm run build` проходит.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_after_signature_change** — после смены сигнатуры `resolveCityLabel` и удаления импортов без правки потребителей build падает (TS «Expected 3 arguments» / «DEFAULT_CITY not exported» на 6 страницах + useCity)
2. **build_green_after_call_sites** — после `await getGeo()` в 6 страницах и обновления `useCity` build проходит
3. **grep_no_data_imports** — страж: `grep -n "@/data/" src/shared/lib/cityUrl.ts src/shared/layout/api/useCity.ts` — 0
4. **city_label_resolves** (ручная, лёгкая) — `/catalog/tires` → «Челябинск», `?city=moscow` → «Москва»; бейдж шапки без поломок

---

### 3. [x] Перенести `EuLabel` из `features/catalog/components/` в `shared/ui/`

**Проблема:** Нарушение правила 2. `features/product/components/ProductGallery.tsx:4` импортирует `EuLabel` из `@/features/catalog/components/EuLabel` — cross-domain component import.

**📖 Что читать:**
- `src/features/catalog/components/EuLabel.tsx` — 18 строк, чистый презентационный компонент
- `src/features/product/components/ProductGallery.tsx:4` — строка импорта
- `src/features/catalog/components/ProductCard.tsx:8` — строка импорта

**Ключевой код:**
```tsx
// EuLabel.tsx — просто три <i> с классами, без зависимостей от домена
export function EuLabel({ rollingResistance, wetGrip, noiseEmission }: {
  rollingResistance: string; wetGrip: string; noiseEmission: number;
}) { /* <i className={...}>{...}</i> */ }
```

**План:**
- `mv src/features/catalog/components/EuLabel.tsx → src/shared/ui/EuLabel.tsx`
- Обновить 2 импорта:
  - `ProductCard.tsx:8`: `./EuLabel` → `@/shared/ui/EuLabel`
  - `ProductGallery.tsx:4`: `@/features/catalog/components/EuLabel` → `@/shared/ui/EuLabel`

**🎯 Результат:** `npm run build`. `grep -r "features/catalog/components/EuLabel" src/` — пусто.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_with_stale_imports** — после переноса файла без обновления импортов сборка обязана упасть («Module not found» на `ProductGallery.tsx:4` / `ProductCard.tsx:8`); вход: `mv EuLabel.tsx → shared/ui/`, импорты не тронуты
2. **build_green_after_imports** — после обновления импортов на `@/shared/ui/EuLabel` сборка проходит; вход: оба импорта обновлены
3. **grep_no_old_path** — страж-тест: `grep -rn "features/catalog/components/EuLabel" src/` даёт 0 совпадений
4. **renders_on_catalog_and_product** (ручная, лёгкая) — EU-лейбл виден на `/catalog/tires` и `/tires/[modelSlug]`

---

### 4. [x] Перенести `CartPopup` и `CartBadge` в `features/cart/`

**Проблема:** Инверсия слоёв — `shared/` зависит от `features/`.

#### 4a. `CartPopup` → `features/cart/components/CartPopup.tsx`

**📖 Что читать:**
- `src/shared/ui/CartPopup.tsx` — 86 строк
- `src/features/catalog/components/BuyButton.tsx` — 70 строк (импорт на строке 9)
- `src/features/product/components/AddToCartBlock.tsx` — 109 строк (импорт на строке 7)

**Ключевой код:**
```tsx
// CartPopup.tsx:5-6 — зависит от cart feature
import { useUpdateCartItem } from "@/features/cart/api/useUpdateCartItem";
import type { CartItem } from "@/features/cart/types";
```

**План:**
- `mv src/shared/ui/CartPopup.tsx → src/features/cart/components/CartPopup.tsx`
- Обновить 2 импорта:
  - `BuyButton.tsx:9`: `@/shared/ui/CartPopup` → `@/features/cart/components/CartPopup`
  - `AddToCartBlock.tsx:7`: `@/shared/ui/CartPopup` → `@/features/cart/components/CartPopup`

#### 4b. `CartBadge` → `features/cart/components/CartBadge.tsx`

**📖 Что читать:**
- `src/shared/layout/client-islands/CartBadge.tsx` — 9 строк
- `src/shared/layout/Header.tsx` — найти импорт `CartBadge`

**Ключевой код:**
```tsx
// CartBadge.tsx:4
import { useCartCount } from "@/features/cart/api/useCartCount";
```

**План:**
- `mv src/shared/layout/client-islands/CartBadge.tsx → src/features/cart/components/CartBadge.tsx`
- Обновить импорт в `Header.tsx`: `@/shared/layout/client-islands/CartBadge` → `@/features/cart/components/CartBadge`

**🎯 Результат:** `npm run build`. `grep -r "shared/ui/CartPopup\|shared/layout/client-islands/CartBadge" src/` — пусто.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_with_stale_imports** — после `git mv` обоих файлов без обновления импортов build падает («Module not found» на `BuyButton.tsx:9`, `AddToCartBlock.tsx:7`, `Header.tsx:7`)
2. **build_green_after_imports** — после обновления 3 импортов на `@/features/cart/components/...` build проходит
3. **grep_no_old_paths** — страж-тест: `grep -rn "shared/ui/CartPopup\|client-islands/CartBadge" src/` — 0 совпадений
4. **renders_popup_and_badge** (ручная, лёгкая) — попап «Товар добавлен» из каталога и товара, счётчик в шапке

---

## 🟡 Важно (улучшить архитектуру)

### 5. [x] Редуцировать `useFilterStore` — 12 методов → 3

**📖 Что читать:**
- `src/stores/useFilterStore.ts` — 70 строк
- `src/features/catalog/components/CatalogFilter.tsx` — строки 84-93, 98-100, 115, 119, 125-128, 156-157 (весь файл ~200 строк, но только эти строки используют стор)
- `src/features/catalog/types/index.ts` — типы `FilterState`, `FilterOptions`

**Ключевой код (useFilterStore.ts):**
```ts
// 6 полей × 2 (set+reset) = 12 методов — механическое копирование tires/wheels
filterParams: FilterState;
filterAuto: FilterState;
autoFilter: AutoFilterState;
wheelsFilterParams: FilterState;
wheelsFilterAuto: FilterState;
wheelsAutoFilter: AutoFilterState;
setFilterParams: (filter) => set({ filterParams: filter });
setFilterAuto: (filter) => set({ filterAuto: filter });
// ... + 6 reset + 6 wheels-вариантов
```

**🔗 Потребители `useFilterStore`:** Только один — `CatalogFilter.tsx` (строки 84-93, 98-100, 115, 119, 125-128, 156-157). `MainFilter.tsx` и `AutoResultView.tsx` не импортируют стор — получают фильтры через props/URL.

**План (параметризация):**
```ts
type FilterCategory = 'tires' | 'wheels';
type FilterTab = 'params' | 'auto';

interface FilterStore {
  filters: Record<FilterCategory, {
    params: FilterState;
    auto: FilterState;
    autoSelect: AutoFilterState;
  }>;
  setFilter: (cat: FilterCategory, tab: FilterTab, f: FilterState) => void;
  setAutoFilter: (cat: FilterCategory, a: AutoFilterState) => void;
  resetFilter: (cat: FilterCategory, tab: FilterTab) => void;
}
```
- `persist` ключ `"catalog-filter"` — сохранить.
- `CatalogFilter.tsx` строки 84-93 и 156-157 — адаптировать под новый интерфейс.

**🎯 Результат:** `npm run build`. Стор имеет 3 метода вместо 12. Поведение фильтров не меняется.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_new_store_old_consumer** — стор переписан на `filters[cat]` + 3 метода, `CatalogFilter` не тронут → build падает «Property 'setWheelsFilterParams' does not exist» (и остальные селекторы)
2. **build_green_after_catalogfilter** — `CatalogFilter` адаптирован (cat-селекторы, setFilter/setAutoFilter/resetFilter) → build Success
3. **grep_no_old_api** — страж: `grep "setFilterParams|wheelsFilter|resetAutoFilter" src/` — 0
4. **filter_memory_works** (ручная, лёгкая) — память раздельная для шин/дисков, «Сбросить все» работает

**Решения по шагу (согласованы):** `resetFilter(cat, tab)` с `tab: "params" | "auto" | "autoSelect"` (3 метода в сумме — resetAll покрывает и авто-каскад); persist: `version: 1` + `migrate` — формат изменился, память фильтров сбросится один раз (мок-фаза, приемлемо).

---

### 6. [x] Выделить `useCartItemActions` хук

**📖 Что читать:**
- `src/features/catalog/components/BuyButton.tsx` — 70 строк (вся логика cart)
- `src/features/product/components/AddToCartBlock.tsx` — 109 строк (вся логика cart)
- `src/features/cart/api/useAddToCart.ts` — для понимания сигнатуры
- `src/features/cart/api/useRemoveFromCart.ts` — сигнатура
- `src/features/cart/api/useCart.ts` — сигнатура
- `src/features/cart/types/index.ts` — `CartItem`

**Ключевое дублирование (оба файла):**
```tsx
// Идентичный паттерн в BuyButton.tsx и AddToCartBlock.tsx:
const [ready, setReady] = useState(false);
useEffect(() => setReady(true), []);
const { mutate: add, isPending } = useAddToCart();
const { mutate: remove } = useRemoveFromCart();
const { data: items } = useCart();
const cartItem = items?.find((i) => i.id === product.id);
const isInCart = ready && !!cartItem;
// handleAdd → add(..., { onSuccess: () => setPopupOpen(true) })
// handleRemove → remove(product.id)
// popupOpen/confirmOpen state
// CartPopup + ConfirmRemovePopup rendering
```

**План:**
- Создать `src/features/cart/api/useCartItemActions.ts`:
  ```ts
  export function useCartItemActions(productId: string) {
    // Возвращает: { cartItem, isInCart, isPending, handleAdd, handleRemove,
    //              popupOpen, confirmOpen, setPopupOpen, setConfirmOpen }
  }
  ```
- `BuyButton` и `AddToCartBlock` → используют хук, остаётся только UI-разметка.
- UI разный (кнопка vs блок с quantity+payment-info) → в один компонент не объединяем (Rule of Three).

**🎯 Результат:** `npm run build`. Оба компонента тоньше на ~30 строк. Логика корзины не дублируется.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_without_hook** — оба компонента переведены на `useCartItemActions`, файла нет → build падает «Module not found» ×2
2. **build_green_with_hook** — хук создан → build Success
3. **grep_no_cart_logic_in_components** — страж: в `BuyButton`/`AddToCartBlock` нет импортов `useAddToCart`/`useRemoveFromCart`/`useCart` (кроме `useCartItemActions`)
4. **cart_actions_work** (ручная, лёгкая) — «Купить»/«Добавить в корзину» → попап с количеством; «Убрать» → confirm + удаление

**Детали API (согласованы):** `useCartItemActions(item: CartAddPayload, quantity: number)`; `isInCart = ready && !!cartItem` (для AddToCartBlock поведение идентично — `!ready` проверяется первым); `handleRemove` = remove(id) + закрытие confirm; в компонентах остаются JSX, addedQuantity, тексты кнопок.

---

### 7. [x] Обобщить URL-грамматику каталога

**📖 Что читать:**
- `src/shared/lib/parseParams.ts` — 234 строки, весь файл
- `src/features/catalog/types/index.ts` — `FilterState`

**🔗 Потребители (6 файлов):**
- `app/catalog/tires/[[...params]]/page.tsx:3` → `parseCatalogParams, buildCatalogUrl`
- `app/catalog/tires/auto/[[...auto]]/page.tsx:16` → `parseCatalogParams, buildQueryString`
- `app/catalog/wheels/[[...params]]/page.tsx:3` → `parseWheelsParams, buildWheelsUrl`
- `app/catalog/wheels/auto/[[...auto]]/page.tsx:14` → `parseWheelsParams, buildQueryString`
- `features/catalog/components/CatalogFilter.tsx:8` → `buildCatalogUrl, buildWheelsUrl, buildQueryString`
- `features/home/components/MainFilter.tsx:10` → `buildCatalogUrl, buildWheelsUrl`

**Ключевое дублирование:**
```ts
// parseCatalogParams + parseWheelsParams — одинаковый цикл по сегментам,
// разный порядок полей (шины: season/brand/width/profile/diameter,
// диски: diameter/width/brand)
//
// buildCatalogUrl + buildWheelsUrl — одинаковый паттерн сборки path + query,
// разные pathPrefix и queryKeys
```

**План:**
- Выделить конфиг:
  ```ts
  interface CatalogUrlConfig {
    pathPrefix: string;
    segmentParsers: SegmentParser[];  // порядок и логика разбора сегментов
    queryParsers: QueryParser[];      // query-параметры
  }
  ```
- Общие функции: `parseCatalogUrl(config, params, searchParams)` → `FilterState`, `buildCatalogUrl(config, filter, cityValue)` → `string`.
- Конфиги `TIRES_CONFIG` и `WHEELS_CONFIG` — в этом же файле.
- Старые функции (`parseCatalogParams`, `buildCatalogUrl`, `parseWheelsParams`, `buildWheelsUrl`) оставить как обёртки для обратной совместимости — потребители не менять.

**🎯 Результат:** `npm run build`. `parseParams.ts` — одна пара функций вместо двух, конфиги отдельно.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_without_wrappers** — parseParams переписан на конфиги + `parseUrl`/`buildUrl`, старые экспорты удалены → build падает у 6 потребителей
2. **build_green_with_wrappers** — 5 обёрток (`parseCatalogParams`, `parseWheelsParams`, `buildCatalogUrl`, `buildWheelsUrl`, `buildQueryString`) → build Success
3. **grep_no_config_leak** — страж: `grep "TIRES_CONFIG\|WHEELS_CONFIG" src/ | grep -v parseParams` — 0
4. **urls_stay_same** (ручная, лёгкая) — URL-грамматика не изменилась (сегменты, query, вкладки)

**Решения по шагу (согласованы):** обобщённые функции — `parseUrl(config, params, searchParams)` / `buildUrl(config, filter, cityValue, includeParams?)` (имя buildCatalogUrl занято обёрткой); семантика season/brand воспроизведена 1-в-1 (сезон — только первый нечисловой сегмент, «поздний» сезон игнорируется); `buildQueryString` — обёртка над общим query-билдером (для auto-вкладок шин и дисков); `tire_type` всегда в query шин; порядок query-параметров в URL может слегка отличаться от прежнего (на парсинг не влияет); parseParams — кандидат на unit-тесты при подключении Vitest (не в этом шаге).

---

### 8. [x] `createOrder` → `useCreateOrder` mutation

**📖 Что читать:**
- `src/features/checkout/components/CheckoutPage.tsx` — строки 1-30 (импорты + стейт)
- `src/features/cart/api/useAddToCart.ts` — образец mutation-хука (для стиля)
- `src/shared/api/data.ts` — сигнатура `createOrder` (найти `export async function createOrder`)

**Ключевой код:**
```tsx
// CheckoutPage.tsx:9 — прямой вызов вместо useMutation
import { createOrder } from "@/shared/api/data";
// Далее в компоненте: ручной pending state + createOrder(payload).then(...)
```

**План:**
- Создать `src/features/checkout/api/useCreateOrder.ts` (по образцу `useAddToCart`):
  ```ts
  export function useCreateOrder() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: createOrder,
      onSettled: () => {
        qc.invalidateQueries({ queryKey: queryKeys.cart.items });
        qc.invalidateQueries({ queryKey: queryKeys.checkout.order });
      },
    });
  }
  ```
- `CheckoutPage` заменить прямой вызов на хук.
- Ручной `pending` state — убрать, использовать `isPending` из мутации.

**🎯 Результат:** `npm run build`. `createOrder` вызывается только через `useMutation`.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_without_hook** — `CheckoutPage` переведён на `useCreateOrder`, файла нет → build падает «Module not found»
2. **build_green_with_hook** — хук создан → build Success
3. **grep_createOrder_only_in_hook** — страж: `grep "createOrder" src/features/` — только `api/useCreateOrder.ts`
4. **order_flow_works** (ручная, лёгкая) — форма → сабмит → `/order/[id]`, корзина очищается; guard двойного сабмита через isPending

---

### 9. [x] Перенести DTO-типы в `features/*/types/`

**📖 Что читать:**
- `src/shared/api/data.ts` — найти все `export type` / `export interface` (типы, а не функции)
- `src/features/cart/types/index.ts` — образец правильного размещения DTO

**🔗 Типы, живущие в `shared/api/data.ts`, и их потребители:**

| Тип | Потребители |
|-----|------------|
| `CheckoutOptions` | `checkout/components/CheckoutPage.tsx:10` |
| `Order` | `checkout/components/CheckoutPage.tsx:10`, `checkout/components/OrderPage.tsx:7` |
| `Article` | `articles/components/ArticlePage.tsx:4`, `articles/components/ArticlesList.tsx:3` |
| `Session` | Импортируется неявно через `getSession` |
| `CatalogStartData` | `catalog/components/CatalogStart.tsx:4` |
| `NavData` | `shared/layout/Header.tsx:4`, `Footer.tsx:2`, `CatalogMenu.tsx:4` |

`NavData` — layout-тип, правильно лежит в shared/api. `SEO_CONTENT` — константа, не тип.

**План:**
- Создать файлы (где ещё нет):
  - `features/checkout/types/index.ts` → `CheckoutOptions`, `Order`
  - `features/articles/types/index.ts` → `Article`
  - `features/auth/types/index.ts` → `Session` (если нет)
- `shared/api/data.ts` → реэкспортировать типы из доменов (как уже делает для `ServicePageLink`, `HomeData`).
- Обновить импорты в 5 компонентах-потребителях (см. таблицу выше): `@/shared/api/data` → `@/features/<domain>/types`.

**🎯 Результат:** `npm run build`. Все DTO-типы определены в `features/*/types/`.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_after_definitions_removed** — определения удалены из `shared/api/checkout.ts`, `auth.ts`, `data/articles.ts`, `data/catalogStart.ts` (feature-файлы созданы, модули не обновлены) → build падает «Cannot find name» + «no exported member»
2. **build_green_after_feature_types** — модули импортируют+реэкспортируют из `features/*/types`, 5 компонентов переведены → build Success
3. **grep_no_dto_definitions_in_shared** — страж: `grep "interface Order|Session|CheckoutOptions|Article|CatalogStartData" src/shared/` — 0 (только import+re-export)
4. **smoke_pages** (ручная, лёгкая) — `/catalog`, `/checkout`, `/articles` рендерятся

---

---

### 10. [x] Убрать `(product as any)` в `ProductCard`

**📖 Что читать:**
- `src/features/catalog/components/ProductCard.tsx` — строки 24, 32
- `src/features/catalog/types/index.ts` — `ProductBase`, `TireProduct`, `WheelProduct`

**Ключевой код:**
```tsx
// ProductCard.tsx:24,32
const categoryPath = (product as any).category === "wheels" ? "wheels" : "tires";
<SeasonIcons season={(product as any).season} />
```

**Проблема:** `ProductBase` не содержит `category` и `season`, но `TireProduct`/`WheelProduct` (наследники) содержат. На деле все товары имеют эти поля.

**План:**
- Добавить в `ProductBase` (в `features/catalog/types/index.ts`):
  ```ts
  export interface ProductBase {
    // ... существующие поля
    category: "tires" | "wheels";
    season?: string;
  }
  ```
- `ProductCard` — заменить `(product as any).category` на `product.category`, `(product as any).season` на `product.season`.

**🎯 Результат:** `npm run build`. Ноль `as any` в `ProductCard.tsx`.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_typed_access_without_base_fields** — `ProductCard` переведён на `product.category`/`product.season` без изменения `ProductBase` → build падает «Property 'category' does not exist on type 'ProductBase'»
2. **build_green_after_base_fields** — `ProductBase` += `category: "tires" | "wheels"`, `season?: string` → build Success (проверяет и наследников)
3. **grep_no_as_any** — страж: `grep "as any" ProductCard.tsx` — 0
4. **renders_card_links** (ручная, лёгкая) — шины ведут на `/tires/...`, диски на `/wheels/...` (тернарник заменён прямым `product.category`)

---

## 🟢 Можно отложить

### 11. [x] Мок-контент из `getProduct()` в `data/products.ts`

**📖 Что читать:** `src/shared/api/data.ts` — функция `getProduct()` (строки ~172-267)

**Проблема:** HTML-описания, адреса, даты, списки брендов зашиты в коде API-функции.

**План:** Перенести жёстко зашитые строки в `data/products.ts`. `getProduct()` оставить логику сборки DTO.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_without_mock_content** — `product.ts` переведён на `PRODUCT_STATIC` и функции-шаблоны, в `data/products.ts` их нет → build падает
2. **build_green_after_mock_content** — статика добавлена в мок → build Success
3. **grep_no_hardcoded_content** — страж: `grep "Свердловский тракт|неснижаемый остаток|Транспортной компанией|descriptionHtml" src/shared/api/product.ts` — 0
4. **product_page_renders** (ручная, лёгкая) — описание, адрес, тексты и попапы на странице товара как раньше

**Решения по шагу (согласованы):** тексты с интерполяцией — функции-шаблоны в `data/products.ts` (`productDescriptionHtml(modelName, season)`, `manufacturerBadgeText(brandName)`, `productionCountryBadgeText(countryLabel)`, `yearBadgeText(year)`); `PRODUCT_STATIC` — объект без `as const` (массив images мутабельный — тип `string[]`); заголовки-композиции (`Год выпуска — …`) остаются в логике getProduct.

### 12. [x] `useCartCount` как селектор из кеша

**📖 Что читать:** `src/features/cart/api/useCartCount.ts` — 14 строк

**Проблема:** Делает второй `useQuery` с тем же key+fn, что и `useCart`. Правило 9: «селектор из кеша».

**План:** Переписать через `useQueryClient().getQueryData(queryKeys.cart.items)` + подписку. Или оставить как есть (работает корректно из кеша).

**Тест-лист (согласован 07.08.2026):**

1. **grep_no_usequery_in_useCartCount** — страж: `grep "useQuery" useCartCount.ts` — 0 (селектор не объявляет запрос)
2. **build_green** — сборка проходит, контракт хука цел, CartBadge не менялся
3. **counter_updates_from_cache** (ручная, лёгкая) — счётчик в шапке обновляется при изменении корзины (подписка, а не разовая выборка)

**Решения по шагу (согласованы):** `useSyncExternalStore` + `queryCache.subscribe` + `getQueryData` (снапшот стабилен: undefined или та же ссылка кеша — без зацикливания); красного прогона нет — замена внутренняя, контракт `() => number` не меняется (страж-шаг).

### 13. [x] Выделить `useEsc` хук

**📖 Что читать:**
- `src/shared/ui/CartPopup.tsx` — useEffect с keydown Escape
- `src/shared/ui/ConfirmRemovePopup.tsx` — такой же
- `src/shared/ui/ImageLightbox.tsx` — такой же

**План:** `shared/lib/useEsc.ts` — `export function useEsc(onClose: () => void)`.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_without_hook** — 3 попапа переведены на `useEsc`, файла нет → build падает «Module not found» ×3
2. **build_green_with_hook** — хук создан → build Success
3. **grep_no_manual_escape** — страж: `grep "Escape"` в 3 попапах — 0 (у ImageLightbox Escape уходит целиком, стрелки остаются)
4. **esc_closes_popups** (ручная, лёгкая) — Escape закрывает все 3 попапа; стрелки в лайтбоксе работают

**Решения по шагу (согласованы):** хук без useCallback-обёртки (переподписка при смене onClose — поведение идентично); в ImageLightbox остаётся локальный keydown только для стрелок (одно место — Rule of Three не дотягивает).

### 14. [x] `SeoBlock` получать SEO-контент через props

**📖 Что читать:** `src/features/catalog/components/SeoBlock.tsx` — 32 строки

**Проблема:** Импортирует `SEO_CONTENT` (статическую константу) из `shared/api/data`.

**План:** Передавать через props от серверной страницы. Константу перенести в `data/catalog.ts`.

**Тест-лист (согласован 07.08.2026):**

1. **build_red_without_content_prop** — `SeoBlock` требует `content`, страницы не обновлены → build падает «Property 'content' is missing» (6 вызовов, 2 страницы)
2. **build_green_after_pages** — `getSeoContent()` в seo.ts + передача из 2 страниц → build Success
3. **grep_no_data_in_component** — страж: `grep "SEO_CONTENT|shared/api" SeoBlock.tsx` — 0
4. **seo_renders** (ручная, лёгкая) — SEO-блок под каталогом шин и на авто-каскаде как раньше

**Решения по шагу (согласованы):** тип `SeoContent` → `features/catalog/types/index.ts` (правило 10), `SEO_CONTENT` в моке типизируется им; `getSeoContent()` → `shared/api/seo.ts` (правило 7 — страницы берут данные через API-слой); `SEO_CONTENT` остаётся в реэкспортах барреля; brand/season props остаются (подстановка в subtitle).

---

## Порядок выполнения

Шаги упорядочены по приоритету и минимизации конфликтов:

1. ✅ 🔴 Шаг 3 (EuLabel) — 3 файла, разминка — выполнено 07.08.2026
2. ✅ 🔴 Шаг 4 (CartPopup, CartBadge) — 5 файлов — выполнено 07.08.2026
3. ✅ 🔴 Шаг 2 (cityUrl, useCity) — 9 файлов — выполнено 07.08.2026
4. ✅ 🔴 Шаг 1 (разделение data.ts) — 12 модулей + баррел, 43 импорта потребителей — выполнено 07.08.2026
5. ✅ 🟡 Шаг 10 ((product as any)) — 2 файла — выполнено 07.08.2026
6. ✅ 🟡 Шаг 9 (DTO-типы) — 5 файлов, зависит от шага 1 — выполнено 07.08.2026
7. ✅ 🟡 Шаг 8 (useCreateOrder) — 2 файла, зависит от шага 1 — выполнено 07.08.2026
8. ✅ 🟡 Шаг 5 (useFilterStore) — 3-4 файла — выполнено 07.08.2026
9. ✅ 🟡 Шаг 6 (useCartItemActions) — 3 файла — выполнено 07.08.2026
10. ✅ 🟡 Шаг 7 (URL grammar) — 1 файл (+ 6 потребителей без изменений) — выполнено 07.08.2026
11. ✅ 🟢 Шаг 11 (мок-контент getProduct → data/products.ts) — выполнено 07.08.2026
12. ✅ 🟢 Шаг 12 (useCartCount — селектор из кеша) — выполнено 07.08.2026
13. ✅ 🟢 Шаг 13 (useEsc) — выполнено 07.08.2026
14. ✅ 🟢 Шаг 14 (SeoBlock через props) — выполнено 07.08.2026

После каждого шага: `npm run build`.

---

## Прогоны

| Шаг | Результат |
|-----|-----------|
| 1 | 🔴 build упал: Module not found @/shared/api/data ×43 → 🟢 build Success (фикс: import AttentionBlock в nav.ts) → grep модулей чист ✅ 07.08.2026 |
| 2 | 🔴 build упал: Expected 3 arguments (tires page:24) → 🟢 build Success → grep @/data 0 совпадений ✅ 07.08.2026 |
| 3 | 🔴 build упал: Module not found (ProductGallery:4, ProductCard:8) → 🟢 build Success → grep 0 совпадений ✅ 07.08.2026 |
| 4 | 🔴 build упал: Module not found ×5 (Header:7, BuyButton:9, AddToCartBlock:7) → 🟢 build Success → grep 0 совпадений ✅ 07.08.2026 |
| 5 | 🔴 Property 'wheelsFilterParams' does not exist on FilterStore → 🟢 build Success → grep старых имён 0 ✅ 07.08.2026 |
| 6 | 🔴 Module not found useCartItemActions ×12 → 🟢 build Success → в компонентах нет cart-хуков ✅ 07.08.2026 |
| 7 | 🔴 5 экспортов не найдены у 6 потребителей → 🟢 build Success (обёртки) → grep конфигов вне parseParams 0 ✅ 07.08.2026 |
| 8 | 🔴 Module not found useCreateOrder → 🟢 build Success → createOrder импортируется только из хука ✅ 07.08.2026 |
| 9 | 🔴 build упал (checkout.ts сломан: getCheckoutOptions исчез из баррела) → 🟢 build Success (2 фикса: возврат getCheckoutOptions, DeliveryMethod/PaymentMethod → features/checkout/types) → grep интерфейсов в shared 0 ✅ 07.08.2026 |
| 10 | 🔴 Property 'category' does not exist on ProductBase → 🟢 build Success (ProductBase += category, season?) → grep as any 0 ✅ 07.08.2026 |
| 11 | 🔴 build упал на импорте product.ts:4 (нет экспортов в моке) → 🟢 build Success (PRODUCT_STATIC + 4 функции-шаблона в data/products.ts) → grep хардкода 0 ✅ 07.08.2026 |
| 12 | страж-шаг (красного нет): 🔴 Missing getServerSnapshot (React 19 SSR) → 🟢 build Success (getServerSnapshot: () => undefined) → useQuery( в хуке 0 ✅ 07.08.2026 |
| 13 | 🔴 Module not found useEsc ×18 → 🟢 build Success (shared/lib/useEsc.ts) → ручного Escape-хендлера в попапах 0 ✅ 07.08.2026 |
| 14 | 🔴 Property 'content' is missing в SeoBlockProps → 🟢 build Success (SeoContent, getSeoContent, 2 страницы) → импортов данных в SeoBlock 0 ✅ 07.08.2026 |
