# Чат на живом API

**Согласовано:** 2026-11-13

## 1. Решения, согласованные в обсуждении

| Вопрос | Ответ пользователя (дословно) | Следствие в плане |
|---|---|---|
| Какая панель запуска в приложении | «под мобильное разрешение круглая кнопка, под десктоп плашка с подписью» | Одна разметка кнопки (иконка + подпись); до 639 px CSS превращает её в круг и скрывает подпись, с 640 px — плашка «Чат с ассистентом» |
| Что видит посетитель, пока сообщений нет | «Приветствие (Recommended)» | Пустая лента показывает статичное приветствие ассистента (текст фронта, в историю не пишется); с первой репликой исчезает |
| Что делает «Повторить» после таймаута | «Повторить опрос (Recommended)» | Кнопка возобновляет GET-поллинг ещё на 60 с; POST не повторяется, дубля вопроса нет |

Проектные решения по контракту (источник — `backend/documentations/api-maps/public-chat.md`,
`public-chat-frontend.md`):

- **Поллинг полным списком** (`GET /api/chat/messages` без `after_id`): контракт разрешает
  «без параметра — последние до 200 реплик». Дневной лимит — 20 сообщений посетителя, то есть
  ≤ 40 реплик; накопление через `after_id` не нужно — меньше кода и нет риска пропусков.
- **Токен** — `session_token` из 202 в `localStorage` (ключ `chat_session_token`), только
  заголовком `X-Session-Token`.
- **404 на GET** — токен протух: стереть токен, показать приветствие; следующий POST создаст
  новый диалог.
- **422** — техническая ошибка формата: показываем общий текст «Не удалось отправить
  сообщение. Попробуйте ещё раз» (сообщение `validation.*` на экран не пускаем — как в booking).
- **400** `ai.off_topic` — текст из `message` показываем плашкой в ленте, введённый текст
  остаётся в поле; **429** — текст из `message` (лимит/бюджет), поллинг останавливается,
  плашка с «Повторить» (повтор — GET, не POST); **5xx/сеть** — «Сервис временно недоступен»
  + «Повторить».
- **Пустой `created_at`** — время не выводим, ожидание не ограничиваем таймером (граничный
  случай контракта; тип DTO это допускает).

## 2. Цель и ожидаемый результат

Виджет чата на всех страницах сайта: панель запуска в правом нижнем углу, окно с анонимным
диалогом с ИИ-ассистентом. Вопрос уходит POST-ом, ответ появляется GET-поллингом; токен
переживает перезагрузку; ошибки бэка различаются по статусу и `code`; вёрстка и поведение
(резиновое окно, поле ввода до 5 строк, полноэкранный мобильный чат с полями 16 px) —
из макета `.template/chat/`.

## 3. Задачи с контрактом шага

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| 1.1 | `src/shared/api/http.ts` → `readJson` (внутренний), `fetchJson`, `toErrorResponse` | `(path, init?)` → тело запроса; `unknown` → `{status, body}` |
| 1.2 | `src/shared/api/http.ts` → `ApiError`, `ApiErrorPayload`, `DEFAULT_API_ERROR_MESSAGE` | класс ошибки, форма тела отказа и общий текст для обоих доменов |
| 1.3 | `src/shared/api/booking.ts` → `request`/`post` | перевести на `fetchJson`; `BookingApiError` удалить |
| 1.4 | `src/features/booking/lib/errors.ts` → `toErrorResponse` | ре-экспорт из `shared/api/http`; `BookingErrorResponse = ApiErrorResponse` |
| 2.1 | `src/shared/api/chat.ts` → `sendChatMessage` | `(message: string, token?: string)` → `Promise<ChatAcceptedDto>` |
| 2.2 | `src/shared/api/chat.ts` → `fetchChatMessages` | `(token: string)` → `Promise<ChatMessageDto[]>` |
| 2.3 | `src/features/chat/lib/errors.ts` → `mapChatError` | `{status, body}` → `{kind, message}` |
| 2.4 | `src/features/chat/lib/time.ts` → `formatChatTime` | `(iso: string \| null)` → `string` («ЧЧ:ММ» или пусто; зона браузера) |
| 2.5 | `src/features/chat/lib/polling.ts` → `shouldPoll`, `isWaitTimedOut` | `(messages, now, retryUntil)` → `boolean` |
| 3.1 | `src/shared/api/queryKeys.ts` → `chat.messages(token)` | `string \| null` → `["chat","messages",token]` |
| 3.2 | `src/features/chat/lib/session.ts` → `readChatToken`/`saveChatToken`/`clearChatToken` | localStorage, guarded `typeof window` |
| 3.3 | `src/features/chat/api/useChatMessages.ts` → `useChatMessages` | `(token: string \| null, onSessionExpired: () => void)` → `{messages, error, retry, timedOut}`; 404-сброс — в `queryFn` |
| 3.4 | `src/features/chat/api/useSendChatMessage.ts` → `useSendChatMessage` | `useMutation`: `{message, token?}` → `ChatAcceptedDto` |
| 4.1 | `src/features/chat/components/ChatWidget.tsx` → `ChatWidget` | пропсов нет → кнопка + состояние открытия + `ChatWindow` |
| 4.2 | `src/features/chat/components/ChatWindow.tsx` → `ChatWindow` | `{onClose}` → окно: шапка, лента, приветствие, ошибки, ввод, ресайз; токен — внутри окна, чанк грузится при открытии |
| 4.3 | `src/app/layout.tsx` | смонтировать `<ChatWidget />` внутри `ClientLayout` |
| 4.4 | `src/app/style.css` | блок `.chat-*` из макета (пометка 13.11.2026), адаптивная панель |
| 5.1 | `documentations/integrations/chat.md` | контракт, токен, поллинг, ошибки |
| 5.2 | `CLAUDE.md` | строка про чат в «Данные и состояние» |

Правило двух срабатывает на шаге 1: `readJson` и класс ошибки со `status`/`body` уже есть
в `booking.ts` — вторая копия для чата не создаётся, общее выносится в `shared/api/http.ts`.
Правка booking — механическая, поведение не меняется (его страхует `bookingErrorMapping.test.ts`).

## 4. Новые сущности

| Путь | Зачем |
|---|---|
| `src/shared/api/http.ts` | `readJson` + `ApiError` — общий транспорт для booking и chat (вторая копия) |
| `src/shared/api/chat.ts` | DTO и два запроса чата — единственная точка контракта |
| `src/features/chat/lib/errors.ts` | статус+`code` → состояние экрана (чистая функция, тест) |
| `src/features/chat/lib/time.ts` | ISO → «ЧЧ:ММ» (чистая функция, тест) |
| `src/features/chat/lib/polling.ts` | правила поллинга и таймаута (чистая функция, тест) |
| `src/features/chat/lib/session.ts` | токен в localStorage (тонкая обёртка) |
| `src/features/chat/api/useChatMessages.ts` | React Query: чтение реплик и интервал опроса |
| `src/features/chat/api/useSendChatMessage.ts` | мутация отправки |
| `src/features/chat/components/ChatWidget.tsx` | клиентский остров: панель + открытие |
| `src/features/chat/components/ChatWindow.tsx` | окно чата: лента, ввод, ошибки, ресайз |
| `src/features/chat/components/ChatIcons.tsx` | общий пузырь чата для панели и шапки (вторая копия SVG) |

Переиспользуем: `apiBase`, `queryKeys`, `useEsc` (закрытие окна по Escape), классы/вёрстку
`.template/chat/`, токены `style.css`. Новых зависимостей нет.

Не делаем: списка диалогов, переключателя города внутри окна чата (город — из выбора на сайте), SSE/WebSocket
(бэк не поддерживает), быстрых тем/подсказок, истории чата в ЛК, пункта меню «Чат», правок
Header/Footer, компонентных тестов (RTL не установлена — отдельное решение), правок `.template/`.

Сначала минимальный вариант: один клиентский компонент + `useQuery` с `refetchInterval` +
`useMutation`, токен в localStorage. Отклонён тяжёлый: Zustand-стор диалога, накопление по
`after_id`, SSE — цена: лишнее состояние и код без второй копии; бэк стрим не даёт.

## 5. STOP-условие и бюджет диффа

STOP: новая зависимость; изменение контракта бэка; добавление `after_id`-накопления;
правки Header/Footer/меню; новый глобальный стор; дифф шага больше 8 файлов; любые изменения
`.template/`. При STOP — вопрос, а не расширение объёма.

Бюджет: шаг 1 — 3 файла, шаг 2 — 8 (5 кода + 3 теста), шаг 3 — 4, шаг 4 — 4, шаг 5 — 2.

Фактические отклонения (ревью 16.11.2026): `fetchJson`, `ChatIcons`, `visibleOptions` и параметр
`init` в тест-моке добавлены по правилу двух/тестируемости; бюджеты шагов превышены осознанно,
поведение не менялось.

Профиль чтения: `GET /api/chat/messages` — до 200 реплик × ~0,2–0,5 КБ (практически ≤ 40 за
сутки), поллинг 1,5 с только пока ждём ответ; двухфазное чтение не требуется.

## 6. Тест-лист

Файл `tests/unit/chatErrorMapping.test.ts`

Тест 1
1. Поведение: ответ 400 с кодом `ai.off_topic` различается по коду, а не по тексту — «Тема не поддерживается» показывается плашкой
2. Вход: `{status: 400, body: {message: "Тема не поддерживается", code: "ai.off_topic"}}`
3. Ожидание: `kind === "off_topic"`, `message` из тела
4. Имя: `test_off_topic_mapped_by_code`

Тест 2
1. Поведение: 404 означает протухший токен — экран сбрасывает диалог
2. Вход: `{status: 404, body: {message: "Сессия не найдена"}}`
3. Ожидание: `kind === "session_expired"`
4. Имя: `test_404_means_session_expired`

Тест 3
1. Поведение: 429 показывает текст бэка (лимит/бюджет) и не маскируется под неизвестную ошибку
2. Вход: `{status: 429, body: {message: "Дневной лимит сообщений исчерпан"}}`
3. Ожидание: `kind === "limit"`, текст совпадает
4. Имя: `test_429_shows_backend_message`

Тест 4
1. Поведение: 422 с техническими `errors` не пускает ключи валидации на экран
2. Вход: `{status: 422, body: {message: "validation.max", errors: {message: ["max"]}}}`
3. Ожидание: `kind === "invalid"`, `message` — общий текст, не `validation.max`
4. Имя: `test_422_hides_validation_keys`

Тест 5
1. Поведение: сеть/5xx сводится к «Сервис временно недоступен» с возможностью повторить
2. Вход: `{status: 0, body: null}` и `{status: 500, body: null}`
3. Ожидание: `kind === "unavailable"`, текст «Сервис временно недоступен»
4. Имя: `test_network_and_5xx_are_unavailable`

Файл `tests/unit/chatTime.test.ts`

Тест 6
1. Поведение: ISO выводится как «ЧЧ:ММ»; вход без смещения парсится как локальное время — тест не зависит от TZ машины
2. Вход: `"2026-11-13T10:00:04"`
3. Ожидание: `"10:00"`
4. Имя: `test_format_time_from_iso`

Тест 7
1. Поведение: пустое время не рисует подпись (контракт допускает `created_at: null`)
2. Вход: `null`
3. Ожидание: `""`
4. Имя: `test_null_time_is_empty`

Файл `tests/unit/chatPolling.test.ts`

Тест 8
1. Поведение: пока последняя реплика — вопрос пользователя и не прошло 60 с, поллинг включён
2. Вход: `[{role: "user", created_at: "2026-11-13T10:00:00+00:00"}]`, `now = 10:00:30Z`, `retryUntil = 0`
3. Ожидание: `shouldPoll(...) === true`
4. Имя: `test_poll_while_waiting_for_assistant`

Тест 9
1. Поведение: после ответа ассистента и после 60 с ожидания поллинг выключается — граница 60 000 мс
2. Вход: последняя реплика `assistant`; последняя `user` с `now = created_at + 60 001 мс`
3. Ожидание: в обоих случаях `false`; `isWaitTimedOut(...) === true` для второго
4. Имя: `test_stop_after_answer_or_timeout`

Тест 10
1. Поведение: «Повторить» продлевает ожидание — таймаут снят на время нового окна
2. Вход: последняя `user` старше 61 с, `retryUntil = now + 60 000`
3. Ожидание: `shouldPoll(...) === true`, `isWaitTimedOut(...) === false`
4. Имя: `test_retry_extends_polling_window`

## 7. Схема вызовов

```
 Посетитель: клик по панели «Чат с ассистентом»
        │  (ChatWidget: open = true)
        ▼
┌─ БРАУЗЕР ────────────────────────────────────────────────────────┐
│  [Client] features/chat/components/ChatWidget.tsx                │
│        │ читает токен: features/chat/lib/session.ts (localStorage)│
│        ▼                                                         │
│  [Client] features/chat/components/ChatWindow.tsx                │
│        │                                                         │
│        ├─ useChatMessages(token) ── React Query                  │
│        │     queryFn → shared/api/chat.ts fetchChatMessages      │
│        │     GET /api/chat/messages   (X-Session-Token)          │
│        │     refetchInterval = shouldPoll(...) ? 1500 : false    │
│        │                                                         │
│        ├─ useSendChatMessage() ── useMutation                    │
│        │     POST /api/chat {message} (+ X-Session-Token)        │
│        │     202 → saveChatToken → invalidate messages           │
│        │                                                         │
│        └─ ошибки: mapChatError(status, body) → плашка в ленте    │
└───────────────┬──────────────────────────────────────────────────┘
                │ /api/* (same-origin)
                ▼
┌─ NEXT ───────────────────────────────────────────────────────────┐
│  next.config.ts rewrites: /api/:path* → BACKEND_URL/api/:path*   │
└───────────────┬──────────────────────────────────────────────────┘
                ▼
┌─ БЭК (Laravel) ──────────────────────────────────────────────────┐
│  POST /api/chat → 202 {session_token, message_id, status}        │
│  GET  /api/chat/messages → 200 {data:[{id, role, content, created_at}]} │
│  400 ai.off_topic · 404 · 422 · 429                              │
└──────────────────────────────────────────────────────────────────┘
```

## 8. Открытые вопросы

Нет.

## 9. Прогоны

- **Красный (13.11.2026):** 3 файла падают `Cannot find package '@/features/chat/lib/...'`;
  28 файлов / 162 теста зелёные — реализации ещё нет.
- **Зелёный (13.11.2026):** 31 файл / 172 теста прошли; `npx tsc --noEmit` чисто;
  `npm run lint` — 0 ошибок (4 прежних предупреждения в чужих файлах).
- **Живой прогон (dev, порт 30034 → бэк):** `POST /api/chat` → 202, `GET /api/chat/messages`
  → 200, ответ ассистента получен; лаунчер: десктоп — плашка 202×52, мобильный — круг 60×60;
  окно открывается с приветствием.
- **Найдено при прогоне:** бэк отдаёт пустую реплику `assistant` перед настоящим ответом
  (шаги инструментов). Решение пользователя от 13.11.2026: чинит бэк, фронт не фильтрует.
  ТЗ — `documentations/tz/chat-empty-assistant-backend.md`; до правки бэка виджет временно
  показывает пустой пузырь и может не дождаться ответа до перезагрузки.
- **Ревью (16.11.2026):** 33 файла / 182 теста, `tsc` чисто, lint 0 ошибок; правки агента —
  `endsWith` в тесте, комментарии, дата в docs, 404-сброс через `expireSession`.
