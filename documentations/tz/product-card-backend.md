# ТЗ: карточка товара шин и дисков на живом API

- **Статус:** реализовано на бэке (2026-10-22, план `.claude/plans/product-card-api.md`);
  фронт переведён 22.10.2026
- **Дата:** 2026-10-22
- **Адресат:** бэкенд `imsd-backend` (Laravel)
- **Потребитель:** фронт `/tires/{brand}/{model}/{size}` и `/wheels/{brand}/{size}` —
  оба маршрута на живом API
- **Связанные ТЗ:** `auto-selection-backend.md`, `vehicle-slugs-backend.md`
- **Реализация фронта:** карточка на живом API (22.10.2026); план закрыт

## 1. Цель

Страница товара (типоразмер шины; позиция диска) на живых данных: H1, галерея,
параметры, цены, наличие/сроки, вкладки (описание/наличие/доставка/гарантия/отзывы).
Сейчас страница полностью на моке (`getProduct` → `ALL_PRODUCTS`), live-модель шин
ведёт на мок-товар, часть слагов даёт переходный 404. Диски: карточки листинга без
ссылок — товарного маршрута нет совсем.

## 2. Текущее состояние (проверено)

- В Scramble-экспорте (`public-api.json`) товарного эндпоинта нет: только листинги
  `GET /catalog/tires`, `GET /catalog/wheels`, модель `GET /catalog/tire-models/{brand}/{model}`,
  подбор by-vehicle. Названных схем нет — листинги с inline-схемами.
- Фронт-типы зеркалят контракт: `TireListItemDto`, `WheelListItemDto`
  (`src/features/catalog/types/index.ts`); товарный DTO — `ProductDetailData`
  (`src/features/product/types/index.ts`) — расширяет `TireProduct` готовыми строками
  (контракт `api-contract.md`: label формирует бэк).
- Поля, которых нет на бэке, в адаптере листинга — пустые дефолты:
  `loadIndex`/`speedRating`/`tireType` = `""`, `code`/`country` = `""`.
- Вкладки товарной страницы: Описание, НАЛИЧИЕ, Доставка, Гарантия, Отзывы
  (`ProductTabs.tsx`). Отзывов на бэке нет вообще.
- Статика товара — `src/data/products.ts`: `PRODUCT_STATIC` (pickupDate,
  deliveryLabel, storeAddress, storeHours, reviewCount, availabilityText,
  deliveryText, warrantyText) + генерация descriptionHtml и текстов попапов бейджей.

## 3. Эндпоинты (новые)

Адресация слагами — как у модели шин (`/catalog/tire-models/{brand}/{model}`).
Уточнено по итогам сверки с бэком 22.10.2026: слаг позиции уже содержит brand+model
(`ProductSlugBuilder`), поэтому:

```
GET /api/catalog/tires/{brand}/{model}/{size}
GET /api/catalog/wheels/{brand}/{size}
```

- Шины, 3 сегмента: `{size}` — **полный** `slug` позиции из листинга
  (`aplus-a503-175-65-r14-86t-studded`); поиск точным совпадением `slug = {size}`.
  `{brand}`/`{model}` — декоративные; бэк сверяет их со слагами бренда/модели товара,
  несовпадение → 404 (страховка от дублей URL).
- Диски, 2 сегмента: модель в слаг диска не входит (слаг = brand-имя-спеки,
  model_id nullable) — `{size}` = слаг без префикса бренда; поиск `slug = {brand}-{size}`.
- **404** (не найдено) → фронт отдаёт `notFound()`. Кэширование — на бэке, как у листингов.
- `city` — query, как у листингов (наличие/сроки зависят от города).
- Альтернатива (по `id`/`ean`) отвергнута: URL дожны быть читаемыми и стабильными,
  симметрично остальному каталогу.

## 4. Контракт ответа

За основу — элемент листинга (та же структура `data` + `meta.seo`), дополненный
товарными полями. Ниже — товар шины; диски аналогично со своими атрибутами
(`width`, `diameter`, `pcd`, `et`, `hub_diameter`, `type`, `color` — уже есть в листинге).

```jsonc
{
  "data": {
    // === всё из элемента листинга (см. TireListItemDto) ===
    "id", "ean", "name", "slug",
    "brand": { "id", "name", "slug" },
    "model": { "id", "name", "slug" } | null,
    "origin": { "vendor", "manufacture_country", "manufacture_year",
                "delivery_days_after_order", "pick_up": { "pick_up_point" } }, // badge+description
    "season": { "label", "value" }, "is_studded",
    "price", "old_price", "promotion", "count_in_stock",
    "delivery": { "delivery_min", "delivery_max", "delivery_days_after_order" },
    "euro_label": { "rolling_resistance", "wet_grip", "noiseEmission" },
    "images": [ { "id", "url" } ],   // полная галерея позиции
    // === НОВОЕ, чего в листинге нет ===
    "load_index": "84",             // индекс нагрузки (колонка load_index)
    "speed_index": "H",             // индекс скорости (колонка speed_index — имя как в БД)
    "is_runflat": true,             // атрибут есть на бэке (решено 22.10.2026)
    "description": "…"              // plain text из XLSX (описание модели, ADR 0007); у диска без модели — null
  },
  "meta": { "seo": { "title", "description" } | null }   // как в листинге
}
```

Решено 22.10.2026 (сверка с бэком): «Код товара» = `ean` (колонки `code` нет, ean уже
в контракте — бэк не меняется); «Страна бренда» — строки в данных нет, поле не
добавляется, фронт скрывает строку; описание модели — plain text (XLSX, без тегов),
поэтому поле `description`, не `description_html` (фронт рендерит как текст).

Формат `origin` (badge + description) сохранить как в листинге — попапы бейджей
на товарной странице рендерятся тем же `ParamBadge`, тексты описаний идут с бэка.

## 5. Сводка: поле товарной страницы → источник

| Поле `ProductDetailData` | Источник | Статус |
|---|---|---|
| images[] | `data.images[]` товара | есть в листинге, нужен полный массив |
| параметры (producer/страна/год/ПВЗ) | `origin.*` | есть |
| loadSpeedLabel («84H») | `load_index` + `speed_index` | **есть на товаре, добавить в контракт** |
| seasonLabel | `season.label` | есть |
| spikesLabel | `is_studded` | есть (bool; «Да/Нет» — бэк или фронт, §6.5) |
| runFlatLabel | `is_runflat` | **есть на бэке, добавить в контракт** (§6.3) |
| productionCountryLabel | `origin.manufacture_country.badge` | есть |
| «Код товара» | `ean` | есть (решено 22.10.2026: колонки `code` нет — показываем ean, §6.4) |
| «Страна бренда» | — | **скрыть** (решено 22.10.2026: страны бренда в данных нет, §6.6) |
| euLabel (C/B, dB) | `euro_label` | есть |
| цена/старая цена | `price`/`old_price` | есть |
| наличие | `count_in_stock` + `origin.pick_up` | есть |
| сроки доставки | `delivery.*` | есть |
| pickupDate («8 авг (сб)») | из `delivery_days_after_order` | вычисление даты — фронт (§6.7) |
| quantityOptions | из `price` | сборка на фронте (§6.7) |
| descriptionHtml | `description` | **есть на модели, добавить в контракт** (plain text, не HTML) |
| storeAddress, storeHours | настройки витрины | **нет — эндпоинт настроек** (§6.1) |
| availabilityText, deliveryText, warrantyText | настройки витрины | **нет — эндпоинт настроек** (§6.1) |
| deliveryLabel («бесплатно») | настройки витрины | **нет — эндпоинт настроек** (§6.1) |
| reviewCount, Отзывы | — | **отзывов на бэке нет** (§6.2) |

## 6. Вопросы для решения (пометки к реализации)

### 6.1. Настройки витрины — ПРИНЯТО 22.10.2026

Адрес/часы магазина и тексты «Наличие/Доставка/Гарантия» — контент, правимый без
деплоя. Решение: эндпоинт настроек включается в это же ТЗ — `GET /api/reference/store`
(или `/api/settings/store`, имя на усмотрение бэка) с key-value: `store_address`,
`store_hours`, `delivery_label`, `availability_text`, `delivery_text`, `warranty_text`.
Значения — в таблице `settings`, правит админка.
Заплатка до появления эндпоинта: текущая статика `PRODUCT_STATIC` остаётся на фронте
(помечена как долг).

### 6.2. Отзывы (рекомендуется: скрыть на MVP)

Бэк не хранит отзывы. Вариант MVP — вкладка «Отзывы» на фронте скрывается
(и счётчик в H1-блоке), не выдумывая данные. Позже — отдельное ТЗ (список отзывов
по товару + rating).

### 6.3. RunFlat — ПРИНЯТО 22.10.2026

Атрибут в БД есть: `tire_products.is_runflat` (bool). Добавляем в контракт
`is_runflat` — имя как у уже выводимого `is_studded`.

### 6.4. Код товара — ПРИНЯТО 22.10.2026

Колонки `code` нет, есть только `ean` (уже в контракте листинга). «Код товара» = `ean`;
бэк не меняется, строку на фронте не скрываем.

### 6.5. «Шипы: Да/Нет»

`is_studded` — bool. По контракту готовые строки отдаёт бэк; для одной пары
Да/Нет допускаем фронт. По умолчанию: фронт рендерит «Да/Нет», бэк поле не меняет.

### 6.6. «Страна бренда» — ПРИНЯТО 22.10.2026

Страны бренда в данных нет (`Brand`: name/slug/logo/description/type — известный долг:
brand/country → slug). Строка на товарной странице скрывается, поле `brand_country`
в контракт не добавляется.

### 6.7. Что собирает фронт (не контент, а вычисление)

- `quantityOptions` («29 999 ₽ - 2 шт.») — композиция из `price`, форматирование
  уже на фронте (как в корзине).
- `pickupDate` — готовая строка `origin.delivery_days_after_order.badge`
  («24 Окт (Сб)»); на фронте дата не вычисляется (правка при реализации 22.10.2026).

### 6.8. Инфраструктура карточки (решено по итогам сверки с бэком 22.10.2026)

- **delivery / count_in_stock / origin.pick_up** в листинге ставит
  `ListingDeliveryEnricher` вне кеша (ADR 0030/0031) — карточка переиспользует его
  поверх своего кеша (живой срок не должен устаревать в кеше).
- Кеш до Action + инвалидация — по триггерам ADR 0003/0029 (снимок цен обновляют
  импорт и ручная кнопка).
- Эндпоинт настроек — `GET /reference/store` (существующая группа `/reference/*`);
  6 новых ключей `SettingKeyEnum` + значения в `BookingSettingsSeeder`-подобном
  сидере. Выкладка сидер не запускает — новые ключи заводятся вручную
  (`documentations/operations.md`).
- SEO карточки — по образцу `GetTireModelSeo`: title через `SeoTitleBuilder`
  (+ размер позиции), description из описания модели.
- У диска без модели `description = null` — вкладку «Описание» скрывает фронт.

## 7. SEO

`meta.seo` — как у листингов (`title`, `description`). Пустой `description` →
SEO-блок скрыт (поведение уже реализовано в каталоге).

## 8. Фронт после бэка (кратко)

1. `shared/api/product.ts` — живой `getProduct` c адаптером DTO → `ProductDetailData`;
   404 → `null` → `notFound()`.
2. Шины: `/tires/[brandSlug]/[modelSlug]/[sizeSlug]` — live, H1/meta из ответа.
3. Диски: маршрут `/wheels/[brandSlug]/[sizeSlug]` (макета нет — вёрстка
   шинной карточки, параметры дисков); карточки листинга дисков получают ссылки.
   Два сегмента — 1:1 с API: `{sizeSlug}` = слаг позиции без префикса бренда.
4. Удаление моков: `ALL_PRODUCTS`, product-часть `data/products.ts`, словари
   `SEASON_LABELS`/`TIRE_TYPE_LABELS`/`COUNTRY_LABELS` (при отсутствии потребителей);
   `data/catalog.ts` — целиком, если опустеет.
5. Стартовая `/catalog` на живых брендах из фасетов (задача 2 плана, бэк не нужен).
