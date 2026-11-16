# Чат: синхронизация после архитектурного ревью

> Source: отчёт architecture-reviewer по незакоммиченному набору чата (16.11.2026) + фактическое состояние кода
> Collected: 2026-11-16
> Published: 2026-11-16

Ревью четырёх планов чата (chat-live, chat-city, chat-options, chat-option-links) показало
устаревшие утверждения в статье wiki, противоречащие фактическому контракту и коду.

## Что верно сейчас

- **Город передаётся**: `city` слагом в каждом POST `/api/chat`; без города бэк берёт город
  магазина по умолчанию. Город определяет цены, наличие и сроки. Смена города продолжает
  диалог (`StartPublicChatTurn::rememberCity` обновляет `session.city_id`).
- **Пустые реплики `assistant` исправлены на бэке 13.11.2026**: `PublicChatMessagesReader`
  фильтрует пустой `content` в SQL до лимита PAGE; тест
  `PublicChatMessagesTest::test_get_skips_empty_assistant_steps`. Это уже не «известный дефект».
- **Варианты ответа**: `options: [{label, text?, url?}]`; `text` — отправка сообщением,
  `url` — переход в каталог в той же вкладке без перезагрузки (`router.push`), при совпадении
  адреса `router.refresh`; POST не вызывается. Показываются только у последней реплики;
  после клика скрываются (`dismissedMessageId` + `visibleOptions`).
- **Транспорт**: `shared/api/http.ts` — `fetchJson` (fetch + разбор + `ApiError`), `ApiError`,
  `readJson` приватный, `ApiErrorPayload`/`DEFAULT_API_ERROR_MESSAGE` общие с booking;
  `toErrorResponse`. Booking переведён на `fetchJson`.
- **Хук реплик**: `useChatMessages(token, onSessionExpired)`; 404-сброс — в `queryFn`
  (без `setState` в эффекте), владелец токена — `ChatWindow` (`expireSession`),
  `retry: false`, `AbortSignal` прокинут в fetch.
- **Виджет**: `ChatWidget` в root layout; окно — отдельный чанк (`next/dynamic`, `ssr:false`);
  мобильная панель — круглая кнопка, десктоп — плашка.

## Правки ревью

- `tests/unit/chatSend.test.ts` — `endsWith("/chat")` по контракту.
- Комментарии `options.ts` и блока `.chat-options` в `style.css` описывают и `url`-вариант.
- `documentations/integrations/chat.md` — дата проверки `options` 16.11.2026.
- Дубль правила «404 → стереть токен и сбросить диалог» свёрнут в `expireSession` окна.

## Прогоны

33 файла / 182 теста; `tsc` чисто; lint 0 ошибок (4 прежних предупреждения).
