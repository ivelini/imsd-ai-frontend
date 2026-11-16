# Чат: кликабельные варианты ответа (options)

**Согласовано:** 2026-11-16

## 1. Решения, согласованные в обсуждении

Вопросов пользователю не задавал: поведение полностью задано контрактом бэка
(`backend/documentations/api-maps/public-chat-frontend.md` п. 6, `public-chat.md`;
`domains/AI/Http/Resources/PublicChatMessageResource.php`; Scramble `PublicChatMessageResource`).

| Вопрос | Источник | Следствие в плане |
|---|---|---|
| Что приходит в реплике | контракт: `options?: [{label, text}]`, ключа нет, когда выбора не было | DTO `ChatOptionDto` + `options?` в `ChatMessageDto` |
| Где показывать | контракт: только у последней реплики ленты | чистая функция `lastOptions(messages)` — берёт options последней реплики, только если она `assistant` |
| Что делает клик | контракт: отправляет `text` как обычное сообщение (`sendChatMessage`), `label` — подпись кнопки | кнопка вызывает тот же путь отправки, что и форма; введённый текст в поле не трогается |
| Когда кнопки неактивны | контракт: после клика больше не активны | `disabled` при `isPending`; после успешной отправки последняя реплика — `user`, кнопки исчезают |
| Разметка и стиль | мокапа нет, стиль — правила `ui-porting` | чипы `.chat-options`/`.chat-option` в конце ленты, блок CSS с датой 16.11.2026 |

## 2. Цель и ожидаемый результат

Если ассистент предложил выбор (марка, модель, год, группа модификаций), под его ответом
появляются кнопки; клик отправляет соответствующий текст в диалог, дальше работает обычный
поллинг ответа. После клика кнопки неактивны и исчезают с приходом новой реплики.

## 3. Задачи с контрактом шага

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| 1.1 | `src/shared/api/chat.ts` → `ChatOptionDto`, `ChatMessageDto.options?` | DTO бэка (`label`, `text`; `options` отсутствует, когда выбора нет) |
| 1.2 | `src/features/chat/lib/options.ts` → `lastOptions` | `(messages: ChatMessageDto[])` → `ChatOptionDto[]` (пусто, если последняя реплика не `assistant` или options нет) |
| 2.1 | `src/features/chat/components/ChatWindow.tsx` → `sendMessage`, `handleSend` | `sendMessage(raw: string, clearInput: boolean)`; форма → `clearInput=true`, клик по варианту → `false` |
| 2.2 | `src/features/chat/components/ChatWindow.tsx` → разметка ленты | после ленты: `visibleOptions(messages, dismissedMessageId)` → `.chat-options` с кнопками `.chat-option`, `disabled={isPending}`, `onClick` → `sendMessage(option.text, false)` |
| 2.3 | `src/app/style.css` | блок `.chat-options`/`.chat-option` (16.11.2026) |
| 3.1 | `documentations/integrations/chat.md` | раздел «Варианты ответа»: `options`, поведение клика |
| 3.2 | `CLAUDE.md` | строка про чат: кликабельные варианты |
| 3.3 | wiki (через `llm-wiki`) | статья чата: options; карта при необходимости |

## 4. Новые сущности

| Путь | Зачем |
|---|---|
| `src/features/chat/lib/options.ts` | правило «показываем варианты только у последней реплики ассистента» — чистая функция под тест |
| `tests/unit/chatOptions.test.ts` | пин правила: варианты только у последней реплики, после клика (последняя — `user`) их нет |
| `visibleOptions` в `features/chat/lib/options.ts` | правило «варианты с учётом клика» (url-переход скрывает их до смены реплики) — чистая функция под тест |

Переиспользуем: `sendChatMessage`/`useSendChatMessage` (клик — то же сообщение), `mapChatError`,
`ApiError`, `chat-msg-assistant` вёрстку, `isPending` мутации.

Не делаем: отдельный эндпоинт выбора, хранение выбранного варианта на фронте, отключение
клика вне последней реплики (она и так скрыта), новую зависимость, RTL-тесты.

Сначала минимальный вариант: кнопки рендерятся из данных последней реплики, клик вызывает
существующую отправку. Отклонён тяжёлый: отдельный компонент-виджет выбора с собственным
состоянием и подтверждением — цена: лишнее состояние, поведение уже задано контрактом.

## 5. STOP-условие и бюджет диффа

STOP: изменение контракта бэка; необходимость RTL/новой зависимости; отдельный эндпоинт
выбора; правки поллинга/токена/города; дифф шага больше 4 файлов.

Бюджет: шаг 1 — 3 файла (2 кода + тест), шаг 2 — 2 файла, шаг 3 — 2 файла + wiki.

Профиль чтения: options — несколько коротких строк в уже читаемой реплике; поллинг не меняется.

## 6. Тест-лист

Файл `tests/unit/chatOptions.test.ts`

Тест 1
1. Поведение: варианты берутся только у последней реплики — после вопроса пользователя кнопки исчезают (контракт: после клика неактивны)
2. Вход: `[{role: "assistant", options: [{label: "2013", text: "2013"}]}, {role: "user"}]`
3. Ожидание: `[]`
4. Имя: `test_options_only_from_last_message`

Тест 2
1. Поведение: у последней реплики ассистента варианты отдаются как есть (порядок и пара label/text не меняются)
2. Вход: `[{role: "user"}, {role: "assistant", options: [{label: "2013", text: "2013"}, {label: "2012", text: "2012"}]}]`
3. Ожидание: массив из двух элементов, первый — `{label: "2013", text: "2013"}`
4. Имя: `test_last_assistant_options_returned`

Тест 3
1. Поведение: ключа `options` нет или список пуст — кнопок нет (бэк не прислал выбор)
2. Вход: `[{role: "assistant"}]` и `[{role: "assistant", options: []}]`
3. Ожидание: `[]` в обоих случаях
4. Имя: `test_no_options_returns_empty`

Тест 4
1. Поведение: реплику уже кликнули — `visibleOptions` скрывает её варианты (url-переход не создаёт реплики пользователя)
2. Вход: `visibleOptions([{id: 7, role: "assistant", options: [...]}], 7)` и с `null`
3. Ожидание: `[]` и два варианта
4. Имя: `test_dismissed_message_options_hidden`

## 7. Схема вызовов

```
 Бэк: реплика ассистента с options [{label, text}] (только при выборе)
        │ GET /api/chat/messages (поллинг)
        ▼
┌─ БРАУЗЕР ────────────────────────────────────────────────────────────┐
│  useChatMessages → React Query cache (ChatMessageDto[])               │
│        │                                                             │
│        ▼                                                             │
│  ChatWindow.tsx                                                      │
│    visibleOptions(messages, dismissedMessageId) → ChatOptionDto[]    │
│        │ разметка                                                    │
│        ▼                                                             │
│  .chat-options → кнопки .chat-option (label), disabled=isPending     │
│        │ клик: sendMessage(option.text, clearInput=false)            │
│        ▼                                                             │
│  useSendChatMessage().mutate({message: text, token, city})           │
│        │ POST /api/chat  {message, city}                             │
└────────┼─────────────────────────────────────────────────────────────┘
         │ 202 → реплика user в ленте, поллинг ждёт ответ
         ▼
   Кнопки исчезли: последняя реплика — user, options у неё нет
```

## 8. Открытые вопросы

Нет.

## 9. Прогоны

- **Красный (16.11.2026):** 1 файл падает `Cannot find package '@/features/chat/lib/options'`;
  32 файла / 176 тестов зелёные.
- **Зелёный (16.11.2026):** 33 файла / 179 тестов прошли; `npx tsc --noEmit` чисто;
  `npm run lint` — 0 ошибок (4 прежних предупреждения).
- **Живой прогон (dev, `?city=ekaterinburg`):** вопрос «Подбери шины на Toyota Camry» → варианты
  `["Camry","Camry IX (XV70)","Camry VII (XV40)","Camry VIII (XV50)"]`; клик по «Camry» →
  POST `{"message":"Camry","city":"ekaterinburg"}`, кнопки исчезли, вопрос появился в ленте.
