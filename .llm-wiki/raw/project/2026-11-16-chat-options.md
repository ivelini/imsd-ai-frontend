# Чат: кликабельные варианты ответа (options)

> Source: локальные документы проекта — .claude/plans/chat-options.md, documentations/integrations/chat.md; контракт бэка — ../backend/documentations/api-maps/public-chat-frontend.md
> Collected: 2026-11-16
> Published: 2026-11-16

## Контракт бэка

У реплики ассистента может быть `options: [{label, text}]` — кнопки под текстом. `label` —
подпись кнопки, `text` — реплика, которая уходит в POST `/api/chat` при клике (как будто
пользователь её напечатал). Ключа `options` нет, когда выбора не было. Варианты строит бэкенд
по данным инструмента `search_vehicle` (марка, модель, год, группа модификаций), модель их
не сочиняет.

Правила витрины:
- показывать варианты только у последней реплики ленты;
- после клика кнопки больше не активны;
- `options` — данные, не HTML.

Бэк: `AiChatMessage.options` (json), `PublicChatMessageResource` отдаёт
`'options' => $this->when($this->resource->options !== null, ...)`; Scramble:
`PublicChatMessageResource.options: array|null`.

## Фронт

- DTO: `ChatOptionDto {label, text}`, `ChatMessageDto.options?: ChatOptionDto[]`
  (`src/shared/api/chat.ts`).
- Чистое правило: `lastOptions(messages)` в `src/features/chat/lib/options.ts` — берёт options
  только у последней реплики и только если она `assistant`; иначе пустой список. После клика
  последняя реплика — вопрос пользователя, поэтому кнопки исчезают сами.
- UI: в `ChatWindow` после ленты — `.chat-options` с кнопками `.chat-option`; `disabled`
  при `isPending`; клик вызывает общий `sendMessage(option.text, false)` (форма — `true`,
  то есть очищает поле только отправка из формы). Введённый текст клик не трогает.
- Стили — блок `.chat-options`/`.chat-option` в `src/app/style.css` (16.11.2026): белые чипы
  с красной подписью, рамка, hover — красная рамка.

## Проверки

- Тесты `tests/unit/chatOptions.test.ts`: варианты только у последней реплики; последняя
  реплика ассистента отдаёт options как есть; нет ключа/пустой список — пусто.
- Прогоны: красный 1 файл «Cannot find package» → зелёный 33 файла / 179 тестов; tsc чисто;
  lint 0 ошибок.
- Живой прогон (dev, `?city=ekaterinburg`): «Подбери шины на Toyota Camry» → варианты
  `["Camry","Camry IX (XV70)","Camry VII (XV40)","Camry VIII (XV50)"]`; клик «Camry» →
  POST `{"message":"Camry","city":"ekaterinburg"}`, кнопки исчезли, вопрос в ленте.
