# Публичный чат (ИИ-ассистент): живой API

> Sources: integrations/chat.md, 2026-11-13; ТЗ chat-empty-assistant-backend, 2026-11-13; план chat-live, 2026-11-13; план chat-city, 2026-11-13; план chat-options, 2026-11-16; план chat-option-links, 2026-11-16; архитектурное ревью, 2026-11-16
> Raw: [chat-live-frontend](../../raw/project/2026-11-13-chat-live-frontend.md); [chat-city](../../raw/project/2026-11-13-chat-city.md); [chat-options](../../raw/project/2026-11-16-chat-options.md); [chat-option-links](../../raw/project/2026-11-16-chat-option-links.md); [chat-review-sync](../../raw/project/2026-11-16-chat-review-sync.md)

## Overview

С 13.11.2026 на всех страницах сайта — виджет публичного чата с ИИ-ассистентом: анонимный
диалог без регистрации, вопрос уходит POST-ом (202), ответ приходит GET-поллингом. Виджет —
клиентский остров в корневом layout (`features/chat/`), контракт — `shared/api/chat.ts`.
Токен диалога живёт в localStorage, переживает перезагрузку. Город сайта уходит в POST
слагом; дефект бэка с пустыми репликами `assistant` исправлен 13.11.2026.

## Контракт бэка

| Метод | Путь | Ответ |
|---|---|---|
| POST | `/api/chat` | `{message, city?}` 1–2000 символов → 202 `{session_token, message_id, status: "accepted"}`; без `X-Session-Token` создаёт диалог |
| GET | `/api/chat/messages` | `{data: [{id, role, content, created_at, options?}]}`; `X-Session-Token` обязателен; без `after_id` — последние до 200 реплик |

Токен — uuid, только заголовком (не в URL и не в теле). Роли наружу — `user` и `assistant`,
служебные `system` не отдаются. `created_at` — ISO с таймзоной, бывает `null`. Лимиты:
20 сообщений в сутки на диалог, 200 на канал, 10 POST/мин и 60 GET/мин с IP; диалог хранится
30 дней. Город передаётся слагом `city` в каждом POST; без города бэк отвечает по городу
магазина по умолчанию. Стрима нет (SSE/WebSocket не предусмотрены).

## Клиентский поток

- **Токен** — `session_token` из 202 в localStorage (`chat_session_token`), во всех запросах —
  заголовком. 404 — токен протух: стереть, показать приветствие; следующий POST создаст новый.
- **Отправка** — `useMutation` (`mutationFn: sendChatMessage`): POST `{message, city}`; на успех
  токен сохраняется, кеш реплик инвалидируется.
- **Кликабельные варианты** — `options: [{label, text?, url?}]` у реплики ассистента (бэк строит
  их по `search_vehicle`, `vehicle_tires`, `vehicle_wheels`, `search_tires`). Показываются только
  у последней реплики ленты (`lastOptions` в `features/chat/lib/options.ts`). `text`-вариант:
  клик отправляет текст обычным сообщением, пока отправка идёт — `disabled`, после успеха
  последняя реплика — `user` и кнопки исчезают. `url`-вариант: клик — переход в каталог в той же
  вкладке без перезагрузки (`router.push`); если адрес совпадает с текущим — `router.refresh()`
  (`isCurrentLocation`), POST не вызывается; окно чата остаётся открытым, варианты реплики
  скрываются (`dismissedMessageId`). Средний/ctrl-клик работает нативно. Введённый текст клик
  не трогает.
- **Город** — слаг `city` в теле каждого POST (не `city_id`: сайт живёт на слагах URL,
  ADR 0004). Значение — город, который видит посетитель: выбранный (`useUIStore.cityValue`,
  синхронизирован с `?city=`) или дефолт geo; правило — `effectiveCitySlug` в
  `src/shared/lib/cityUrl.ts`, `useCity().citySlug`. Бэк обновляет город сессии на каждом
  POST (`StartPublicChatTurn::rememberCity`), поэтому смена города продолжает диалог.
  Неизвестный слаг бэк заменяет дефолтным городом; пустой город в тело не попадает.
- **Поллинг** — `useChatMessages` (React Query, `refetchInterval` 1,5 с), пока последняя
  реплика — вопрос пользователя и не истекло 60 с; полный список без `after_id` (контракт
  отдаёт до 200 реплик — накопление не нужно). Ошибка чтения останавливает опрос.
- **Таймаут** — после 60 с «Сервис временно недоступен»; «Повторить» продлевает окно опроса
  ещё на 60 с (GET, без повторного POST — дубля вопроса нет).
- **Пустой диалог** — статичное приветствие ассистента (текст фронта, в историю не пишется),
  исчезает с первой репликой.

## Ошибки → состояние экрана

Разделение по статусу и машинному `code` (`mapChatError`), не по тексту: 400 `ai.off_topic` —
текст бэка плашкой в ленте; 404 — сброс диалога; 422 — общий текст (ключи `validation.*` на
экран не пускаются); 429 — текст бэка, опрос останавливается; 5xx/сеть — «Сервис временно
недоступен» + «Повторить».

## Фронт

- `src/shared/api/chat.ts` — DTO и запросы (`sendChatMessage({message, token?, city?})`,
  `fetchChatMessages(token, signal?)`); `src/shared/api/http.ts` — `fetchJson` (fetch + разбор +
  `ApiError`), `ApiError`, `ApiErrorPayload`, `DEFAULT_API_ERROR_MESSAGE`, `toErrorResponse`;
  `readJson` приватный; booking переведён на `fetchJson` (правило двух, `BookingApiError` удалён).
- `src/features/chat/lib/` — чистые функции: `errors.ts` (статус+`code` → состояние),
  `time.ts` (ISO → «ЧЧ:ММ»), `polling.ts` (`shouldPoll`/`isWaitTimedOut`, граница 60 с),
  `options.ts` (`lastOptions`/`visibleOptions` — варианты только у последней реплики и с учётом
  клика; `isCurrentLocation` — refresh вместо пустого push), `session.ts` (токен в localStorage).
  Тесты — `tests/unit/chat{ErrorMapping,Time,Polling,Options,Send}.test.ts`.
- `src/features/chat/api/` — `useChatMessages(token, onSessionExpired)` (возвращает
  `{messages, error, retry, timedOut}`; 404-сброс — в `queryFn`, `retry: false`, `AbortSignal`
  в fetch), `useSendChatMessage`; ключ кеша `queryKeys.chat.messages(token)`, корень — `chat.all`.
- `src/features/chat/components/` — `ChatWidget` (до 639 px — круглая кнопка, с 640 px —
  плашка «Чат с ассистентом»; окно грузится отдельным чанком при открытии, `next/dynamic`
  с `ssr:false`) и `ChatWindow` (владелец токена, резиновое окно за левый верхний угол, поле
  ввода до 5 строк, на мобильном — экран минус поля 16 px, закрытие по Escape; варианты
  ответа — чипы `.chat-options`/`.chat-option` под последней репликой); `ChatIcons.tsx` —
  общий пузырь панели и шапки.
- Смонтирован в `src/app/layout.tsx`; стили — блоки `.chat-*` в конце `src/app/style.css`
  (13.11.2026; варианты ответа — 16.11.2026), перенос макета `.template/chat/`.

## Ловушки

- **Пустые `assistant`-реплики (дефект бэка, исправлен 13.11.2026):** на шагах вызова
  инструментов писался `assistant` с пустым `content`, витрина его отдавала, поллинг
  останавливался на нём и пропускал настоящий ответ. Бэк фильтрует пустой `content` в SQL
  до лимита PAGE (`PublicChatMessagesReader`, тест `PublicChatMessagesTest::test_get_skips_empty_assistant_steps`) — ТЗ `tz/chat-empty-assistant-backend.md` выполнено.
- **Лимит GET 60/мин с IP:** два открытых окна с ожиданием ответа делят лимит; на 429 опрос
  останавливается, сообщение бэка показывается.
- **`after_id` не используется:** полный список проще и не требует накопления; дневной лимит
  (20 сообщений) держит выдачу маленькой.

## See Also

- [project-architecture](project-architecture.md) — карта проекта и место чата в layout
- [articles-live-api](articles-live-api.md) — похожий паттерн живого API со Scramble-контрактом
- [backend-error-fallback](backend-error-fallback.md) — общее поведение при недоступном бэке
- [ui-porting-rules](ui-porting-rules.md) — перенос вёрстки `.template/chat/` в React
