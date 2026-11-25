# Аккаунт клиента: вход, регистрация, восстановление пароля, профиль

Живая интеграция с бэкендом (домен Account). Контракт сверен 2026-11-24 с
`../backend/documentations/scramble/public-api.json` и `../backend/documentations/api-maps/account-frontend.md`;
при расхождении побеждает Scramble. Источник истины маршрутов — Scramble-экспорт.

Код фронта: `src/shared/api/auth.ts`, `src/shared/api/account.ts`, `src/features/auth/`,
`src/features/account/`. План — `.claude/plans/account-auth-live.md`.

## Заголовки

| Заголовок | Когда |
|---|---|
| `Content-Type: application/json`, `Accept: application/json` | все POST/PATCH/PUT |
| `Authorization: Bearer <token>` | все `/api/account/*`, `POST /api/auth/logout`, корзина и checkout при входе |
| `X-Device-Id` | вход и регистрация — для слияния гостевой корзины (1–64 символа); корзина гостя |

## Поток

1. **Регистрация** (только с SMS-кодом): `POST /auth/register/code {phone}` → `data.retry_after`;
   затем `POST /auth/register {phone, name, email?, password, password_confirmation, code}` →
   201 `{data: {token, client}}`. Телефон обязателен, e-mail — по желанию. Если карточка телефона
   уже есть после checkout без пароля — регистрация привязывает пароль к ней.
2. **Вход**: `POST /auth/login {phone, password}` → `{data: {token, client}}`.
   **Вход только по телефону**, не по e-mail.
3. **Выход**: `POST /auth/logout` (Bearer) удаляет текущий токен.
4. **Восстановление по SMS**: `POST /auth/password/forgot/sms {phone}` → `data.retry_after`;
   `POST /auth/password/reset/sms {phone, code, password, password_confirmation}` → `{message}`.
   Бэк не раскрывает, есть ли карточка: код высылается всегда, ошибка — на шаге сброса.
5. **Восстановление по e-mail**: `POST /auth/password/forgot/email {email}` → `{message}` (одинаковый
   для любой карточки); письмо ведёт на `FRONTEND_URL/reset-password?token=…&email=…`;
   `POST /auth/password/reset/email {email, token, password, password_confirmation}` → `{message}`.
6. **Профиль**: `GET /account/profile` → `{data: client}`; `PATCH /account/profile {name?, surname?,
   patronymic?, email?}`; `POST /account/profile/phone/code {phone}` → `data.retry_after`;
   `PATCH /account/profile/phone {phone, code}`.
7. **Уведомления**: `GET|PUT /account/notification-settings` — матрица `{event, channel, enabled}`.

`client`: `{id, name, surname, patronymic, full_name, phone, email}`; фронт — `Client` с `fullName`.
Пароль — минимум 8 символов; `code` — 4 цифры. Токен бессрочный; выход удаляет только текущий.

## Сессия в браузере

- Токен — Sanctum Bearer, ключ `auth-token`. Галочка «Запомнить меня» → `localStorage`, без неё →
  `sessionStorage` (живёт до закрытия вкладки). Чтение — сначала `sessionStorage`, затем `localStorage`.
- Сессия экрана — React Query `["auth","session"]`: `GET /account/profile` с токеном; без токена — `null`.
- **401** (токен удалён/просрочен) → токен очищается, сессия `null`, профиль уводит на
  `/auth/login?next=/account/profile`. Остальные сетевые ошибки — «повторить», не разлогин.
- После сброса пароля бэк удаляет все токены клиента: фронт очищает свой токен и кэши ЛК.

## Корзина и оформление

Маршруты `/api/cart*` и `/api/checkout*` используют `OptionalSanctumAuth`: с Bearer бэк берёт
корзину аккаунта, без — гостевую по `X-Device-Id`. Вход и регистрация с `X-Device-Id` сливают
гостевую корзину с корзиной аккаунта (гостевая удаляется). Поэтому после входа фронт шлёт
`Authorization` во всех запросах корзины и checkout — иначе пользователь увидит пустую гостевую
корзину, а заказы не попадут в ЛК. После входа/выхода кэш корзины инвалидируется.

## Отказы

Тело доменного отказа: `{message, code, retry_after?}`; 422 — доменный код, 429 — кулдаун кода
(с `retry_after`, остаток) либо throttle Laravel (без `code`; фронт показывает русский текст).
Ошибки валидации приходят с `errors` и без машинного кода — на экран идёт общий текст.

Коды: `auth.credentials_invalid`, `auth.phone_taken`, `auth.email_taken`, `auth.phone_invalid`,
`auth.code_invalid`, `auth.code_expired`, `auth.code_used`, `auth.code_cooldown`,
`auth.reset_token_invalid`. Разбор — `shared/api/authErrors.ts`; тексты — русские `message` бэка.

## Требования к окружению бэка

- `FRONTEND_URL` (config `shop.frontend_url`) должен указывать на витрину: от него строится ссылка
  восстановления `/reset-password?token=…&email=…`.
- SMS в dev — `LogSmsSender`: код пишется в `../backend/storage/logs/laravel.log`.

## Долги бэка

- Подписи событий уведомлений: API отдаёт `order_created`, `payment_confirmed`, `status_changed`,
  `ready_for_pickup`, `booking_created`, `return_warranty` без русских названий. Фронт держит
  временный словарь `features/account/lib/notifications.ts`; ТЗ — `documentations/tz/notification-labels-backend.md`.
- TTL SMS-кода в ответах auth-API не приходит — подсказку «действует N минут» фронт не показывает.
