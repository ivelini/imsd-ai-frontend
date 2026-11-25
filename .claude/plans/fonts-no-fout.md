# Шрифты без мигания: block + предзагрузка вместо swap

- **Статус:** согласован
- **Дата:** 2026-11-25
- **Согласовано:** 2026-11-25
- **Источники:** `src/app/style.css` (строки 1–33 — `@font-face`), `src/app/layout.tsx`,
  `next.config.ts`, dev-HTML :30034 (head без preload), `documentations/operations.md` (nginx
  отдаёт существующие файлы каталога сайта), `node_modules/next/dist/docs` — `generate-metadata`
  (ReactDOM.preload), `font.md` (next/font).

## 1. Решения, согласованные в обсуждении

| Вопрос | Ответ | Следствие в плане |
|---|---|---|
| Что видит пользователь, пока шрифт не загрузился | **Скрыть текст до шрифта** (пользователь, 25.11) | `font-display: block` + предзагрузка 4 woff2; системный шрифт не показывается, текст невидим до загрузки (на медленной сети до 3 с) |
| Механизм предзагрузки | Дефолт, не подтверждён: `ReactDOM.preload` из клиентского острова в root layout — документированный способ Next 16 | Новый `FontPreload.tsx`; ссылки `<link rel="preload" as="font">` в `<head>` на всех роутах |
| Что если шрифт не пришёл за ~3 с | Дефолт, не подтверждён: показываем системный sans-serif, а не браузерный serif | В `font-family` добавляется безопасный стек (`"Segoe UI", Arial, sans-serif`) — и в макете, парно |
| Кэш шрифтов на проде | Дефолт, не подтверждён: **не трогаем** — `/assets/*` отдаёт nginx панели напрямую, `next.config headers` туда не доедет | После block+preload мигания нет и при `max-age=0`; кэш — отдельная ops-задача |
| next/font | Дефолт, не подтверждён: **не переходим** — правило `ui-porting.md` п. 7 (`@font-face` в style.css), плюс next/font/local не выражает unicode-range-сабсеты двух файлов одной семьи | Остаёмся на `@font-face`, меняем только загрузку |

## 2. Цель и ожидаемый результат

Убрать кадр с системным шрифтом при F5 и первом заходе: браузер не рисует текст до готовности
фирменного шрифта, а файлы шрифтов начинают качаться одновременно с CSS, а не после него.

Результат: в `<head>` каждой страницы — 4 `<link rel="preload" as="font" type="font/woff2"
crossorigin>`; в CSS — `font-display: block` у всех четырёх `@font-face`; при медленной сети
после блока виден системный sans-serif, а не браузерный serif; макет `.template` обновлён парно.

## 3. Архитектурная сверка

| Слой | Что меняем |
|---|---|
| Роутинг/композиция | `src/app/layout.tsx` — рендер клиентского острова `<FontPreload />` (сам layout остаётся серверным) |
| Ядро `shared/` | Новый `shared/layout/client-islands/FontPreload.tsx` (`"use client"`, `ReactDOM.preload` ×4, возвращает `null`); новый `shared/lib/fonts.ts` — единственный список URL шрифтов |
| Стили | `src/app/style.css`: 4× `font-display: swap` → `block`; в `*` и трёх `font-family: Noto Sans` — безопасный fallback-стек |
| Макет | `.template/assets/css/style.css`: те же 4 значения и стеки — эталон не расходится с приложением |
| Server/client | `FontPreload` — клиентский остров, потому что `ReactDOM.preload` — клиентский API React 19; рендерится в root layout, ссылки хойстятся в `<head>` |
| Данные/состояние | Не затрагиваются |
| API | Не затрагивается |
| Тестируемость | Чистые данные `FONT_PRELOAD_URLS` + тест-страж: список совпадает с `src: url()` в CSS и все файлы существуют |
| Переиспользование | Ничего нового общего не вводится; ни одного нового паттерна |
| Расхождение с правилами | `next/font` не используем (п. 7 `ui-porting.md`); fallback-стек — небольшое отступление от макета, макет правится парно |

## 4. Задачи

### Шаг 1. CSS: block и fallback-стек

**Файлы:** `src/app/style.css`, `.template/assets/css/style.css`.

| Шаг | Файл::место | Вход → Выход |
|---|---|---|
| Дисциплина шрифта | `src/app/style.css:5,13,21,29` | `font-display: swap` → `block` (4 правила) |
| Fallback | `src/app/style.css:59` | `font-family: Nunito` → `Nunito, "Segoe UI", Arial, sans-serif` |
| Fallback Noto | `src/app/style.css:2474,2484,2519` | `font-family: Noto Sans` → `Noto Sans, Arial, sans-serif` |
| Макет | `.template/assets/css/style.css:5,13,21,29` и те же `font-family` | те же правки |

Правила `"Nunito", sans-serif` (строки 809, 869, 950, 2608) уже имеют generic — их не трогаем.

### Шаг 2. Предзагрузка шрифтов

**Файлы (новые):** `src/shared/lib/fonts.ts`, `src/shared/layout/client-islands/FontPreload.tsx`;
**правка:** `src/app/layout.tsx`.

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| Список шрифтов | `shared/lib/fonts.ts::FONT_PRELOAD_URLS` | `—` → `readonly string[]` из 4 путей `/assets/fonts/*.woff2` |
| Остров предзагрузки | `shared/layout/client-islands/FontPreload.tsx::FontPreload` | `—` → `null`; на рендере зовёт `ReactDOM.preload(url, {as:"font", type:"font/woff2", crossOrigin:"anonymous"})` для каждого URL |
| Подключение | `src/app/layout.tsx` | `<FontPreload />` внутри `<body>` до `ClientLayout` — на всех роутах |

`crossOrigin: "anonymous"` обязателен: шрифты запрашиваются в CORS-режиме, иначе браузер
скачает файл дважды (preload и `@font-face` не совпадут). URL в preload и в CSS — один и тот же
список (страж-тест).

**Проверка механизма до правок вёрстки:** после шага 2 сразу посмотреть head dev-страницы. Если
`ReactDOM.preload` не даёт `<link rel="preload">` в `<head>` — STOP и вопрос, а не обход:
альтернатива — серверный `<link>` в обвязке (если React 19 его хойстит) либо `Link`-заголовок
в `next.config` (на проде не сработает: `/assets/*` отдаёт nginx).

### Шаг 3. Проверка

- `npm test`, `npx tsc --noEmit`, `npm run lint`.
- Dev: в HTML `http://localhost:30034/` — 4 `<link rel="preload" as="font" ...>`, у всех
  `type="font/woff2"` и `crossorigin`; CSS содержит `font-display: block`.
- DevTools, «Disable cache» + F5: ни одного кадра с системным шрифтом; в Network шрифты
  стартуют одновременно с CSS. Slow 3G — текст появляется сразу фирменным (block), не fallback.
- Прод-сборка: `make stop` → `BACKEND_URL=http://localhost:8081 npm run build` →
  `PORT=30035 BACKEND_URL=http://localhost:8081 npm start` → те же проверки head/CSS → остановить
  → `make up`.
- Визуальная проверка пользователем: 390 / 768 / 1024 / 1366 / 1920; вердикт — в §8.

## 5. Новые сущности, переиспользование, «не делаем»

**Новые (путь → зачем):**

- `src/shared/lib/fonts.ts` — единый список URL шрифтов для preload и стража-теста (CSS и TS не
  могут импортировать друг друга; список обязан совпадать — тест).
- `src/shared/layout/client-islands/FontPreload.tsx` — клиентский остров с `ReactDOM.preload`;
  отдельный файл, потому что root layout серверный.

**Переиспользуем:** `"use client"`-острова (`src/shared/layout/client-islands/*`), root layout,
существующие woff2 и `@font-face` — новые шрифты/зависимости не появляются.

**Не делаем (явно):**

- `next/font/local` — миграция шрифтов в `src/`, смена имён семейств во всём CSS, невозможность
  двух unicode-range-сабсетов одной семьи; отдельный рефакторинг с ADR, не эта задача;
- инлайн шрифтов base64 в CSS (+~155 КБ к блокирующему CSS, хуже LCP);
- полноэкранный лоадер до `document.fonts.ready` — JS-гейт, задержка показа, риск «белого экрана»;
- кэш шрифтов на проде (nginx панели) — отдельная ops-задача, на мигание после block+preload
  не влияет;
- правку других CSS-правил, кроме перечисленных.

## 6. Сначала минимальный вариант

**Простейший рабочий:** две строки смысла — `font-display: block` в четырёх `@font-face` и
четыре `ReactDOM.preload` из острова. Ни новых зависимостей, ни новых шрифтов, ни JS-гейтов.

**Отклонённый тяжёлый вариант и цена:** `next/font/local` — авто-preload и метрики fallback,
но переезд файлов, смена `font-family` по всему CSS (11 мест), невозможность двух сабсетов на
семью без склейки файлов, расхождение с правилом 7 и ADR; выигрыш для нашей цели (нет кадра
fallback) нулевой — block+preload даёт то же. Инлайн base64 — гарантия, но утяжеляет
блокирующий CSS на ~155 КБ. Лоадер — гарантия, но JS и задержка.

## 7. STOP-условия и бюджет диффа

- **STOP:** новая зависимость; переход на `next/font`; правка nginx/кэша; полноэкранный лоадер;
  правка CSS вне перечисленных строк; дифф больше 6 файлов.
- **Бюджет:** шаг 1 — 2 файла, шаг 2 — 3 файла (+1 тест в шаге 3), шаг 3 — проверки без кода.
- Коммиты — по указанию пользователя.

## 8. Тест-лист

### `tests/unit/fontPreload.test.ts`

**Тест 1**
1. **Поведение:** список предзагрузки совпадает с URL в `@font-face` — иначе браузер скачает шрифт дважды (preload не совпал с CSS).
2. **Вход:** `FONT_PRELOAD_URLS` и все `src: url("...")` из `src/app/style.css`.
3. **Ожидание:** множества URL равны; в списке ровно 4 уникальных пути.
4. **Имя:** `test_preload_matches_font_face_urls`.

**Тест 2**
1. **Поведение:** каждый URL предзагрузки существует в `public/` — иначе 404 preload и скрытый текст до таймаута.
2. **Вход:** `FONT_PRELOAD_URLS` → `public` + путь.
3. **Ожидание:** все файлы существуют (`fs.existsSync`).
4. **Имя:** `test_preload_files_exist`.

**Тест 3**
1. **Поведение:** ни один `@font-face` не остался на `swap`, все четыре — на `block` (иначе кадр fallback возвращается).
2. **Вход:** текст `src/app/style.css`.
3. **Ожидание:** `font-display: swap` — 0 вхождений, `font-display: block` — 4.
4. **Имя:** `test_font_display_block_only`.

### Визуальная/сетевая проверка (в §4 шаге 3)

- head содержит 4 preload-ссылки с `as="font"`, `type="font/woff2"`, `crossorigin`;
- F5 с очисткой кэша и Slow 3G: ни одного кадра с системным шрифтом;
- пять ширин — без переполнений;
- вердикт пользователя записывается в план.

## 9. Схема вызовов

```
F5 / первый заход
      │
      ▼
┌─ src/app/layout.tsx (server) ─────────────────────────────────────┐
│  <html><body>                                                     │
│    <FontPreload />  ← client island                               │
│    <ClientLayout> … страницы …                                    │
└───────────────┬───────────────────────────────────────────────────┘
                │ рендер (SSR/prerender)
                ▼
┌─ FontPreload.tsx («use client») ─────────────────────────────────┐
│  ReactDOM.preload("/assets/fonts/*.woff2", {as:"font",            │
│      type:"font/woff2", crossOrigin:"anonymous"}) × 4             │
└───────────────┬───────────────────────────────────────────────────┘
                │ React hoist
                ▼
┌─ <head> HTML ─────────────────────────────────────────────────────┐
│  <link rel="stylesheet" href="/_next/....css">   (блокирующий)    │
│  <link rel="preload" as="font" type="font/woff2"                  │
│        href="/assets/fonts/Nunito-cyrillic.woff2" crossorigin>    │
│  … ещё 3                                                          │
└───────────────┬───────────────────────────────────────────────────┘
                │ параллельно: CSS и 4 woff2
                ▼
┌─ src/app/style.css ───────────────────────────────────────────────┐
│  @font-face { font-family: Nunito; font-display: block; … }       │
│  * { font-family: Nunito, "Segoe UI", Arial, sans-serif }         │
└───────────────┬───────────────────────────────────────────────────┘
                ▼
┌─ Первый рендер текста ────────────────────────────────────────────┐
│  шрифт готов → текст рисуется фирменным (fallback не показывался) │
│  > 3 с → безопасный sans-serif из fallback-стека                  │
└───────────────────────────────────────────────────────────────────┘
```

## 10. Прогоны

- **Красный** (25.11.2026): `Test Files 1 failed | 47 passed (48)`, `Tests 222 passed` — новый
  `tests/unit/fontPreload.test.ts` не нашёл `@/shared/lib/fonts`.
- **Зелёный** (после реализации): `Test Files 48 passed (48)`, `Tests 225 passed (225)`;
  `npx tsc --noEmit` — 0 ошибок; `npm run lint` — 0 ошибок (1 прежнее предупреждение
  `src/features/catalog/components/ModelDescription.tsx`).
- **Dev :30034:** в `<head>` 4 `<link rel="preload" as="font" type="font/woff2" crossorigin="">`;
  отданный CSS — 4 `font-display: block`, `swap` нет; fallback-стеки в `*` и `Noto Sans` на месте.
- **Прод-сборка** `BACKEND_URL=http://localhost:8081 npm run build` — exit 0; в статических HTML
  (`/booking`, `/cart`, `/checkout` и др.) те же 4 preload-ссылки; собранный CSS — 4 `block`.
- Квитанция: `verify: 319bc21c1952ecc0833245144d78df98ebe97be73a0eedbf33c1744bed68d50a — green`
  (sha256 `git diff HEAD`; новые неотслеживаемые файлы в хеш не входят).

## 11. Визуальная проверка

Реализация выполнена 25.11.2026; проверка пользователя ожидается: dev :30034, F5 с «Disable
cache» и Slow 3G — ни одного кадра с системным шрифтом; 390 / 768 / 1024 / 1366 / 1920 —
вёрстка не поехала. Дата, что смотрел пользователь, вердикт — сюда.

## 12. Открытые вопросы

Нет.
