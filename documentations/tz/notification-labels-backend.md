# ТЗ бэку: русские подписи событий уведомлений

- **Дата:** 2026-11-24
- **Эндпоинт:** `GET|PUT /api/account/notification-settings`
- **Кто просит:** фронт (личный кабинет, карточка «Уведомления»)

## Проблема

Ответ отдаёт только машинные коды:

```json
{"data": [{"event": "order_created", "channel": "sms", "enabled": true}]}
```

Фронт вынужден держать словарь русских подписей у себя (`NOTIFICATION_EVENT_LABELS` в
`src/features/account/lib/notifications.ts`). По правилу `api-contract.md` подписи для отображения
формирует бэк.

## Что нужно

1. В каждой строке ответа рядом с машинным значением — русская подпись события, например:
   ```json
   {"event": "order_created", "event_label": "Заказ создан", "channel": "sms", "enabled": true}
   ```
   либо справочник `GET /api/reference/notification-settings` → `events: [{value, label}]`,
   `channels: [{value, label}]` (как у статусов записи).
2. Подписи — те же, что в утверждённом макете профиля:
   - `order_created` — Заказ создан
   - `payment_confirmed` — Оплата подтверждена
   - `status_changed` — Статус заказа изменился
   - `ready_for_pickup` — Заказ готов к выдаче
   - `booking_created` — Запись на шиномонтаж создана
   - `return_warranty` — Возврат и гарантия
3. PUT принимает те же значения (подписи в теле не нужны).

## После закрытия

Фронт удаляет словарь и берёт подпись из ответа; меняется только
`features/account/lib/notifications.ts` (адаптер) — экран не переделывается.
