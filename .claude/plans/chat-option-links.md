# Чат: варианты-ссылки на каталог (options.url)

**Согласовано:** 2026-11-16

## 1. Решения, согласованные в обсуждении

| Вопрос | Ответ пользователя (дословно) | Следствие в плане |
|---|---|---|
| Как открывать страницу каталога по клику на ссылку в чате | «В той же вкладке без перезагрузки (Recommended)» | `router.push(url)`; если адрес совпадает с текущим — `router.refresh()`; окно чата остаётся открытым (layout не перемонтируется) |

Решения по контракту (источники — `backend/documentations/api-maps/public-chat-frontend.md` п. 6
(обновлён), `public-chat.md`, `domains/AI/Models/AiChatMessage.php`):

- У варианта **либо `text`**, либо **`url`** (относительный путь каталога с параметрами и городом);
  `label` — подпись в обоих случаях. Клик по `url` — переход, POST **не вызывается**;
  по `text` — обычная отправка сообщением (как сейчас).
- Показывать варианты только у последней реплики; после клика кнопки больше не активны.
- Ссылка — семантический `<a href>` с перехватом левого клика (средний/ctrl-клик работают нативно).

## 2. Цель и ожидаемый результат

Ассистент предлагает готовый подбор («Открыть каталог»), клик по ссылке открывает страницу
каталога в текущей вкладке без перезагрузки приложения: данные каталога запрашиваются заново,
окно чата остаётся открытым. Если ссылка ведёт на текущий адрес, страница принудительно
обновляется (`router.refresh`). После клика варианты этой реплики скрыты.

## 3. Задачи с контрактом шага

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| 1.1 | `src/shared/api/chat.ts` → `ChatOptionDto` | `{label: string; text?: string; url?: string}` |
| 1.2 | `src/features/chat/lib/options.ts` → `isCurrentLocation` | `(url: string, current: string)` → `boolean` (адрес совпадает — нужен `router.refresh`, иначе `router.push`) |
| 1.3 | `tests/unit/chatOptions.test.ts` → тесты 4–5 | вариант только с `url` не выбрасывается; совпадение адреса определяется |
| 2.1 | `src/features/chat/components/ChatWindow.tsx` → `openOptionLink`, `dismissedMessageId` | `(event: MouseEvent<HTMLAnchorElement>, url: string)` → сверка с `window.location`, `router.push(url)` / `router.refresh()`; клик скрывает варианты реплики через `visibleOptions` |
| 2.2 | `src/features/chat/components/ChatWindow.tsx` → разметка `.chat-options` | `option.url` → `<a className="chat-option" href={url}>`; `option.text` → кнопка отправки; ключ варианта — `url ?? text ?? label` |
| 2.3 | `src/app/style.css` | `a.chat-option`: `text-decoration: none`, `display: inline-flex`; блок с датой 16.11.2026 |
| 3.1 | `documentations/integrations/chat.md` | раздел «Варианты ответа»: `text`/`url`, переход в той же вкладке, скрытие после клика |
| 3.2 | `CLAUDE.md` | строка чата: варианты-ссылки каталога |
| 3.3 | wiki (через `llm-wiki`) | статья чата: `options.url` и переход |

## 4. Новые сущности

Новых модулей нет: правка DTO, компонента и стилей. Правило «варианты только у последней
реплики» уже покрыто `lastOptions` — переиспользуем.

Переиспользуем: `visibleOptions`, `sendMessage(option.text, false)`, `useRouter` (`next/navigation`,
как в `GeoPopup`), класс `.chat-option`.

Не делаем: страницы-переходника, нового компонента, client-side предзагрузки каталога,
открытия в новой вкладке, отправки POST при клике по `url`, хранения «кликнутых» опций
в localStorage/sessionStorage (скрытие — состояние окна).

Сначала минимальный вариант: `<a href>` + `router.push`, при совпадении адреса — `router.refresh`.
Отклонён тяжёлый: собственная навигация с предзагрузкой данных каталога — цена: дублирование
роутинга Next, ничего не ломает проще.

## 5. STOP-условие и бюджет диффа

STOP: изменение контракта бэка; новая зависимость; новый маршрут/редирект; отправка POST
при клике по `url`; правки поллинга/города/опций-текста; дифф шага больше 4 файлов.

Бюджет: шаг 1 — 2 файла, шаг 2 — 2 файла, шаг 3 — 2 файла + wiki.

Профиль чтения: options — несколько строк в уже читаемой реплике; переход — обычная навигация Next.

## 6. Тест-лист

Файл `tests/unit/chatOptions.test.ts` (дополняется)

Тест 4
1. Поведение: вариант-ссылка не имеет `text` — это не повод его выбрасывать; `url` доходит до рендера
2. Вход: `[{role: "assistant", options: [{label: "Открыть каталог", url: "/catalog/tires/winter/w175/p65/r14?city=cheljabinsk"}]}]`
3. Ожидание: `lastOptions` вернул массив из одного элемента с этим `url`
4. Имя: `test_url_option_is_returned`

Тест 5
1. Поведение: ссылка на текущий адрес не должна делать пустой `push` — нужен `router.refresh`; другой адрес — обычный переход
2. Вход: `isCurrentLocation("/catalog/tires/winter?city=cheljabinsk", "/catalog/tires/winter?city=cheljabinsk")` и та же ссылка с текущим путём `/catalog/tires/summer?city=cheljabinsk`
3. Ожидание: `true` и `false`
4. Имя: `test_current_location_detection`

## 7. Схема вызовов

```
 GET /api/chat/messages → реплика assistant с options [{label, text?|url?}]
        │
        ▼
┌─ БРАУЗЕР ─────────────────────────────────────────────────────────────┐
│  useChatMessages → ChatWindow.tsx                                     │
│    visibleOptions(messages, dismissedMessageId) → options             │
│        │ разметка                                                     │
│        ├─ option.text → <button> → sendMessage(text, false) → POST    │
│        └─ option.url  → <a href> onClick=openOptionLink               │
│              │ preventDefault (только левый клик без модификаторов)   │
│              ▼                                                        │
│         url === pathname + search ? router.refresh() : router.push()  │
│              │                                                        │
│              ▼                                                        │
│         setDismissedMessageId(lastMessage.id) → варианты скрыты       │
└───────────────┼───────────────────────────────────────────────────────┘
                ▼
   Next App Router: RSC-запрос страницы каталога; layout (и окно чата) сохраняется
```

## 8. Открытые вопросы

Нет.

## 9. Прогоны

- **Красный (16.11.2026):** 1 тест падает `isCurrentLocation не является функцией`; тест
  «вариант-ссылка возвращается» — страж, законно зелёный; 180 тестов зелёные.
- **Зелёный (16.11.2026):** 33 файла / 181 тест прошли; `npx tsc --noEmit` чисто;
  `npm run lint` — 0 ошибок (4 прежних предупреждения).
- **Живой прогон (dev, `?city=ekaterinburg`):** «Найди зимние шины 205/55 R16 в наличии» →
  вариант `<a>` «Открыть каталог» с `href=/catalog/tires/winter/w205/p55/r16?city=ekaterinburg`;
  клик → URL каталога сменился, окно чата осталось открытым, вариантов 0, POST не отправлялся.
