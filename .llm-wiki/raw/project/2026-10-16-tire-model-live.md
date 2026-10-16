# Страница модели шин на живом API

> Source: План .claude/plans/tire-model-live.md и прогоны (фронт aalyans.ru); контракт public-api.json 16.10.2026
> Collected: 2026-10-16
> Published: 2026-10-16

Бэк реализовал данные модели шины; страница переведена с мока на живой API, маршруты —
на схему бэка (бренд + короткий слаг модели).

## Контракт бэка

- `GET /api/catalog/tire-models/{brand}/{model}` — `{brand}` слаг бренда («yokohama»),
  `{model}` КОРОТКИЙ слаг («bluearth-ae61»; в листинге `model.slug` — полный,
  «yokohama-bluearth-ae61»). Ответ: `{data: {slug, name, brand {id, name, slug},
  image_url|null, params [{name, value}] (пока 3: Сезон/Шипы/Страна),
  description (HTML|null, пока null), diameters [{value: "17", count}]},
  meta: {seo {title, description|null}}}`; нет модели → 404.
- Размеры модели — листинг с фильтрами `model=<короткий>&brand=<слаг>` (+
  `diameter[]=<число>` + `city`); count из `diameters` сходится с `meta.total`.

## Фронт

- Маршруты: `/tires/[brandSlug]/[modelSlug]` (модель) и
  `/tires/[brandSlug]/[modelSlug]/[sizeSlug]` (товар — пока мок); старые
  `/tires/[modelSlug]…` удалены. Ссылки карточек и крошки — по новой схеме.
- `ProductBase` + `brandSlug`; `modelSlug` теперь КОРОТКИЙ (у полного слага листинга
  срезается префикс бренда, `toShortModelSlug`; нет префикса — не гадаем). Применено
  и к дискам (поле общее; ссылок у карточек дисков нет).
- Адаптеры: `toTireModel` (диаметры «17» → r-ключи вкладок), `getTireModel(brand,
  model, city)` (404 → null → notFound), `toModelSizesQuery`, `getTireModelSizes`
  (листинг per_page=100). Тип `TireModelData` переехал из мока; мок `getTireModel`
  удалён, слаги моделей мока укорочены, фабрики получили `brandSlug`.
- `ModelSizes` — пропсы под живые данные (диаметры+count, размеры активной вкладки;
  `key` у родителя сбрасывает «Показать ещё»); `ModelDescription` — разметка обёртки
  `.model-description-image` (правило макета даёт 300px) и HTML-описание (null — скрыто).

## Прогоны

Красный 3 failed | 90 passed → зелёный 93 passed (15 файлов), tsc/eslint чисто. Живой
прогон: `/tires/yokohama/bluearth-ae61` — h2, 3 параметра, описание скрыто, вкладки
R16/R17/R18 (R16 — 2 размера = count), карточка с ценами/плашками, title из seo; смена
вкладки → `?diameter=r17` ✓. Мок-товар `/tires/viatti/strada-2/…` — 200; его крошка на
живую модель → 404 (переходное: мок-слаги бэку неизвестны). После переезда маршрутов
dev-контейнер пришлось перезапустить (turbopack не подхватил папки).

## Вне области

Содержимое страницы товара (мок), авто-подбор; описание модели и остальные параметры
макета — пожелания бэку (пусто/3 из 8 — рендерим как есть).
