# План: разделение шаблона на модули для внедрения в frontend (Next.js)

**Цель:** декомпозировать статичный HTML-мокап (16 страниц, `style.css` 4611 строк) на переиспользуемые React-компоненты и перенести их в Next.js 16 приложение (App Router, `src/`), сохранив вёрстку и стили 1-в-1.

**Принятые решения (подтверждены пользователем 31.07.2026):**
1. CSS: глобальный `style.css` переносится целиком (BEM-классы сохраняются, `:root`-токены переходят автоматически).
2. Разметка: 1-в-1 с минимальной семантизацией (div→button, ссылка→form, чекбоксы→input) без смены классов.
3. Порядок: каркас → каталог → товар → корзина/заказ/прочее.
4. Стор UI/корзины: **Zustand**.
5. Данные: строим на **моках** (TS-типы + мок-данные из разметки), API (Laravel) подключится позже.
6. Ассеты: в `public/assets/`, пути в CSS `../img/...` → `/assets/img/...`.
7. Верификация: **визуальная** (скриншоты/глазами на 5 разрешениях), не автосравнение.
8. Next.js развёрнут в корне репозитория, `src/`-scaffold (create-next-app --src-dir).
9. Структура — сразу целевая: `src/app/` (роутинг), `src/features/<domain>/` (компоненты/типы/хуки/API домена), `src/shared/ui/` (примитивы), `src/shared/layout/` (Header/Footer/попапы), `src/data/` (моки), `src/stores/` (Zustand). Без промежуточной `src/components/`.

**Ресурсы шаблона (проверено 31.07.2026):** битых ссылок на img/fonts нет; из 51 файла `assets/img/` используются 29; fancybox в `assets/` отсутствует (заявлен в CLAUDE.md, но не нужен в React). Страниц compare / ЛК (account/*) / restore в шаблоне НЕТ — верстать по образцу существующих или отложить.

---

## 1. Карта модулей (декомпозиция шаблона)

### A. Layout-модули (общие для ВСЕХ страниц — дублируются байт-в-байт)

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
| Попапы `catalog-page-hide`/`catalog-page-open`, `.geo-wrapper` | boolean state в layout (Zustand) |
| `:has(#cat-wheels:checked)` — переключатель Шины/Диски | state `category` |
| `#count-in-busket` = 2, суммы, количества — захардкожены | стор корзины |
| `filter-mobile.html` — полный дубль filter-params | CSS-адаптив, отдельная страница не нужна |
| `catalog-menu.html` — 3 копии меню | один компонент |

---

## 2. Стратегия стилей

1. Скопировать `.template/assets/css/style.css` в `src/app/style.css`, импортировать в root layout.
2. Скопировать `assets/fonts/` (4 woff2) и `assets/img/` (~51 шт) в `public/assets/`; пути в CSS переписать: `../img/` → `/assets/img/`, `../fonts/` → `/assets/fonts/`.
3. Дизайн-токены `:root` (строки 36–54) — оставить как есть; дублирование в Tailwind `@theme` не требуется.
4. Tailwind не используется — вся стилизация на BEM-классах из `style.css` (см. `ui-porting.md` п.6).
5. Брейкпоинты мокапа (640/1024/1366, каталог 648) — уже в CSS; сверяться с конвенцией frontend (4 диапазона) при добавлении нового.

---

## 3. Фазы внедрения

**Фаза 0 — Подготовка** — ✅ ВЫПОЛНЕНО 01.08.2026
- Установить зависимости: `zustand`.
- Скопировать `.template/assets/css/style.css` → `src/app/style.css`, импортировать в layout.
- Скопировать `assets/fonts/` и `assets/img/` → `public/assets/`, поправить пути в CSS.
- Удалить Geist-шрифты из layout, `lang="ru"`.
- Обновить `.gitignore`: добавить `.template/node_modules/`, `.claude/verify/screenshots/`, `.claude/settings.local.json`, `.idea/`.
- Убедиться что `npm run build` проходит.

**Фаза 1 — Каркас (layout на всех страницах)** — ✅ ВЫПОЛНЕНО 01.08.2026
- Компоненты: `Header`, `Footer`, `CatalogMenu`, `GeoPopup`, `Benefits`, `Breadcrumbs`, `AddToCartPopup` — в `src/shared/layout/`.
- UI-примитивы (список B): `Button`, `Price`, `Rating`, `Pagination`, `EuLabel`, `PBadge`, `QuantitySelect`, `Checkbox`, `Select`, `Input` — в `src/shared/ui/`.
- Zustand: стор UI (город, попапы, меню открыто) + стор корзины (items, count, totals; счётчик в шапке) — в `src/stores/`.
- Данные: регионы/города из geo-попапа → `src/data/geo.ts` (~85 городов, data-id), меню/навигация — `src/data/nav.ts`.
- Порядок сборки: главная страница целиком на React → затем роуты-заглушки с каркасом.
- **Схема роутов (утверждена 31.07.2026, slug вместо id):**
  - Каталог шин: `/catalog/tires/[[...params]]` — catch-all сегменты `season(winter|summer|all-season)/brand/width/profile/rN` + query (`price_min`, `price_max`, `delivery[]`, `page`). Парсер сегментов в `catalog/tires/[[...params]]/page.tsx` (распознавание по типу: сезон — по Set, бренд — первый не-сезон/не-число/не-rN, числа — ширина→профиль, `rN` — диаметр; порядок сегментов не важен). Сборка ссылок из фильтра — всегда фиксированный порядок `season/brand/width/profile/diameter`. Страница `force-static` (при API убрать).
  - Авто: `/catalog/tires/auto/[[...auto]]` — каскад марка→модель→год→модификация → результат с парами шин.
  - Модель/товар: `/tires/[modelSlug]`, `/tires/[modelSlug]/[sizeSlug]` (185-60-r15-84h); диски — `/catalog/wheels` (заглушка, шаблона нет).
  - Сервисные: `/cart`, `/checkout`, `/order/[id]`, `/order-status` (гостевая проверка), `/auth/login`, `/auth/register`, `/articles`, `/articles/[id]`.
  - Сервисные страницы: `/service-page/[slug]` (добавлено 05.08.2026 — контент по `GET /api/service_page/<slug>`).
  - ЛК: `/account` → `/account/profile`, `/account/orders`, `/account/orders/[id]`, `/account/garage`, `/account/favorites`, `/account/addresses` (макетов нет — верстать по образцу шаблона).

**Фаза 2 — Каталог** — ✅ ВЫПОЛНЕНО 04.08.2026
- Компоненты: `ProductCard`, `CatalogFilter`, `PriceSlider`, `AutoSelectForm`, `SeoBlock` — в `src/features/catalog/components/`; `MainFilter`, `SectionProduct`, `ProductList`, `DiscountBlock`, `ThreeBlocks`, `AboutCompany` — в `src/features/home/components/`; `Pagination` — в `src/shared/ui/`.
- Типы: `TireProduct`, `TireModel`, `FilterState` — в `src/features/catalog/types/`.
- Данные: `src/data/catalog.ts` — типоразмеры, опции фильтра, авто-словарь BMW, пары AUTO_RESULT, SEO.
- Роуты: `/catalog/tires/[[...params]]` (парсинг сегментов + query), `/catalog/tires/auto/[[...auto]]` (каскад → список моделей → результат с car-block и парами), `/tires/[modelSlug]` (описание + типоразмеры по диаметрам с якорями).
- `/catalog/wheels` — заглушка (шаблона дисков нет).
- Слайдер цены — интерактивный на pointer events без библиотек.
- Подбор по авто — каскад марка→модель→год→модификация.
- «Купить» на карточке — add-to-cart + открытие `AddToCartPopup`.

**Фаза 3 — Товар** — ✅ ВЫПОЛНЕНО 04.08.2026
- `ProductGallery` (client): thumbnails → main image + EuLabel, SVG-иконки
- `ProductDetails` (server): 12-row parameters-list, цена, `AddToCartBlock`
- `AddToCartBlock` (client): quantity select + useAddToCart + cart popup
- `ProductTabs` (client): 6 табов (3 hide-on-mobile), scroll, content-секции
- `DescriptionExpand` (client): «Показать всё»/«Скрыть»
- `ProductDetailData extends TireProduct` — display-ready поля от «бэка»
- `getProduct(modelSlug, sizeSlug)` в shared/api/data
- `Breadcrumbs` — первое применение в проекте
- `generateMetadata` — динамический title/description
- Роут: `/tires/[modelSlug]/[sizeSlug]`
- Домен: `src/features/product/` (типы + компоненты)
- `ImageLightbox` (shared/ui): затемнение, стрелки, миниатюры, ESC/X/оверлей
- `SeasonIcons` (shared/ui): солнце/снежинка/all-season, инлайн-SVG 25×25
- `ParamBadge` (shared/ui): p-badge + createPortal-попап (каталог + товар)
- `CartPopup` (shared/ui): попап корзины, +/−, переход в корзину
- `ConfirmRemovePopup` (shared/ui): подтверждение удаления
- `BuyButton` (каталог): «Купить»/«Убрать» + скелетон до гидрации
- `ProductParam` в `shared/types/product.ts` — общий для каталога и товара
- `ProductBase.parameters: ProductParam[]` — динамический рендер в каталоге (4 шт.)
- Механика города: `cityValue: null` = не выбран → нет `?city=` в URL
- `docs/back-api-map/`: параметры товара в tires.md и wheels.md

**Фаза 4 — Оформление и сервисные** — ✅ ВЫПОЛНЕНО 05.08.2026
- `CartItemRow`, `CartPage` (пустое состояние + `.cart_total`) — `src/features/cart/components/`; `CartItem` расширен (`code`, `availability`).
- `CheckoutPage` (шаги 1–3, `.active` → контролируемый state, город из useCity, сайдбар из корзины) — `src/features/checkout/components/`; опции (склады, ТК, оплата, agreement) — мок `src/data/checkout.ts`.
- Мок-флоу заказа: `createOrder/getOrder/getOrderByNumber` в data.ts (localStorage «orders», label доставки/оплаты от «бэка»); `/order/[id]` — клиентская страница (useOrder), страница по образцу корзины + `.order-info`.
- `/order-status` — форма ввода номера → статус заказа (useOrderByNumber, enabled).
- Мок-сессия: `getSession/loginMock/registerMock/logoutMock` (localStorage), хуки в `features/auth/api/`, `AuthForm` (login/register, чекбокс-«Запомнить меня»), `LoginBadge` в шапке (имя → /account), `LogoutButton` + `AccountPage` в `/account`.
- Статьи: мок `src/data/articles.ts` (9 статей, slug/дата/анонс/contentHtml), `getArticles/getArticle/getRelatedArticles`, `ArticlesList` (NewsCard + ссылки `/articles/[slug]`), `ArticlePage` (+ похожие); NewsCard получил href, опечатка «Подребнее» → «Подробнее».
- Роуты: `/cart`, `/checkout`, `/order/[id]`, `/order-status`, `/auth/login`, `/auth/register`, `/articles`, `/articles/[id]` — заглушки фазы 1 заменены. `/account` — минимум (приветствие + выход); `/account/*` — заглушки.
- Решения 05.08.2026: RHF+Zod отложены до API (формы на useState + HTML-валидация); мок-пагинация статей не воспроизводится (9 статей — 1 страница); build локально не гонялся (dev-контейнер), проверено lint/tsc/SSR-ответы 30034.

**Доработки 05.08.2026 (после фазы 4)** — подробности в `.claude/plans/service-pages.md`:
- Механика сервисных страниц: шапка/футер из мок-`/api/service_pages` (`{type, items[{link, link_name}]}`), роут `/service-page/[slug]` по `GET /api/service_page/<slug>` (10 страниц, notFound, generateMetadata). `NAV_LINKS`/`FOOTER_GROUPS` удалены.
- Хедер: logo → `/`, статус заказа/корзина — ссылки; кнопка «Каталог» открывает меню (был баг с `href="#"`); попап меню прижат слева и на весь экран (fixed без left/top центрировался во flex-родителе — артефакт мокапа).
- Главная переведена на структуру `GET /api/service-page/main` (мок `HOME_DATA`): attention_blocks (плашки, color hex, link/link_name), slider.tires/wheels (цены числа, season у шин), news, description, seo (title/description; rating и h1 убраны из API). Заголовки секций, DiscountBlock, ThreeBlocks — статичны. Контракт — память `home-api-main`.
- Слайдеры главной: стрелки ←→ (scrollBy, disabled на краях) + нативный scroll-snap; иконки сезонности в карточке — SeasonIcons (у дисков season в API нет — пусто, подсвечено бэку).
- Стартовая страница каталога `/catalog` (из .template/catalog/start.html): 4 карточки (шины/диски × параметры/авто) + бренды (14 шин, 12 дисков, транслит-слаги). Мок `src/data/catalogStart.ts` (имитация /api/catalog-start), CSS catalog-start-* перенесён из шаблона (в шаблоне появился после копии — diff style.css!). Иконки карточек — огромные svg в `catalog-start-icons.tsx`.

**Фаза 5 — Верификация**
- Ручная визуальная проверка на 5 разрешениях (390/768/1024/1366/1920): отсутствие переполнений, битых картинок, расхождений с мокапом.
- Скрипты `.claude/verify/` остаются эталоном только для мокапа (Playwright не ставится — модель без vision, скриншоты не анализируются).

---

## 4. Ожидаемый результат

- Набор из ~25 React-компонентов (layout 7, UI 10, карточки 4, секции 14), 1-в-1 воспроизводящих мокап по вёрстке и стилям.
- Все 7 доменов шаблона (главная, каталог, товар, корзина, заказ, статьи, вход) реализованы как роуты frontend.
- Верификация на 5 разрешениях без переполнений и битых картинок.

---

## 5. Открытые вопросы

- Страницы вне шаблона (compare, ЛК account/*, restore): верстать по образцу существующих страниц или отложить до появления макетов.
- Слайдеры главной (scroll-snap) и статичный слайдер цены — остаются CSS, JS-библиотеки из мокапа (slick/fancybox) в React не нужны.
