# Личный кабинет на живом API: регистрация, вход, сброс пароля, профиль

> Source: план `.claude/plans/account-auth-live.md` (согласован пользователем 2026-11-24) и реализация в `template/src`; контракт бэка — `backend/documentations/api-maps/account-frontend.md` и Scramble `public-api.json`, сверено 2026-11-24
> Collected: 2026-11-24
> Published: 2026-11-24

## Задача

Заменить мок-сессию (`localStorage.session`, `loginMock`/`registerMock`/`logoutMock`) живым API
домена Account: регистрация по SMS-коду, вход/выход, восстановление пароля по SMS и по ссылке
из письма, профиль (ФИО/e-mail, телефон, уведомления). Сессия — Sanctum Bearer-токен; все
запросы ЛК с `Authorization`; 401 сбрасывает токен.

## Решения пользователя

- Блок «Уведомления» в профиле включён; API отдаёт события машинными кодами без русских подписей,
  поэтому фронт держит временный словарь `NOTIFICATION_EVENT_LABELS` и ставит ТЗ бэку.
- В регистрацию добавлено необязательное поле E-mail (для восстановления по ссылке и уведомлений).
- Дефолты (не подтверждались отдельно): вход только по телефону (API не принимает e-mail);
  регистрация одной страницей с раскрытием блока кода после запроса; «Запомнить меня» →
  `localStorage`, без галочки → `sessionStorage`; бэк формирует ссылку сброса
  `/reset-password?token&email` — фронт обслуживает этот роут; `/account` → редирект на
  `/account/profile`; после выхода — на главную.

## Контракт

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| POST | `/api/auth/register/code` | `{phone}` | 200 `{data:{retry_after}}`; 429 `auth.code_cooldown`; 422 `auth.phone_invalid` |
| POST | `/api/auth/register` | `{phone, name, email?, password, password_confirmation, code}` | 201 `{data:{token, client}}`; 422 `auth.code_*`, `auth.phone_taken`, `auth.email_taken` |
| POST | `/api/auth/login` | `{phone, password}` | `{data:{token, client}}`; 422 `auth.credentials_invalid` |
| POST | `/api/auth/logout` | — (Bearer) | `{message}` — удаляет текущий токен |
| POST | `/api/auth/password/forgot/sms` | `{phone}` | `{data:{retry_after}}` |
| POST | `/api/auth/password/reset/sms` | `{phone, code, password, password_confirmation}` | `{message}`; 422 `auth.code_*`, `auth.reset_token_invalid` |
| POST | `/api/auth/password/forgot/email` | `{email}` | `{message}` (одинаковый для любой карточки) |
| POST | `/api/auth/password/reset/email` | `{email, token, password, password_confirmation}` | `{message}`; 422 `auth.reset_token_invalid` |
| GET | `/api/account/profile` | — (Bearer) | `{data: client}`; 401 |
| PATCH | `/api/account/profile` | `{name?, surname?, patronymic?, email?}` | `{data: client}`; 422 `auth.email_taken` |
| POST | `/api/account/profile/phone/code` | `{phone}` (новый) | `{data:{retry_after}}`; 429 `auth.code_cooldown` |
| PATCH | `/api/account/profile/phone` | `{phone, code}` | `{data: client}`; 422 `auth.code_*`, `auth.phone_taken` |
| GET/PUT | `/api/account/notification-settings` | PUT `{settings:[{event, channel, enabled}]}` | `{data:[{event, channel, enabled}]}` |

`client`: `{id, name, surname, patronymic, full_name, phone, email}`; фронт — `Client` с `fullName`.
Пароль ≥ 8, код — 4 цифры. Заголовки: JSON + `Authorization: Bearer` на `/account/*` и logout;
`X-Device-Id` — только на login/register для слияния гостевой корзины.

## Сессия

- Токен — ключ `auth-token`: `localStorage` при «Запомнить меня», иначе `sessionStorage`;
  чтение — session → local; очистка — оба (`shared/lib/authToken.ts`).
- Сессия экрана — React Query `["auth","session"]`: `GET /account/profile`; нет токена — null;
  401 — токен очищается, сессия null (`getSession` в `shared/api/account.ts`). Сессию читают
  шапка (`LoginBadge`), меню и профиль ЛК.
- Сброс сессии (выход, оба сценария сброса пароля — бэк удаляет все токены, 401 в мутациях) —
  `features/auth/api/sessionCache.ts::dropSession`: токен, кэш сессии, корзины и аккаунта.

## Регистрация

Одна страница: имя*, телефон*, e-mail (необяз.), пароль* ≥ 8, повтор*, согласие*. Первая
отправка валидирует поля и просит `/auth/register/code`; при успехе раскрывается блок кода
(4 ячейки, таймер повторной отправки, «Код отправлен на номер …»); смена телефона сбрасывает
блок. Вторая отправка шлёт `/auth/register`; 201 — токен и клиент, кэш сессии, инвалидация
корзины, редирект на `?next=` или `/account/profile`. Ошибки кода очищают цифры; `phone_taken` —
ссылка «Войдите».

## Вход и выход

Вход — телефон + пароль + «Запомнить меня»; токен сохраняется в выбранное хранилище, сессия —
в кэш, корзина инвалидируется (после входа запросы корзины и checkout идут с Bearer). Выход —
`POST /auth/logout`; локально токен чистится в любом случае, затем главная.

## Восстановление пароля

- SMS: `/auth/restore-password` — одно поле «Телефон или E-mail»; при «@» — forgot/email,
  иначе forgot/sms → `/auth/new-password?phone=…` (без телефона — редирект на restore).
  Новый пароль: OTP + пароль ×2 + повтор кода; успех — сообщение бэка («Пароль изменён.») и
  ссылка «Войти».
- E-mail: письмо ведёт на `/reset-password?token&email`; без параметров — «ссылка недействительна»
  и ссылка на запрос новой. Пароль ×2 → reset/email.
- Хост ссылки задаёт `FRONTEND_URL` бэка (дефолт `http://localhost`).

## Профиль

`/account/profile`: меню ЛК (имя `full_name`, телефон, разделы, выход), карточки:
- личные данные — имя*, фамилия, отчество, e-mail; PATCH; успех — «Сохранено»;
- телефон — текущий номер, новый номер, «Получить код» (таймер) → код → подтверждение;
  успех обновляет сессию и очищает поля;
- уведомления — 6 событий × SMS/E-mail, PUT полной матрицы; отсутствующая строка — включена.
Русские подписи событий — `NOTIFICATION_EVENT_LABELS` (долг бэка, ТЗ
`documentations/tz/notification-labels-backend.md`), адаптер группирует строки и собирает тело PUT.
Профиль без сессии уводит на `/auth/login?next=/account/profile`.

## Корзина и оформление с токеном

Маршруты `/api/cart*` и `/api/checkout*` — `OptionalSanctumAuth`: с Bearer бэк берёт корзину
аккаунта, без — гостевую по `X-Device-Id`; вход/регистрация с `X-Device-Id` сливают гостевую
корзину и удаляют её. Поэтому фронт шлёт `Authorization` во всех запросах корзины и checkout,
иначе после входа видна пустая гостевая корзина и заказы не попадают в ЛК.

## Отказы

Доменный отказ: `{message, code, retry_after?}`. Общий разбор — `shared/api/domainError.ts`
(вынесен из checkout по правилу двух), карта `auth.*` — `shared/api/authErrors.ts`; 429 без
кода (throttle Laravel) — русский текст «Слишком много попыток…»; ошибки валидации с `errors`
без кода — общий текст. Неверный/истёкший/использованный код очищают OTP; кулдаун даёт остаток
в `retry_after`.

## Файлы

- API: `shared/api/auth.ts`, `shared/api/account.ts`, `shared/api/authErrors.ts`,
  `shared/api/domainError.ts`, `shared/api/http.ts` (`authHeaders`);
- сессия: `shared/lib/authToken.ts`, `features/auth/api/sessionCache.ts`, `useSession`, мутации;
- формы: `features/auth/components/{Login,Register,RestorePassword,NewPassword}Form.tsx`,
  `shared/ui/CodeResend.tsx`; страницы `src/app/auth/{login,register,restore-password,new-password}`,
  `src/app/reset-password`;
- профиль: `features/account/components/{AccountMenu,ProfileView,ProfileDataForm,ProfilePhoneForm,NotificationsForm}.tsx`,
  `features/account/lib/notifications.ts`, типы и мутации;
- чистые помощники: `shared/lib/{authToken,safeNext,validation,phone}.ts`, `restoreTarget.ts`.

## Проверки

- Красный: 7 новых тестовых файлов падали на отсутствующих модулях (`Cannot find package …`).
- Зелёный: 47 файлов / 222 теста; `npx tsc --noEmit` — 0 ошибок; lint — 0 ошибок
  (1 прежнее предупреждение `ModelDescription.tsx`).
- Смоук: `/auth/login`, `/auth/restore-password`, `/account/profile`, `/reset-password` — HTTP 200
  на dev-сервере :30034. Визуальная проверка сценариев — за пользователем.

## Отклонения и остаток

- Добавлен `features/auth/api/sessionCache.ts` (не был в списке сущностей плана): сброс сессии
  нужен четырём потребителям.
- `forgotPasswordEmail`/`resetPassword*` возвращают `message` бэка — экран успеха показывает
  серверный текст.
- Осталось: визуальная проверка пользователя (сценарии §11 плана), ADR «Сессия клиента:
  Bearer-токен в браузере и 401-политика» — предложить при закрытии плана.
