# План: Фаза 2 — Каталог (ядро системы)

**Дата:** 03.08.2026  
**Источник:** `.claude/plans/module-split.md` (фаза 2)  
**Шаблоны:** `.template/catalog/*.html` (8 файлов, проанализированы)

---

## 1. Данные — `src/data/catalog.ts`

Создать единый файл мок-данных каталога.

### 1.1. Справочники фильтра

| Справочник | Значения (из шаблона) | Нужно дополнить |
|---|---|---|
| Сезоны | `летняя` | `зимняя`, `всесезонная` |
| Бренды | `Viatti` | `Michelin`, `Nokian Tyres`, `Continental`, `Pirelli`, `Bridgestone` (из CLAUDE.md: slug-формат) |
| Ширины | `185`, `265`, `275`, `305`, `315` | Полный ряд: 145–355 с шагом 10 |
| Профили | `30`, `35`, `40`, `45`, `50`, `55`, `60`, `65`, `70` | Стандартный ряд |
| Диаметры | `R14`, `R15`, `R16`, `R19`, `R20`, `R21`, `R22` | `R13`–`R22` |
| Типы шин | (не выбраны) | `легковая`, `внедорожная`, `коммерческая` |
| Страны | `Россия` | `Германия`, `Франция`, `Япония`, `Китай` |

### 1.2. Товары

Генерировать из комбинаций бренд × модель × типоразмер. Шаблон даёт:
- **Viatti V-130 Strada Asimmetrico**: 8 типоразмеров (175/70 R14 … 315/30 R22), коды АА-00075631–АА-00075903
- Добавить ещё 2–3 бренда × 2 модели × ~6 типоразмеров каждая = ~30–40 товаров (для пагинации ~4 страницы по 12)

Поля карточки: `id, slug, brand, model, width, profile, diameter, season, loadIndex, speedRating, price, oldPrice, code, country, year, quantity, image`

### 1.3. Авто-словарь

```ts
// BMW — единственный бренд в шаблоне
AUTO_BRANDS = [{ id: "bmw", name: "BMW" }]
AUTO_MODELS = { bmw: ["1-series", "3-series", "5-series", "7-series", "X1", "X3", "X5", "X6", "X7", "M4", "i4", "iX"] }
AUTO_YEARS = { "bmw:x6": [2020, 2021, 2022, 2023, 2024, 2025, 2026] }
AUTO_MODIFICATIONS = { "bmw:x6:2026": [
  { id: "xdrive30d", name: "xDrive 30d", sizes: [...] }
] }
// + добавить ещё 2-3 марки для реалистичности
```

### 1.4. Модель (страница /tires/[modelSlug])

```ts
TIRE_MODELS = {
  "viatti-strada-2": {
    name: "Viatti V-130 Strada Asimmetrico",
    description: { image, params: { сезонность, назначение, рисунок, страна, шипы, runFlat }, text },
    sizesByDiameter: { r14: [...], r15: [...], r16: [...] }
  }
}
```

### 1.5. SEO-контент

Шаблон: заголовок «Шины {бренд}», преимущества, типоразмеры R13–R18. Генерировать динамически из фильтра или хранить статикой для моков.

---

## 2. Типы — `features/catalog/types/`

```ts
interface TireProduct {
  id: string; slug: string; brand: string; model: string;
  width: number; profile: number; diameter: number;
  season: string; loadIndex: string; speedRating: string;
  price: number; oldPrice?: number; code: string;
  country: string; year: string; quantity: number;
  image: string;
  euLabel?: { rollingResistance: string; wetGrip: string; noiseEmission: number };
}

interface FilterState {
  season?: string; brand?: string; width?: number;
  profile?: number; diameter?: number;
  priceMin?: number; priceMax?: number;
  delivery?: string[]; country?: string;
  tireType?: string;
  page?: number;
}

interface FilterOptions {
  seasons: string[]; brands: BrandOption[]; widths: number[];
  profiles: number[]; diameters: number[]; tireTypes: string[];
  countries: string[];
  priceMin: number; priceMax: number;
}

interface TireModel { slug, name, description, sizesByDiameter }
interface AutoBrand { id, name }
interface AutoModification { id, name, sizes: TireSize[] }
```

---

## 3. API — расширение `shared/api/data.ts`

```ts
getCatalogFilters(): Promise<FilterOptions>
getCatalogProducts(filter: FilterState): Promise<PaginatedResult<TireProduct>>
getModel(slug: string): Promise<TireModel>
getAutoBrands(): Promise<AutoBrand[]>
getAutoModels(brand: string): Promise<string[]>  // список slug-ов моделей
getAutoYears(brand: string, model: string): Promise<number[]>
getAutoModifications(brand: string, model: string, year: number): Promise<AutoModification[]>
getAutoResult(brand: string, model: string, year: number, mod: string): Promise<AutoResult>
```

Все — async, setTimeout 50ms, фильтрация товаров на моках (пока нет API).

---

## 4. Компоненты

### 4.1. `features/catalog/components/`

| Компонент | Назначение | Server/Client |
|---|---|---|
| `CatalogFilter` | Панель фильтров: табы (параметры/авто), селекты, слайдер цены, чекбоксы, кнопка «Подобрать» | Client (интерактив) |
| `PriceSlider` | Слайдер цены на pointer events | Client |
| `ProductCard` | Карточка товара `.catalog-product` | Server |
| `ProductGrid` | Сетка товаров (слот для карточек) | Server |
| `AutoModelsList` | Список марок/моделей авто (каскад) | Server |
| `CarBlock` | Блок с выбранным авто и секциями размеров (auto-selected) | Server |
| `CategorySection` | Секция с парами шин (auto-selected) | Server |
| `ModelDescription` | Описание модели + параметры | Server |
| `ModelSizes` | Типоразмеры по диаметрам с якорями | Server |
| `SeoBlock` | SEO-текст под каталогом | Server |

### 4.2. `shared/ui/`

| Компонент | Назначение |
|---|---|
| `Pagination` | Пагинация (1…41, текущая активна) — уже есть Placeholder, заменить на рабочий |
| `EuLabel` | Метка евростандарта (уже есть Placeholder) |

---

## 5. Роуты

### 5.1. `/catalog/tires/[[...params]]` — каталог с фильтрами

**Server Component.** Парсинг URL:
- Сегменты: сезон (`зимняя`→`winter`, `летняя`→`summer`, `всесезонная`→`all-season`), бренд (slug: `michelin`, `viatti`), ширина (число), профиль (число), диаметр (`r16`)
- Query: `price_min`, `price_max`, `delivery[]` (массив), `page`
- Сборка URL из фильтра → всегда фикс. порядок: `season/brand/width/profile/diameter` + query

Логика: `await getCatalogFilters()` + `await getCatalogProducts(parsedFilter)` → рендер.

### 5.2. `/catalog/tires/auto/[[...auto]]` — автоподбор

**Server Component.** Каскад:
- `/auto` → список марок
- `/auto/bmw` → список моделей BMW
- `/auto/bmw/x6` → список годов
- `/auto/bmw/x6/2026` → список модификаций
- `/auto/bmw/x6/2026/xdrive30d` → результат с CarBlock + CategorySection

### 5.3. `/tires/[modelSlug]` — страница модели

**Server Component.** `await getModel(slug)` → ModelDescription + ModelSizes.

### 5.4. `/catalog/wheels` — заглушка (диски)

Статическая страница-заглушка.

---

## 6. Что уже есть (не переделываем)

- `MainFilter` на главной — уже клиентский, нужно оживить: при выборе параметров → `router.push('/catalog/tires/...')`
- `Breadcrumbs` — уже есть, передавать `Crumb[]` из серверных страниц
- `Pagination` Placeholder → заменить на рабочий компонент
- `EuLabel` Placeholder → заменить на рабочий

---

## 7. Решения (03.08.2026)

- **7.1. Товары:** ~500 шт. (полноценная комбинаторика: 3 бренда × 2–3 модели × 6–8 типоразмеров каждая → 12 товаров на страницу, пагинация 41 страница). Генерация через вложенные циклы в `data/catalog.ts`.
- **7.2. Авто-словарь:** BMW (из шаблона, 12 моделей) + Audi + Mercedes-Benz + Toyota = 4 марки, у каждой 5–12 моделей, 3–5 годов, 1–3 модификации.
- **7.3. Слайдер цены:** min/max — динамические из `getCatalogFilters()` (мин/макс цены всех товаров). При API — от бэкенда.
- **7.4. SEO-контент:** статичный, 1-в-1 из шаблона (`.seo-content` из `index.html`). Позже заменить на динамический от бренда/сезона.
- **7.5. Ссылка в карточке:** как в шаблоне — в каталоге заголовок-ссылка на `/tires/[modelSlug]/[sizeSlug]`, в автоподборе и на странице модели — `<span>` без ссылки. Контролируется пропом `showLink`.
- **7.6. Парсер URL:** описанного в CLAUDE.md алгоритма достаточно. Сегменты `season(winter|summer|all-season)/brand/width/profile/rN` распознаются по типу (сезон — по Set, бренд — строка не-сезон/не-число/не-rN, числа — ширина→профиль, rN → диаметр). Порядок не важен при парсинге, фиксированный при сборке.

---

## 8. Порядок работ

1. **Данные** — `data/catalog.ts` (справочники + товары + авто-словарь + модель + SEO)
2. **Типы** — `features/catalog/types/`
3. **API** — async-функции в `shared/api/data.ts`
4. **ProductCard** + **EuLabel** (замена Placeholder'ов)
5. **CatalogFilter** + **PriceSlider** (клиентские)
6. **ProductGrid** + **Pagination**
7. **Роут** `/catalog/tires/[[...params]]` + парсер URL
8. **AutoModelsList** + каскад
9. **Роут** `/catalog/tires/auto/[[...auto]]`
10. **CarBlock** + **CategorySection** (auto-selected)
11. **ModelDescription** + **ModelSizes**
12. **Роут** `/tires/[modelSlug]`
13. **SeoBlock**
14. **MainFilter** — оживить (переход в каталог)
15. `/catalog/wheels` — заглушка
16. **Проверка** — `npm run build` + визуально

## 9. Ожидаемый результат

- Каталог с фильтрацией: URL-управляемые фильтры, серверный рендер товаров
- Автоподбор: каскад страниц brand→model→year→mod→result
- Модель: описание + типоразмеры по диаметрам
- Пагинация живая
- `npm run build` зелёный
