# Бейджи: общий объект фронта, страница выводит плашки по данным

> Source: documentations/adr/0008-badges-object-front.md + documentations/tz/badges-zones-backend.md + .claude/plans/product-badges.md (проект aalyans.ru); контракт проверен живыми запросами 2026-10-23
> Collected: 2026-10-23
> Published: 2026-10-23

## Цель

Бейджи (цветные ярлыки с текстом, иконкой и ссылкой) должны приходить с бэка и выводиться
на любой странице. Решение «показывать или нет» принимает бэк: пришёл в `data` объект
`badges` — страница выводит плашки. Полоса преимуществ в шапке была наполнена моком
(`attention_blocks`) — теперь она приходит с данными страницы.

## Контракт бэка (проверено live 23.10.2026, `localhost:8081`)

```
GET /api/catalog/tires/{brand}/{model}/{size}?city=…  → data.badges: BadgeDto[]
GET /api/catalog/wheels/{brand}/{size}?city=…         → data.badges: BadgeDto[]

BadgeDto = {
  text: string,          // готовый текст плашки («Хит продаж»)
  color: 'red'|'gold'|'green',   // пресет BadgeColor, ключ под класс шаблона
  icon_key: string|null, // ключ иконки из набора фронта (в админке — free text)
  link: string|null,     // ссылка плашки (может быть внешней)
  owner_type: string,    // морф-алиас источника: product | model | brand
  owner_name: string|null,       // имя источника
}
```

- Стек собирает бэк (`BadgeStackReader`): цепочка «товар → модель → бренд», дедуп по
  баджу (частный уровень выигрывает), порядок — уровень наследования, затем `sort` привязки.
- Бэк отдаёт `badges` **только в карточке товара**. В листинге, подборе по автомобилю и
  карточке модели поля нет — ADR бэка: «Пересмотрим при появлении зон показа вне карточки
  товара (листинг, статьи)».
- Live-состояние дев-базы: 3 тестовых баджа («Текст 1» red, «Текст 2» gold со ссылкой,
  «Текст 3» green с мусорным `icon_key`), привязки — модель BEL-307 и бренд Kama.

## Решение фронта (ADR 0008)

- Ядро: `src/shared/types/badge.ts` (форма элемента), `src/shared/ui/badgeView.ts`
  (чистая функция представления: класс, иконка, ссылка), `src/shared/ui/Badge.tsx`
  (плашка и полоса; без знания о товаре и каталоге).
- Правило: пришёл в `data` объект `badges` — страница выводит плашки. Страница сама решает,
  где в разметке они стоят (карточка товара и главная — полосой `.benefits` перед
  крошками/контентом, как в макете).
- Разметка плашки — из шаблона: полоса `.benefits`, плашка `benefit benefit--{color}` +
  иконка + текст. Пресеты `BadgeColor` бэка (`red|gold|green`) совпадают с классами
  шаблона один в один (`#dd062a|#ffc10a|#178e42`); словарей отображения на фронте нет.
- Иконка: `icon_key` выбирает иконку из набора шаблона (`red|gold|green`), неизвестный или
  пустой ключ — иконка по цвету-пресету. Иконка рисуется всегда (как в шаблоне).
- Ссылка — как прислал бэк: внутренняя (`/…`) — обычный `<a>`, внешняя (`http…`) —
  `target="_blank" rel="noopener noreferrer"`; без ссылки — `<span>`. Город в `?city=` к
  ссылке бейджа не дописывается. `owner_type`/`owner_name` не выводятся.
- Пустой стек — ничего не рисуется.
- Полоса-преимущества в шапке убрана (был мок `attention_blocks` с цветом-hex и иконкой по
  индексу): бейджи приходят с данными страницы. Мок главной переведён на общий контракт
  `badges`; компонент `shared/layout/Benefits.tsx` удалён как мёртвый код.
- Логика вынесена в чистую функцию: в проекте нет RTL (`vitest`, `environment: "node"`),
  компонент без DOM не проверить.

## Подключение

- `toProductDetail` (`src/shared/api/product.ts`) прокидывает `dto.badges ?? []` в
  `ProductDetailData.badges`; в DTO поле опциональное — устойчивость к откату бэка.
- Страницы: карточка шины (`src/app/tires/[brandSlug]/[modelSlug]/[sizeSlug]/page.tsx`),
  карточка диска (`src/app/wheels/[brandSlug]/[sizeSlug]/page.tsx`), главная
  (`src/app/page.tsx`) — рендерят `<Badges badges={…} />`; полоса в `src/app/layout.tsx`
  убрана.
- Новых CSS-правил нет: `.benefits`/`.benefit--*` из шаблона.

## ТЗ бэку (`documentations/tz/badges-zones-backend.md`)

1. Добавить `badges` в ответы витрин тем же форматом элемента: `TireListItemResource`,
   `WheelListItemResource` (переиспользуется в подборе по автомобилю), `TireModelCardResource`
   (цепочка «модель → бренд»), ответ главной, статья.
2. Промо-полоса («20% на услуги шиномонтажа», «Сборка комплекта бесплатно», «Хранение до
   монтажа бесплатно») больше не отдельный блок: нужен владелец уровня «сайт/магазин» в
   пивоте баджей и стек в ответе. Без него полосы не будет ни на главной, ни в каталоге,
   ни в корзине — а раньше она была на всех страницах.
3. Главная: `attention_blocks` → `badges` (цвет-пресет вместо hex, `text` вместо `title`,
   `icon_key`, `link`).
4. `BadgeCacheInvalidator` сейчас гасит только кеши карточек товаров — при появлении
   баджей в листинге нужно гасить ещё `TireListCacheService`, `WheelListCacheService`,
   `TireModelCardCacheService`, иначе правка баджа видна на карточке, но не в листинге.
5. `icon_key` в админке — свободный текст; просим заменить на `Select` из трёх значений
   (`red|gold|green`).

## Проверка

- Красный прогон: `tests/unit/badgeView.test.ts` — «Cannot find package
  '@/shared/ui/badgeView'»; `tests/unit/homeBadges.test.ts` — «Target cannot be null or
  undefined» (в моке главной не было `badges`).
- Зелёный: 7 тестов `badgeView` + 1 тест мока главной + 2 теста адаптера
  (`test_badges_pass_through_to_product_detail`, `test_missing_badges_field_yields_empty_stack`);
  всего 136 тестов фронта, tsc чисто, lint без ошибок.
- Живая проверка: `GET /api/catalog/tires/kama/365-lt-nk-243/kama-365-lt-nk-243-185-80-r14C?city=chelyabinsk`
  → `badges: [{text: "Текст 1", color: "red", icon_key: null, link: null, owner_type: "brand", owner_name: "Kama"}]`;
  главная → `<div class="benefits"><a class="benefit benefit--red" href="/service-page/servis">…`;
  карточка → `<div class="benefits"><span class="benefit benefit--red">…`;
  `/catalog/tires` → полосы нет.
