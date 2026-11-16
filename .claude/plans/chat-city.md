# Чат: передача выбранного города сайта

**Согласовано:** 2026-11-13

## 1. Решения, согласованные в обсуждении

| Вопрос | Ответ пользователя (дословно) | Следствие в плане |
|---|---|---|
| Менять ли диалог чата при смене города на сайте | «Не сбрасывать (Recommended)» | Токен не трогаем; каждый POST уходит с текущим городом, бэк обновляет город сессии; история и остаток лимита сохраняются |

Решения по контракту (источники — `backend/documentations/api-maps/public-chat.md` (обновлён),
`public-chat-frontend.md`, `domains/AI/Actions/Chat/StartPublicChatTurn.php`,
`domains/AI/Http/Controllers/PostPublicChatController.php`):

- **Идентификатор города — слаг `city`**, не `city_id`: сайт живёт на слагах URL (ADR 0004;
  `api-contract.md`: `value` совпадает с сегментом). Контракт принимает оба, приоритет у
  `city_id`; неизвестный слаг бэк заменяет городом магазина по умолчанию (не 422).
- **Город отправляется с каждым POST**: `StartPublicChatTurn::rememberCity` обновляет
  `session.city_id`, если он отличается; без города инструменты берут город магазина.
- **Значение** — город, который посетитель видит на сайте: выбранный (`useUIStore.cityValue`,
  синхронизирован с `?city=`) либо дефолт из geo (`useGeo.defaultCityValue`). Логика
  `cityValue ?? defaultCityValue ?? ""` выносится в чистую функцию и используется `useCity`.
- **Пустой город не передаётся** (geo ещё не загружен и выбора нет) — запрос уходит без `city`,
  бэк берёт город по умолчанию; это штатный фолбэк контракта.
- `sendChatMessage` переводится на **один объект аргументов** `{message, token?, city?}`:
  позиционные `(message, token?, city?)` дают неудобный порядок, а `useSendChatMessage`
  уже принимает объект.

## 2. Цель и ожидаемый результат

Цены, наличие и сроки доставки в ответах ассистента считаются по городу, выбранному на сайте,
а не по дефолтному городу магазина. Смена города продолжает текущий диалог: следующий вопрос
уходит с новым городом, история сохраняется.

## 3. Задачи с контрактом шага

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| 1.1 | `src/shared/lib/cityUrl.ts` → `effectiveCitySlug` | `(cityValue: string \| null, defaultSlug: string \| undefined)` → `string` (выбранный → дефолт → `""`) |
| 1.2 | `src/shared/layout/api/useCity.ts` → `useCity` | возврат дополняется `citySlug` (эффективный слаг; `cityLabel` считается по нему же) |
| 2.1 | `src/shared/api/chat.ts` → `ChatSendArgs`, `sendChatMessage` | `({message, token?, city?})` → `Promise<ChatAcceptedDto>`; в теле POST `city` только если непустой |
| 2.2 | `src/features/chat/api/useSendChatMessage.ts` → `useSendChatMessage` | `ChatSendArgs` (тип из `shared/api/chat`) → тот же DTO; `mutationFn: sendChatMessage`, отдельный интерфейс не дублируется |
| 3.1 | `src/features/chat/components/ChatWindow.tsx` → `ChatWindow` | `useCity().citySlug` → `mutate({message, token, city: citySlug})`; диалог не сбрасывается |
| 4.1 | `documentations/integrations/chat.md` | контракт POST с `city`, поведение при смене города |
| 4.2 | `CLAUDE.md` | строка про чат: город отправляется слагом |
| 4.3 | wiki (через `llm-wiki`) | `chat-live-api`: раздел о городе; карта проекта при необходимости |

## 4. Новые сущности

| Путь | Зачем |
|---|---|
| `tests/unit/chatSend.test.ts` | пин контракта POST: `city` в теле, токен в заголовке, пустой город не уходит |
| `effectiveCitySlug` в `shared/lib/cityUrl.ts` | единственный источник правила «город, который видит посетитель» (useCity + тест) |

Переиспользуем: `useCity` (чей город показывается на сайте), `useUIStore.cityValue` (ADR 0004),
`useGeo.defaultCityValue`, `ApiError`/`readJson`, `queryKeys.chat`.

Не делаем: `city_id` (слаг достаточен), показ города в окне чата, переключатель города внутри
чата, сброс токена/диалога при смене города, изменения поллинга, `after_id`, правки Header/попапа
города, изменение экрана при `isReady === false` (город просто не передаётся).

Сначала минимальный вариант: слаг города в теле POST с каждым сообщением; отклонён тяжёлый —
отдельный запрос смены города на сессию и хранение города в сторе чата — бэк уже принимает
`city` в POST и обновляет сессию сам.

## 5. STOP-условие и бюджет диффа

STOP: изменение контракта бэка; необходимость `city_id`; сброс токена при смене города;
правки Header/GeoPopup/каталога; новая зависимость; дифф шага больше 4 файлов.

Бюджет: шаг 1 — 2 файла, шаг 2 — 2 файла + 1 тест, шаг 3 — 1 файл, шаг 4 — 2 файла + wiki.

Профиль чтения: POST — одно сообщение, город — строка слага (≤ 255 символов); поллинг не меняется.

## 6. Тест-лист

Файл `tests/unit/chatSend.test.ts`

Тест 1
1. Поведение: город уходит в теле POST слагом — без него бэк считает по дефолтному городу
2. Вход: `sendChatMessage({message: "какие шины", city: "cheljabinsk", token: "9b1f…"})`, fetch-заглушка отвечает 202
3. Ожидание: тело содержит `{message, city: "cheljabinsk"}`, заголовок `X-Session-Token`, URL оканчивается `/chat`
4. Имя: `test_send_payload_includes_city`

Тест 2
1. Поведение: пустой город не попадает в тело — ключа `city` нет (бэк применит город магазина)
2. Вход: `sendChatMessage({message: "какие шины", city: ""})` и вариант без `city`
3. Ожидание: в JSON нет ключа `city`; сообщение на месте
4. Имя: `test_send_payload_omits_empty_city`

Файл `tests/unit/cityUrl.test.ts` (дополняется)

Тест 3
1. Поведение: выбранный город важнее дефолта — чат не должен отвечать по дефолтному городу при выборе
2. Вход: `effectiveCitySlug("ekaterinburg", "cheljabinsk")`
3. Ожидание: `"ekaterinburg"`
4. Имя: `test_effective_city_slug_prefers_chosen`

Тест 4
1. Поведение: без выбора берётся дефолт geo; пока geo не загружена — пустая строка (город не передаётся)
2. Вход: `effectiveCitySlug(null, "cheljabinsk")` и `effectiveCitySlug(null, undefined)`
3. Ожидание: `"cheljabinsk"` и `""`
4. Имя: `test_effective_city_slug_falls_back_to_default`

## 7. Схема вызовов

```
 Посетитель: открыл чат на странице с городом (URL ?city= | стор | дефолт geo)
        │
        ▼
┌─ БРАУЗЕР ────────────────────────────────────────────────────────────┐
│  ChatWindow.tsx                                                      │
│    useCity() → citySlug = effectiveCitySlug(cityValue, geo.default)  │
│        │                                                             │
│        ▼                                                             │
│  useSendChatMessage().mutate({message, token, city: citySlug})       │
│        │                                                             │
│        ▼                                                             │
│  shared/api/chat.ts sendChatMessage({message, token, city})          │
│        │ POST /api/chat  body {message, city?}                       │
└────────┼─────────────────────────────────────────────────────────────┘
         │ /api/* (same-origin rewrites, next.config.ts)
         ▼
┌─ БЭК (Laravel) ──────────────────────────────────────────────────────┐
│  PostPublicChatController: city → CityReader::resolveId (слаг)       │
│  StartPublicChatTurn::rememberCity → session.city_id                 │
│  инструменты считают цены/наличие/сроки по городу сессии             │
└────────┬─────────────────────────────────────────────────────────────┘
         │ 202 → поллинг GET /api/chat/messages (без изменений)
         ▼
   Ответ ассистента по выбранному городу
```

## 8. Открытые вопросы

Нет.

## 9. Прогоны

- **Красный (13.11.2026):** 4 теста падают (`effectiveCitySlug is not a function` ×2;
  `sendChatMessage` с объектом — тело/заголовок не совпадают ×2); 30 файлов / 172 теста зелёные.
- **Зелёный (13.11.2026):** 32 файла / 176 тестов прошли; `npx tsc --noEmit` чисто;
  `npm run lint` — 0 ошибок (4 прежних предупреждения).
- **Живой прогон (dev, 30034, `?city=ekaterinburg`):** POST `/api/chat` ушёл с
  `{"message": "...", "city": "ekaterinburg"}`, вопрос записан и показан в ленте.
