# Личный кабинет на живом API: регистрация, вход, сброс пароля, профиль

> Sources: Личный кабинет на живом API, 2026-11-24; контракт `account-frontend.md` бэка, 2026-11-24
> Raw: [2026-11-24-account-auth-live](../../raw/project/2026-11-24-account-auth-live.md)

## Overview

С 24.11.2026 личный кабинет работает на живом API домена Account: мок-сессия в
`localStorage.session` (`loginMock`/`registerMock`/`logoutMock`) удалена. Вход — только по
телефону и паролю; регистрация — с SMS-кодом (форма и блок кода на одной странице); пароль
восстанавливается по SMS или по ссылке из письма. Сессия — Sanctum Bearer-токен: «Запомнить
меня» хранит его в `localStorage`, без галочки — в `sessionStorage`. Все запросы ЛК идут с
`Authorization`, 401 сбрасывает токен и уводит на вход. Вход и регистрация сливают гостевую
корзину (`X-Device-Id`), после чего корзина и оформление работают с токеном.

## Сессия и токен

- `shared/lib/authToken.ts`: ключ `auth-token`; сохранение в выбранное хранилище с удалением из
  другого, чтение — `sessionStorage` → `localStorage`, очистка — оба.
- `authHeaders()` в `shared/api/http.ts` подставляет `Bearer` во все запросы аккаунта (на сервере
  — пусто). Сессия экрана — React Query `["auth","session"]`: `GET /account/profile`; без токена —
  `null`; 401 — токен очищается, `null`. Читают шапка (`LoginBadge`), меню и профиль.
- Сброс сессии (выход, оба сценария сброса пароля — бэк удаляет все токены клиента, 401 в
  мутациях профиля) — `features/auth/api/sessionCache.ts::dropSession`: токен, кэши сессии,
  корзины и аккаунта. Выход чистит локально даже при сбое сети.

## Регистрация

Одна страница: имя*, телефон*, e-mail (необязательно), пароль* ≥ 8, повтор*, согласие*.
Первая отправка валидирует поля и вызывает `POST /auth/register/code`; при успехе раскрывается
блок кода из 4 цифр с таймером повторной отправки, смена телефона блок сбрасывает. Вторая
отправка — `POST /auth/register` с `code`; 201 возвращает токен и клиента: токен сохраняется
постоянно, сессия кладётся в кэш, корзина инвалидируется, редирект — на `?next=` (проверенный
внутренний путь) или `/account/profile`. Ошибки кода очищают цифры; `auth.phone_taken` даёт
ссылку «Войдите»; `auth.email_taken` — текст бэка.

## Вход и выход

`POST /auth/login {phone, password}` с `X-Device-Id`: бэк сливает гостевую корзину с корзиной
аккаунта и удаляет гостевую. Токен сохраняется по «Запомнить меня», сессия — в кэш, корзина
инвалидируется. Ошибки `auth.credentials_invalid`/`auth.phone_invalid` выводятся текстом бэка.
Выход — `POST /auth/logout` (Bearer), локальная очистка в любом случае, переход на главную.

## Восстановление пароля

- **SMS:** `/auth/restore-password` — одно поле «Телефон или E-mail»; наличие «@» направляет в
  `forgot/email`, иначе в `forgot/sms` → `/auth/new-password?phone=…` (без телефона — редирект
  на restore). Новый пароль: OTP + пароль ×2 + повторная отправка кода; успех — сообщение бэка
  «Пароль изменён.» и ссылка «Войти».
- **E-mail:** письмо ведёт на `/reset-password?token&email`; без параметров страница показывает
  «ссылка недействительна» и ссылку на запрос новой. Пароль ×2 → `POST /auth/password/reset/email`.
- Бэк не раскрывает наличие карточки: код/письмо уходят всегда, ошибка — на шаге сброса
  (`auth.reset_token_invalid`). Хост ссылки — `FRONTEND_URL` бэка; TTL кода в ответах auth-API
  нет, поэтому подсказка «действует N минут» не выводится.

## Профиль и телефон

`/account/profile` (`/account` → редирект): меню ЛК (имя из `full_name`, телефон, разделы,
выход) и карточки:

- **Личные данные** — имя*, фамилия, отчество, e-mail; `PATCH /account/profile`, успех —
  «Сохранено», ответ обновляет кэш сессии.
- **Телефон** — текущий номер, новый номер, «Получить код» с таймером (`POST .../phone/code`) →
  код → `PATCH .../phone`; успех обновляет сессию и очищает поля. Ошибки `auth.phone_taken`,
  `auth.code_*`, кулдаун.
- **Уведомления** — 6 событий × SMS/E-mail, `GET|PUT /account/notification-settings`, PUT
  отправляет полную матрицу 12 строк; отсутствующая строка — включена (умолчание бэка).

Профиль без сессии уводит на `/auth/login?next=/account/profile`; сетевой отказ — «Повторить»,
не разлогин.

## Уведомления: словарь подписей (долг бэка)

API отдаёт события машинными кодами (`order_created`, `payment_confirmed`, `status_changed`,
`ready_for_pickup`, `booking_created`, `return_warranty`) без русских подписей. Фронт держит
временный словарь `NOTIFICATION_EVENT_LABELS` и адаптер `features/account/lib/notifications.ts`
(группировка и сборка тела PUT); ТЗ бэку — `documentations/tz/notification-labels-backend.md`.
Когда бэк пришлёт подписи, меняется только адаптер.

## Корзина и оформление с токеном

Корзина и checkout используют `OptionalSanctumAuth`: с Bearer — корзина аккаунта, без — гостевая
по `X-Device-Id`. Поэтому после входа фронт шлёт `Authorization` во всех запросах корзины и
оформления; иначе видна пустая гостевая корзина, а заказы не привязываются к аккаунту. Вход и
регистрация передают `X-Device-Id` для слияния; после входа/выхода кэш корзины инвалидируется.
Детали корзины — [cart-checkout-live-api](cart-checkout-live-api.md).

## Отказы

Общий разбор доменного отказа вынесен в `shared/api/domainError.ts` (вторая копия после
checkout), карта `auth.*` — `shared/api/authErrors.ts`. Текст на экран — русский `message` бэка;
429 без машинного кода (throttle Laravel) заменяется русской формулировкой; ошибки валидации
с `errors` без кода сводятся к общей. Коды: `auth.credentials_invalid`, `auth.phone_taken`,
`auth.email_taken`, `auth.phone_invalid`, `auth.code_invalid`/`expired`/`used`,
`auth.code_cooldown`, `auth.reset_token_invalid`.

## Файлы и проверки

API — `shared/api/auth.ts`, `shared/api/account.ts`; сессия — `shared/lib/authToken.ts`,
`features/auth/api/sessionCache.ts`; формы — `features/auth/components/*Form.tsx` и
`shared/ui/CodeResend.tsx`; страницы — `/auth/{login,register,restore-password,new-password}`,
`/reset-password`; профиль — `features/account/components/*`. Чистые помощники: `authToken`,
`safeNext` (защита от открытого редиректа), `validation` (пароль/email), `phone` (канон
`7XXXXXXXXXX` → «+7 951 123-45-67»), `restoreTarget`. Тесты — 23 новых в `tests/unit/`
(токен, next, пароль/email, телефон, адаптер клиента, коды ошибок, уведомления), всего 222;
`tsc` и lint чистые. Договор — `documentations/integrations/account.md`.

## See Also

- [cart-checkout-live-api](cart-checkout-live-api.md) — корзина и оформление; с Bearer — корзина аккаунта
- [api-contract](api-contract.md) — подписи и значения от бэка; словарь уведомлений — временный долг
- [project-architecture](project-architecture.md) — карта проекта и состояние подключения API
- [frontend-architecture-rules](frontend-architecture-rules.md) — правила слоёв и состояния
