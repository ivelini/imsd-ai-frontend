# План: разделение шаблона на модули для внедрения в frontend (Next.js)

**Цель:** декомпозировать статичный HTML-мокап (14 страниц, `style.css` 4611 строк) на переиспользуемые React-компоненты и перенести их в `/home/perminoviv/my/imsd-ai/frontend` (Next.js 16, Tailwind v4, пока пустой каркас), сохранив вёрстку и стили 1-в-1.

**Принятые решения (подтверждены пользователем 31.07.2026):**
1. CSS: глобальный `style.css` переносится целиком (BEM-классы сохраняются, `:root`-токены переходят автоматически).
2. Разметка: 1-в-1 с минимальной семантизацией (div→button, ссылка→form, чекбоксы→input) без смены классов.
3. Порядок: каркас → каталог → товар → корзина/заказ/прочее.
4. Стор UI/корзины: **Zustand**.
5. Данные: строим на **моках** (TS-типы + мок-данные из разметки), API (Laravel) подключится позже.
6. Ассеты: в `public/assets/`, пути в CSS `../img/...` → `/assets/img/...`.
7. Верификация: **визуальная** (скриншоты/глазами на 5 разрешениях), не автосравнение.
8. `frontend/` удалён — внедрение начинается с чистого Next.js (create-next-app заново).

**Ресурсы шаблона (проверено 31.07.2026):** битых ссылок на img/fonts нет; из 51 файла `assets/img/` используются 29; fancybox в `assets/` отсутствует (заявлен в CLAUDE.md, но не нужен в React). Страниц compare / ЛК (account/*) / restore в шаблоне НЕТ — верстать по образцу существующих или отложить.

---

## 1. Карта модулей (декомпозиция шаблона)

### A. Layout-модули (общие для ВСЕХ 14 страниц — дублируются байт-в-байт)

| Модуль | Источник | Ключевые классы |
|---|---|---|
| `Header` | все страницы, `.additional-menu` | `.header-container`, `.header-location-block` (город + телефон), `.navigation-block` (7 ссылок), `.gr1/.gr2`, `#hide-show-catalog` (бургер), `.logo`, `.catalog-button`, `.search-input`, `.user-panel` (`#order-status`, `#header-login`, `#busket` + `#count-in-busket`) |
| `Footer` | все страницы | `.footer-content`, `.footer-group` (+ `.footer-group-center`, `.fg-hide`, `.fg-hide-2`), `.footer-grup-num`, `.footer-get-call`, `.social-row-item` |
| `CatalogMenu` (выпадающее меню) | `.catalog-hidden-menu#catalog-menu` | `.catalog-page-panel`, `.catalog-page-logo`, `.catalog-page-close`, `.catalog-page-seacrh-input`, `.catalog-page-link-group` ×2, `.catalog-page-footer` (телефон, кнопка, `.social-links-blk`) |
| `GeoPopup` | `.geo-wrapper > .geo-window` | `.geo-window-panel`, `.geo-location-window-search`, `.geo-location-window-list` (3 региона `data-id`), `.geo-location-window__location-list` (3 списка городов, `.geo-location-window__link_active`) |
| `Benefits` (плашки) | `.benefits` | `.benefit.benefit--red/--gold/--green` |
| `Breadcrumbs` | `.search-query-blk` | `.search-query` (класс хлебных крошек в CSS отсутствует — создать по образцу `.search-query`) |
| `AddToCartPopup` (попап корзины) | `popups/cart.html` | `.cart_popup`, `.cart_popup_item`, `.cart_popup_btns` |

### B. UI-примитивы

| Модуль | Классы / источник |
|---|---|
| `Button` (1 вариант, 12 применений) | база `.primary-button`; применения: `.buy-button`, `.buy-now`, `.get-result`, `.submit-button`, `.auto-select-submit`, `.footer-get-call`, `.catalog-page-btn`, `.add-to-cart-button`, `.cart_total_next`, `.cart_popup_btn_cart`, `.order_form_method_btn_submit`, `.auth_submit`. Вторичные: `.secondary-btn`, `.white-button`, `.cart_popup_btn_close` |
| `Price` | `.current-price`/`.old-price` (товар), `.catalog-product-new-price`/`.catalog-product-old-price` (карточка) |
| `Rating` | `.rating-block`, `.star-rating`, `.num-rating`, `.rating-value` |
| `Pagination` | `.pagination`, `.pagination-link` (+`_active`), `.pagination-dots`, `.pagination-next` |
| `EuLabel` | `.eu-label`, `.rolling-resistance.category-*`, `.wet-grip.category-*`, `.noise-emission` |
| `PBadge` | `.p-badge` (ссылка «Viatti >») |
| `QuantitySelect` | `.quantity-select` (цена × кол-во в option) |
| `Checkbox` | `.custom-checkbox-container:has(input:checked)`, `.option`, `.auth_remember` |
| `Select` | `.custom-select` + `.select-arrow` |
| `Input` | паттерны: `.search-input`, `.order_form_*_input`, `.auth_field input`, `.geo-location-window-search-input`, `.auto-select-input` |

### C. Карточки

| Модуль | Источник | Классы |
|---|---|---|
| `ProductCard` (каталог) | `catalog/*` | `.catalog-product` (+ `.product-pair` в auto-selected; заголовок со ссылкой / без), `.catalog-product-image` (+`.image-panel`, `.eu-label`), `.catalog-product-details` (`.title`, `.prices`, `.general-info` с `.product-code`/`.country`/`.p-badge`, `.merge-block` → `.location-info` (`.choice-city`, `.pickup`, `.free-shipping`) + `.purchase-actions` (`.buy-now`, `.availability`)) |
| `SectionProduct` (главная) | `index.html` | `.section-product` (`.product-photo-blk`, `.product-title`, `.product-details` (`.icons` day/snw/sh, `.star-rating`), `.price-info`, `.buy-button-blk`) |
| `NewsCard` | главная + `article/index.html` | `.news` (`.news-image`, `.news-title`, `.news-text`, `.go-news-link`) |
| `CartItem` | `cart/index.html` | `.cart_item` (`.img`, `.info` (`.title`, `.more` → `.code`+`.av`, `.price`), `.quantity` (+/-, `.number`), `.total` (`.total_price`, `.total_delete`)) |

### D. Страничные секции

| Секция | Источник | Классы |
|---|---|---|
| `MainFilter` (свитчер Шины/Диски) | `index.html` | `.filter-block`, `.filter-item` (`.for-wheels`/`.for-disk` + `.inactive`), `#cat-wheels`/`#cat-disk` (radio; `:has()` заменить на состояние React), `.filter-menu` (`.switcher`, `.filter-switcher-option`), `.filter-content-item.disk/.auto` (6+3 селекта) |
| `DiscountBlock` | `index.html` | `.discount-block`, `.block-title`, `.block-button` |
| `ThreeBlocks` (отзывы/гарантия/помощь) | `index.html` | `.three-blocks`, `.block`, `.customer-reviews`, `.rating-block`, `.white-button`, `.decoration` |
| `ProductList` (шины/диски) | `index.html` | `.wheels-section`/`.disk-section`, `.product-list` (scroll-snap), `.highlight-text` |
| `AboutCompany` | `index.html` | `.about-company-section`, `.about-company-text` |
| `CatalogFilter` | `catalog/*` (4 состояния) | `.catalog-panel` (`.catalog-panel-filters`, `.catalog-panel-defaults`), `.catalog-filter` (+`.catalog-filter-show`), `.catalog-filter-category` (`#paramFilter`/`#carFilter` + `.inactive`), `.catalog-filter-cont`: `.city-change-catalog`, `.calatog-select-col` (6 селектов `catalog-*Select`), `.calatog-select-col-hide` (авто: `manufacturer/model/year/modificationSelect`), `.filter-price` (`#priceMin`/`#priceMax`, `.price-range-track/-fill/-thumb` — состояния `left/right`), `.delivery-checkbox-group` (4 `.option`), `.country-selet-2`, `.get-result`, `.remove-filters.help` |
| `AutoSelect` (подбор по авто) | `catalog/auto*.html` | `.auto-models` (`.auto-models-list`), `.car-block` (`.car-name`, `.car-sections` → `.car-section` (`.car-section-options` → `.custom-checkbox` с `data-width/height/diameter`)), `.category-section` (`.category-section-header`, `.category-section-size`, `.pair-group` из 2 ProductCard, 2-я с `.product-pair`) |
| `ModelPage` | `catalog/model.html` | `.model-page`, `.model-description` (`.model-info` → `.model-description-image` + `.model-description-params` (`.model-param` = `.model-param-name` + `.parameter-dots` + `.model-param-value`), `.model-description-text`), `.model-sizes` (`.model-sizes-nav` — якоря `#diameter-r14..16`, `.model-diameter` + `.model-diameter-title`) |
| `SeoBlock` | `catalog/index|auto|auto-selected` | `.seo-content` (`.seo-content-title/-subtitle/-list/-sizes`, `.seo-size-link`) |
| `ProductPage` (товар) | `product/index.html` | `.gallery` (`.gallery-panel` 2 svg, `.main-image` + `.eu-label`, `.thumbnails` + `_active`), `.details` (`.details-name`, `.parameters-list` (`.parameter-item` = name + `.parameter-dots` + value/`.p-badge`), `.price-payment-shipping` (`.price-info`, `.quantity-select`, `.payment-info` (`.payment-option`), `.add-to-cart-button`)), `.menu-block` (вкладки `.menu-item` + `_active`), `.section` по вкладкам (Описание/Наличие/Доставка/Гарантия/Отзывы) |
| `CartPage` | `cart/index.html` | `.cart_row` → `.cart_in` (CartItem ×3) + `.cart_total` (`.cart_total_top`, `.cart_total_list`, `.cart_total_next`) |
| `OrderPage` | `order/index.html` | `.order_row` → `.order_form` (шаг 1 `.order_form_details`: 5 полей + подсказки; шаг 2 `.order_form_delivery`: `.order_form_delivery_item` ×3 с `.active` (самовывоз/доставка/ТК) + `.order_form_delivery_town`; шаг 3 `.order_form_method`: `.order_form_method_item` ×2 с `.active`, `.order_form_method_btn`) + `.order_total` (`.order_total_top`, `.order_total_list`) |
| `AuthForm` | `user/login.html`, `user/register.html` | `.auth_card`, `.auth_field` (+`.auth_field_label_row`, `.auth_field_prompt`), `.auth_remember`, `.auth_submit`, `.auth_switch` |
| `ArticlePage` / `ArticlesList` | `article/view.html`, `article/index.html` | `.article-section` (`.article-title`, `.article-meta`, `.article-photo`, `.article-content`), список = NewsCard + `.pagination` |

### E. Состояния (статичные страницы → props/state в React)

| Состояние мокапа | React-эквивалент |
|---|---|
| `catalog-filter-show` / без (открыт/закрыт фильтр) | prop `open` у `CatalogFilter` |
| Вкладки `.filter-item-catalog` + `.inactive` («По параметрам»/«По автомобилю») | state `activeTab` |
| `filter-applied.html` (выбранные option, цены 8 000–25 000, слайдер left/right, checked чекбоксы, 2 товара) | state фильтра + выборка товаров |
| `.calatog-select-col-hide` (колонка авто) | условный рендер по activeTab |
| `.product-pair` (2-я карточка пары) | prop `pair` у ProductCard |
| Попапы `catalog-page-hide`/`catalog-page-open`, `.geo-wrapper` | boolean state в layout (Context/Zustand) |
| `:has(#cat-wheels:checked)` — переключатель Шины/Диски | state `category` |
| `#count-in-busket` = 2, суммы, количества — захардкожены | стор корзины |
| `filter-mobile.html` — полный дубль filter-params | CSS-адаптив, отдельная страница не нужна |
| `catalog-menu.html` — 3 копии меню | один компонент |

---

## 2. Стратегия стилей

1. Скопировать `assets/css/style.css` в `frontend/src/app/style.css` (или `src/styles/`), импортировать в root layout после tailwind.
2. Скопировать `assets/fonts/` (4 woff2) и `assets/img/` (~51 шт) в `frontend/public/`; пути в CSS (`../img/...`, `../fonts/...`) переписать на `/img/...`, `/fonts/...` (или переносить в `public/assets/` чтобы не трогать пути).
3. Дизайн-токены `:root` (строки 36–54) — оставить как есть; дублирование в Tailwind `@theme` не требуется.
4. Tailwind: подключён, но используется только для служебных вещей; весь шаблонный UI на BEM-классах.
5. Брейкпоинты мокапа (640/1024/1366, каталог 648) — уже в CSS; сверяться с конвенцией frontend CLAUDE.md (4 диапазона) при добавлении нового.

## 3. Фазы внедрения

**Фаза 0 — Подготовка** — ✅ ВЫПОЛНЕНО 31.07.2026
- Next.js 16.2 развёрнут в корне каталога (TS + Tailwind + App Router + src/ + Turbopack); мокап перенесён в `.template/` (git mv), verify-скрипты указывают на `.template/`; .gitignore смержен; playwright в devDeps.
- `assets/css/style.css` → `src/app/style.css` (импорт в layout после globals.css), img+fonts → `public/assets/`, пути в CSS: `../img` → `/assets/img`, `../fonts` → `/assets/fonts`.
- Geist-шрифты удалены (Noto Sans/Nunito через `@font-face`), `lang="ru"`; заглушка главной с `.benefits` — `npm run build` зелёный.

**Фаза 1 — Каркас (layout на всех страницах)** — ✅ ВЫПОЛНЕНО 31.07.2026
- Компоненты: `Header`, `Footer`, `CatalogMenu`, `GeoPopup`, `Benefits`, `Breadcrumbs`, `AddToCartPopup`.
- Zustand: стор UI (город, попапы, меню открыто) + базовый стор корзины (items, count, totals; счётчик в шапке).
- Данные: регионы/города из geo-попапа → TS-модуль (~85 городов, data-id), меню/навигация — константы.
- Порядок сборки: главная страница целиком на React → затем роуты-заглушки с каркасом.
- **Схема роутов (утверждена 31.07.2026, slug вместо id):**
  - Каталог шин: `/catalog/tires/[[season]/[brand]/[width]/[profile]/[r-diameter]]` — необязательные сегменты (winter|summer|all-season, slug бренда, числа, rN); остальное — query (`price_min`, `price_max`, `delivery[]`, `page`). Состояния мокапа: index=базовый, filter-params/car=state, filter-applied=типоразмерный сегмент, filter-mobile=CSS.
  - Авто: `/catalog/tires/auto`, `/catalog/tires/auto/[brand]/[model]/[year]/[modification]`.
  - Модель/товар: `/tires/[modelSlug]`, `/tires/[modelSlug]/[sizeSlug]` (185-60-r15-84h); диски — `/catalog/wheels/...`, `/wheels/...`.
  - Сервисные: `/cart`, `/checkout`, `/order/[id]`, `/order-status` (гостевая проверка), `/auth/login`, `/auth/register`, `/articles`, `/articles/[id]`.
  - ЛК: `/account` → `/account/profile`, `/account/orders`, `/account/orders/[id]`, `/account/garage`, `/account/favorites`, `/account/addresses` (макеты из удалённой копии НЕ восстанавливать — там другая вёрстка; верстать по образцу шаблона).

**Фаза 2 — Каталог** — ✅ ВЫПОЛНЕНО 31.07.2026
- Решения: слайдер цены — интерактивный на pointer events без библиотек; подбор по авто — каскад марка→модель→год→модификация; «Купить» на карточке — add-to-cart + AddToCartPopup.
- Сделано: `catalog.ts` (модель Viatti 4 типоразмера, опции фильтра, авто-словарь BMW, пары AUTO_RESULT, SEO); `ProductCard` (linkTitle/pair, EU, add-to-cart), `CatalogFilter` (вкладки, 6 селектов, слайдер цены, доставка, страна, каскад авто, URL-применение), `PriceSlider`, `AutoSelectForm`, `Pagination`, `SeoBlock`; страницы `/catalog/tires/[[...params]]` (парсинг сегментов season/brand/width/profile/r-diameter + query), `/catalog/tires/auto/[[...auto]]` (каскад → список моделей → результат с car-block и парами), `/tires/[modelSlug]` (описание + типоразмеры по диаметрам с якорями).
- Не сделано: оживление селектов главной (MainFilter → переход в каталог) — отложено; `/catalog/wheels` остаётся заглушкой (шаблона дисков нет).
- `ProductCard` (все варианты), `CatalogFilter` (open/activeTab/applied), `AutoSelect` (3 шага), `ModelPage`, `Pagination`, `SeoBlock`, `MainFilter` (главная).
- Роуты: `/catalog/tires`, `/catalog/wheels`, страница модели `/tires/[id]`, подбор по авто.
- Данные: карточки товара, типоразмеры, пары — типы TS + мок-данные из разметки.

**Фаза 3 — Товар** — ⏳
- `ProductPage`: галерея (зум/активный thumb — состояние), параметры, количество, вкладки (Описание/Наличие/Доставка/Гарантия/Отзывы — client state).
- Стор корзины (add-to-cart, счётчик в шапке).

**Фаза 4 — Оформление и сервисные** — ⏳
- `CartPage`, `OrderPage` (шаги 1–3 с `.active` переключателями → контролируемые), `AuthForm` (login/register), `ArticlesList`/`ArticlePage`.
- Попап корзины после добавления (состояние).

**Фаза 5 — Верификация** — ⏳
- Визуальная проверка на 5 разрешениях (390/768/1024/1366/1920): отсутствие переполнений, битых картинок, расхождений с мокапом. Playwright-скрипты шаблона (`verify.mjs`) остаются эталоном для мокапа.

## 4. Ожидаемый результат

- Набор из ~25 React-компонентов (layout 7, UI 10, карточки 4, секции 14+), 1-в-1 воспроизводящих мокап по вёрстке и стилям.
- Все 12 доменов шаблона реализованы как роуты frontend.
- Верификация Playwright: 60 комбинаций без переполнений и битых картинок.

## 5. Открытые вопросы

- Страницы вне шаблона (compare, ЛК account/*, restore): верстать по образцу существующих страниц или отложить до появления макетов.
- Роутинг frontend: восстанавливать ли структуру роутов из удалённой документации (ARCHITECTURE.md) или строить по доменам шаблона (главная, каталог, товар, корзина, заказ, статьи, вход).
- Слайдеры главной (scroll-snap) и статичный слайдер цены — остаются CSS, JS-библиотеки из мокапа (slick/fancybox) в React не нужны.

## 6. Промт для запуска каждой фазы (шаблон)

> Внедряю в `/home/perminoviv/my/imsd-ai/frontend` фазу N: [перечислить компоненты].
> Источник вёрстки — `/home/perminoviv/my/imsd-ai/template/[страница].html`, стили — `assets/css/style.css` (секция «[название секции]», строки N–M), токены в `:root`.
> Требования: переносить классы и DOM 1-в-1, семантизация только теги (button/form/input) без смены классов; адаптив 5 разрешений; не менять style.css.
> После завершения — отчёт: список файлов, что сделано, что не переносилось и почему.
