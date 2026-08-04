# План: Фаза 3 — Страница товара — ✅ ВЫПОЛНЕНО 04.08.2026

**Дата:** 04.08.2026

## Контекст

Фаза 2 (Каталог) завершена. Следующий шаг — страница товара `/tires/[modelSlug]/[sizeSlug]`. Сейчас там заглушка `<Placeholder />`. Шаблон: `.template/product/index.html` (галерея, параметры, табы, корзина).

## Файлы

| Действие | Путь | Назначение |
|---|---|---|
| **Создать** | `src/features/product/types/index.ts` | `ProductDetailData extends TireProduct` — поля для отображения (seasonLabel, quantityOptions, images[], tab-контент) |
| **Создать** | `src/features/product/components/ProductGallery.tsx` | Client: `useState(activeIndex)`, клик по thumbnail → смена main image, EuLabel |
| **Создать** | `src/features/product/components/ProductDetails.tsx` | Server: 12-строка параметров, цена, payment-info, встраивает AddToCartBlock |
| **Создать** | `src/features/product/components/AddToCartBlock.tsx` | Client: `useState(quantity)` + `<select>`, `useAddToCart()` + `setCartPopupOpen(true)` |
| **Создать** | `src/features/product/components/ProductTabs.tsx` | Client: `useState(activeTab)`, 6 табов (3 скрыты на мобиле), клик → scroll, все content-секции |
| **Создать** | `src/features/product/components/DescriptionExpand.tsx` | Client: `useState(expanded)`, max-height переключатель, «Показать всё»/«Скрыть» |
| **Изменить** | `src/shared/api/data.ts` | Добавить `getProduct(modelSlug, sizeSlug): Promise<ProductDetailData \| null>` |
| **Изменить** | `src/app/tires/[modelSlug]/[sizeSlug]/page.tsx` | Заменить заглушку: `generateMetadata`, `getProduct`, `notFound`, Breadcrumbs, галерея, details, табы |

## Дерево компонентов

```
page.tsx (Server)
├── Breadcrumbs (Server, существующий)
├── ProductGallery (Client)        — useState(activeIndex)
├── ProductDetails (Server)
│   ├── parameters-list (12 строк)
│   ├── price-info (current + old)
│   ├── AddToCartBlock (Client)    — useState(quantity) + useAddToCart()
│   └── payment-info (статика)
└── ProductTabs (Client)           — useState(activeTab)
    ├── menu-block (6 табов)
    ├── #description → DescriptionExpand (Client)
    ├── #availability (статика)
    ├── #delivery (статика)
    ├── #warranty (статика)
    ├── #reviews (пусто)
    └── #payment — таб рендерится, но секции нет (как в мокапе)
```

## Данные

- **Источник:** `getProduct(modelSlug, sizeSlug)` → `ALL_PRODUCTS.find()` + computed-поля
- **computed-поля** (имитация бэкенда): `seasonLabel`, `loadSpeedLabel`, `spikesLabel`, `runFlatLabel`, `quantityOptions` ([1..4] × price), `images[]`, tab-тексты
- **Тип:** `ProductDetailData extends TireProduct` с готовыми для рендера строками (контракт api-contract.md)

## Что переиспользуем

- `EuLabel` из `src/features/catalog/components/EuLabel.tsx`
- `Breadcrumbs` из `src/shared/layout/Breadcrumbs.tsx` (первое применение в проекте)
- `useAddToCart()` из `src/features/cart/api/useAddToCart.ts`
- `useUIStore.setCartPopupOpen` → `AddToCartPopup` (уже в макете)
- `resolveCityLabel` для хлебных крошек

## Порядок реализации

1. **Типы** → `src/features/product/types/index.ts`
2. **Данные** → `getProduct()` в `data.ts`
3. **Компоненты** → Gallery → AddToCartBlock → DescriptionExpand → ProductTabs → ProductDetails
4. **Страница** → `page.tsx` + `generateMetadata`
5. **Верификация:** открыть `/tires/viatti-strada-2/185-60-r15-84h`, проверить галерею, табы, «Показать всё», добавление в корзину, хлебные крошки, 404 для несуществующего slug

## Особенности

- **Таб «Оплата»** — рендерится в меню, но контент-секции нет (как в мокапе), клик = no-op
- **Таб «Отзывы»** — пустая секция, только заголовок и счётчик «25» в табе
- **Изображения** — все 4 thumbnails ведут на один и тот же `product.image` (реальные картинки — позже от бэкенда)
- **`#payment` секция отсутствует** — не добавлять, следовать мокапу
- **Галерея:** SVG-иконки (zoom/fullscreen) статичные, без функционала

## Будущее: /wheels/[modelSlug]/[sizeSlug]

Та же архитектура, адаптировать `ProductDetails` под параметры дисков (PCD, ET, hub bore, wheelType). Вне скоупа фазы 3.

---

## Факт выполнения

**✅ Сделано (основное):**
- `ProductDetailData extends TireProduct` — display-ready поля, `getProduct()` в data.ts
- `ProductGallery`: иконки сезонности (солнце/снежинка/all-season), первые 4 миниатюры + счётчик `+N`, клик → лайтбокс
- `ImageLightbox` (shared/ui): переиспользуемый — затемнение, стрелки, миниатюры, счётчик, ESC/X/оверлей
- `ProductDetails`: 12-row parameters-list, цена, `AddToCartBlock`
- `AddToCartBlock`: quantity select + useAddToCart + попап корзины внутри компонента (правильный товар, X/оверлей/ESC)
- `ProductTabs`: 6 табов, scroll, `DescriptionExpand` («Показать всё»/«Скрыть»)
- `Breadcrumbs` — первое применение, `generateMetadata` — динамический title
- `AddToCartPopup.tsx` удалён (попап перенесён в AddToCartBlock)
- Механика города: `cityValue: null` = не выбран → нет `?city=` в URL

**✅ Сделано (стили):**
- `.lightbox-*` — оверлей, стрелки, миниатюры, счётчик
- `.thumbnails-more` — тёмный блок `+N` на 5-й позиции
- `.cart_popup_overlay`, `.cart_popup_close`
- Убран scroll-snap слайдер из `.thumbnails` (возвращён 1:1 шаблону + колонка на мобиле)
- `.cart_popup` — `background: var(--color-white)` + `border-radius`

**⚠️ Требует доработки:**
- `/wheels/[modelSlug]/[sizeSlug]` — страница товара дисков (вне скоупа)
- Реальные изображения товаров — сейчас мок (4 шаблонных картинки × 2)
- EU-лейбл позиционирование в лайтбоксе (сейчас только на основном изображении)

**Инциденты сессии:**
- Слайдер thumbnails: 4×70px=280px помещалось в 540px контейнер без переполнения → стрелки не появлялись → заменён на лайтбокс
- `setCityValue` не принимал `null` → обновлён тип в сторе
- `appendCityParam` с `""` добавлял пустой `?city=` → изменён на пропуск при `!cityValue`
- CSS-файл с табами — `sed` использован для вставки (Edit не находил совпадение из-за tab/space)
