# Карточка товара шин и дисков на живом API

> Source: documentations/tz/product-card-backend.md + .claude/plans/catalog-product-start-live.md (проект aalyans.ru); контракт проверен живыми запросами 2026-10-22
> Collected: 2026-10-22
> Published: 2026-10-22

## Цель

Страница товара (типоразмер шины; позиция диска) на живых данных: H1, галерея,
параметры, цена города, наличие/сроки, вкладки. После перевода удаляются моки товара,
ссылки карточек листингов включаются.

## Эндпоинты

```
GET /api/catalog/tires/{brand}/{model}/{size}?city=…   → { data, meta.seo }
GET /api/catalog/wheels/{brand}/{size}?city=…          → { data, meta.seo }
GET /api/reference/store                               → { data: {…} }
```

- Шины: `{size}` — полный слаг позиции (`yokohama-bluearth-e70b-215-55-r17-94v`);
  `{brand}`/`{model}` сверяются со слагами товара, несовпадение → 404.
- Диски: модели в слаге нет; `{size}` — слаг без префикса бренда
  (`disk-ls-367-…`), поиск `slug = {brand}-{size}`, `{brand}` сверяется.
- 404 → `{"message":"Товар не найден"}` (DomainException, код 404).
- Шина: `load_index`, `speed_index`, `is_runflat`, `description` (plain text модели,
  может быть null), полная галерея `images[]`, `delivery{min,max,days}`,
  `count_in_stock`.
- Диск: `width`/`et`/`hub_diameter` — строками («7.0»), `type {label, value}`,
  `color`, `description` модели (может быть null).
- `origin.delivery_days_after_order.badge` — готовая дата выдачи («24 Окт (Сб)»);
  `origin.vendor/manufacture_country/manufacture_year` — `{badge, description(HTML)}`.
- `GET /api/reference/store` → `shop_address`, `store_hours`, `delivery_label`,
  `availability_text`, `delivery_text`, `warranty_text` (таблица `settings`).
- `Setting::values` бросает 500 на пропущенной строке — локально ключи засеяны
  `BookingSettingsSeeder`.

## Решения плана

1. URL дисков — два сегмента `/wheels/{brandSlug}/{sizeSlug}`: 1:1 с API и слагом
   позиции; модельного сегмента у диска нет. Три сегмента были бы декоративными и
   давали бы дубли URL.
2. Шины без модели (контракт допускает, в данных таких нет): модельный сегмент `-`,
   бэк при `model = null` его не сверяет.
3. `pickupDate` — `origin.delivery_days_after_order.badge` (готовая строка бэка), без
   вычисления даты на фронте (отклонение от ТЗ §6.7 в пользу `api-contract.md`).
4. `quantityOptions` — композиция на фронте из `price` (1–4 шт.).
5. «Шипы»/«Run flat» — `Да`/`Нет` на фронте; «Код товара» = `ean`; «Страна бренда»
   не выводится.
6. Тексты вкладок и адрес/часы — из `/reference/store`. Сбой эндпоинта не валит
   карточку: пустые значения → вкладки и блок адреса скрыты.
7. Отзывы: вкладка и секция скрыты (контента на бэке нет).
8. Описание — plain text; вкладка и секция скрыты при `description = null`.
9. `ProductDetailData` больше не наследует `TireProduct` — самостоятельный тип
   отображения, общий для шин и дисков.
10. Ссылки карточек включаются везде, где данные живые: листинг дисков, размеры
    модели, автоподбор.

## Маршрут и слой фронта

- Шины: `/tires/[brandSlug]/[modelSlug]/[sizeSlug]` (существующий).
- Диски: `/wheels/[brandSlug]/[sizeSlug]` (новый).
- `shared/api/product.ts`: `getProduct(route, city)` → `{product, seo} | null`;
  `getStoreSettings()`; `toProductDetail(dto, store)`; 404 → null; store — soft-fail.
- `shared/api/origin.ts`: `toOriginParam` вынесен из `catalog.ts` (второй потребитель).
- `features/catalog/lib/productUrl.ts`: `productUrl(product, city)` — шины три сегмента,
  диски два (срез префикса бренда), `?city=`.
- `features/product/lib/productTabs.ts`: вкладки по наличию контента; «Отзывы» нет.
- Удалены: `data/catalog.ts`, `PRODUCT_STATIC` и генераторы текстов, поля
  `TireProduct.loadIndex/speedRating/tireType`, неиспользуемый `CategorySection`.
  `WheelProduct.wheelType` оставлен — его проверяет существующий тест.

## Проверки

- Красный: 3 тест-файла, 5 тестов падают на отсутствующей реализации (productDetailAdapter,
  productUrl, productTabs).
- Зелёный: 21 файл / 117 тестов; `tsc --noEmit` чисто; lint 0 ошибок; build успешно,
  маршрут `ƒ /wheels/[brandSlug]/[sizeSlug]`.
- Живой прогон: шина 200, диск 200, чужие слаги 404; вкладки без «Отзывов»; ссылки
  листинга дисков ведут на `/wheels/...`; `/reference/store` отвечает 200.
