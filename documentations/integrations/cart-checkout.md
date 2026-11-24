# Корзина и оформление заказа: интеграция с бэком

Живой API с 24.11.2026. Источник истины — Scramble `../backend/documentations/scramble/public-api.json`;
саммари контракта — `../backend/documentations/api-maps/checkout-frontend.md`. Фронт: `shared/api/cart.ts`,
`shared/api/checkout.ts`.

## Поток

1. Корзина → «Оформить заказ»: проверка формы и корзины → `Idempotency-Key` (`crypto.randomUUID`) →
   черновик в `sessionStorage` (`checkout-draft`) → `POST /api/checkout/code {phone}` → `retry_after`.
2. `/checkout/code`: 4 цифры, повторная отправка по `retry_after` (кулдаун).
3. `POST /api/checkout` с черновиком, кодом и тем же ключом. Состав заказа — из текущей корзины;
   позиции в теле не передаются.
4. 201 → снимок заказа в `sessionStorage` (`checkout-order-snapshot`), черновик очищается,
   переход `/order/[id]`. Повтор с тем же ключом — 200 с тем же заказом.

## Эндпоинты

| Метод | Путь | Примечание |
|---|---|---|
| GET | `/api/reference/checkout` | способы получения/оплаты + `code_ttl_min`; читается на сервере |
| GET | `/api/reference/delivery-points?city=` | точки города; пустой список — самовывоз недоступен |
| GET | `/api/cart?city=` | корзина целиком |
| POST | `/api/cart/items` | `itemable_type` tire/wheel, `itemable_id`, `quantity`, `city` |
| PATCH | `/api/cart/items/{item}` | абсолютное `quantity`, `city` |
| DELETE | `/api/cart/items/{item}?city=` | корзина после удаления |
| POST | `/api/checkout/code` | телефон; `retry_after` — длительность кулдауна |
| POST | `/api/checkout` | создание заказа по коду |

## Заголовки и контекст

- `X-Device-Id` — гость, 1–64 символа; постоянный id в localStorage (`device-id`). `Authorization`
  не отправляется: авторизация на фронте пока мок. Невалидный токен бэк трактует как гостя.
- `Idempotency-Key` — на `/checkout/code` и `/checkout`, один на попытку, ≤64.
- Город — слагом в query/теле (`?city=` / `city`); корзина одна на устройство, город влияет на цены.
- Все ответы — `{data: …}`.

## Отказы (по машинному коду, не по тексту)

`checkout.phone_code_invalid|expired|used`, `checkout.code_cooldown` (429 + `retry_after`),
`checkout.phone_invalid`, `checkout.consent_required`, `checkout.cart_empty`,
`checkout.item_unavailable`, `checkout.stock_insufficient`, `checkout.pickup_point_invalid`,
`checkout.email_taken`, `checkout.idempotency_key_required`; ошибки валидации — без кода.
Корзина: `cart.device_missing`, `cart.item_unavailable`.

## Ограничения и долги бэка

- В ответе корзины нет картинки и артикула — фронт показывает общую заглушку, «Код товара» скрыт.
- `delivery_cost = 0`, `total = subtotal`; онлайн-оплаты и уведомлений о заказе нет.
- Публичного чтения заказа гостя нет: страница успеха живёт снимком; `/order-status` — подсказка.
- Способ «транспортная компания» не поддерживается; адрес курьера — структура, не свободная строка.
- `status` заказа — машинный код без подписи (ярлык на фронте не строим — долг бэка).

## Файлы

- Корзина: `features/cart/` (хуки, компоненты, `lib/itemable.ts`), `shared/api/cart.ts`.
- Оформление: `features/checkout/` (`lib/*`, `api/*`, `CheckoutPage`, `CheckoutCodeStep`, `OrderPage`),
  `app/checkout/page.tsx`, `app/checkout/code/page.tsx`, `shared/api/checkout.ts`.
- Общее: `shared/lib/{deviceId,storageStore,countdown,otp}.ts`, `shared/ui/{Alert,OtpCodeInput}.tsx`.
