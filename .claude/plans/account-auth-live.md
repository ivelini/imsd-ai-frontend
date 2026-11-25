# Личный кабинет на живом API: регистрация, вход, восстановление пароля, профиль

- **Статус:** согласован
- **Дата:** 2026-11-24
- **Согласовано:** 2026-11-24
- **Источники:** `../backend/documentations/scramble/public-api.json` (сверено 24.11.2026);
  `../backend/documentations/api-maps/account-frontend.md` (24.11.2026); макеты `.template/user/*`;
  `CLAUDE.md`; `.claude/rules/frontend-architecture.md`, `ui-porting.md`, `api-contract.md`; ADR 0001–0012.

## 1. Решения, согласованные в обсуждении

| Вопрос | Ответ | Следствие в плане |
|---|---|---|
| Блок «Уведомления» в профиле | **Включить со словарём** (пользователь, 24.11) | Карточка в профиле; русские подписи событий — временный словарь `NOTIFICATION_EVENT_LABELS` в `features/account/lib/notifications.ts` с пометкой «долг бэка»; ТЗ бэку |
| Поле E-mail в регистрации | **Добавить необязательным** (пользователь, 24.11) | Поле в `RegisterForm`; `email: string \| null` в теле регистрации; правка макета `register.html` |
| Вход по email | Дефолт, не подтверждён: API принимает **только телефон** | Подпись «Телефон или E-mail» → «Телефон» в `LoginForm` и макете `login.html` |
| Регистрация | Дефолт, не подтверждён: **одна страница**, блок кода раскрывается после запроса | Пароль не покидает страницу; первая кнопка «Зарегистрироваться» отправляет код, вторая (с кодом) завершает регистрацию |
| «Запомнить меня» | Дефолт, не подтверждён: галочка → `localStorage`, без галочки → `sessionStorage` | `shared/lib/authToken.ts`; чтение — session → local |
| Ссылка сброса из письма | Дефолт, не подтверждён: бэк формирует `/reset-password?token&email` — этот роут и обслуживаем, бэк не меняем | Новый роут `src/app/reset-password/page.tsx` |
| `/account` | Дефолт, не подтверждён: серверный редирект на `/account/profile` | Страница-приветствие удаляется |
| Куда после входа/регистрации | Дефолт, не подтверждён: `?next=` (только внутренний путь), иначе `/account/profile` | `safeNextPath`; guard профиля передаёт `next` |
| Куда после выхода | Дефолт, не подтверждён: на главную `/` | Кнопка «Выйти» в меню ЛК |
| «Действует 15 минут» в подсказке кода | Дефолт, не подтверждён: **не выводим** — TTL в ответах auth-API нет | Правка макета `new-password.html` (строка удаляется) |

## 2. Цель и ожидаемый результат

Заменить мок-сессию (`localStorage.session`, `loginMock`) живой механикой аккаунта:

- регистрация по SMS-коду, вход/выход, восстановление пароля по SMS и по ссылке из письма;
- сессия — Sanctum Bearer-токен; все запросы ЛК с `Authorization: Bearer`; 401 → сброс токена и вход;
- гостевая корзина сливается при входе/регистрации (`X-Device-Id`), дальше корзина и оформление
  работают с токеном — заказы попадают в ЛК;
- профиль: ФИО и email, смена телефона с SMS-кодом, настройки уведомлений.

Результат: `/auth/login`, `/auth/register`, `/auth/restore-password`, `/auth/new-password`,
`/reset-password`, `/account/profile` — на живом API; типа `Session` больше нет, вместо него `Client`;
счётчик корзины и шапка обновляются после входа/выхода.

Разделы `orders/bookings/addresses/garage/favorites` остаются заглушками — отдельные планы.

## 3. Архитектурная сверка (по слоям)

| Слой | Что меняем |
|---|---|
| Роутинг `src/app/` | Новые: `auth/restore-password`, `auth/new-password`, `reset-password`, `account/bookings` (заглушка для меню). Переписать: `auth/login`, `auth/register`, `account/profile`, `account/page` (редирект) |
| Домен `features/auth/` | Формы входа/регистрации/восстановления, мутации, чистые правила (`validation`, `restoreTarget`), типы `Client` |
| Домен `features/account/` | Меню ЛК, профиль (личные данные, телефон, уведомления), мутации, адаптер и словарь уведомлений |
| Ядро `shared/` | `lib/authToken.ts`, `lib/safeNext.ts`, `lib/validation.ts`, `lib/phone.ts`, `api/domainError.ts`, `api/authErrors.ts`, `api/account.ts`, `ui/CodeResend.tsx`; правки `api/auth.ts`, `api/http.ts`, `api/cart.ts`, `api/checkout.ts`, `api/queryKeys.ts` |
| Мок-слой `src/data/` | Мок-сессия удаляется (`loginMock`/`registerMock`/`logoutMock`); `src/data/*` не трогаем |
| Состояние | `["auth","session"]` = `Client \| null` (React Query); токен — `localStorage`/`sessionStorage` ключ `auth-token`; телефон/токен/email/next — в URL; Zustand не используется |
| Server/client | Страницы и `Breadcrumbs` — серверные; формы, меню ЛК, профиль, шапка — клиентские острова. `searchParams` читается на сервере как `Promise` (как в каталоге) |
| Границы доменов | Компоненты между доменами не импортируются; `features/account` использует `useSession` из `features/auth` — так уже устроен текущий `AccountPage`; альтернатива (перенос хука в shared) отклонена: React Query-хуки живут в доменах |
| API-контракт | Тексты отказов — русские `message` бэка; фронт различает отказы по машинному `code`, а не по тексту. Словарь подписей уведомлений — признанный долг бэка (ТЗ), временно на фронте |
| Вёрстка | Разметка 1-в-1 из `.template/user/*`, BEM-классы, без Tailwind; стили — в конце `src/app/style.css` с датой |
| Тестируемость | Все правила — чистыми функциями: токен, next, пароль/email, phone-формат, коды ошибок, адаптер уведомлений, адаптер клиента |
| Переиспользуем | `OtpCodeInput`, `resendRemaining`/`formatCountdown`, `Alert`, `Breadcrumbs`, `Placeholder`, `queryKeys`, `fetchJson`/`unwrapData`, `browserDeviceId`, `ClientLayout` |
| Паттерн | Не вводится. Гейт для общей функции разбора отказа: «вторая копия — разбор доменного отказа по машинному коду: было `checkout.*` в checkout, становится `checkout.*` + `auth.*`; изолирует правку формы тела отказа» |

**Расхождения с правилами (названы явно):**

1. **RHF/Zod не ставим** (`frontend-architecture.md` п. 11 говорит «установить при появлении первых
   форм, отправляющих данные на backend»). Живые формы checkout/booking уже сделаны на `useState`
   с чистыми валидаторами; auth-формы повторяют этот стиль. Причина: не тянуть 3 зависимости и не
   смешивать два подхода к формам. Предложение: при согласовании обновить п. 11 правила под
   фактическую конвенцию (useState + чистые валидаторы в `shared/lib`).
2. **Блок CSS `.account-*` переносим целиком** (включая стили карточек заказов/записей, которые ещё
   не портированы) — `ui-porting.md` п. 9. Причина: это один namespace, а media-запросы перемешивают
   селекторы профиля и деталей; нарезка даст расхождение. Стили деталей подключит следующий план.
3. **Словарь уведомлений на фронте** — `api-contract.md` п. 2 требует подписи от бэка. Пользователь
   разрешил временный словарь; пишем ТЗ бэку, словарь изолирован в одном файле.

## 4. Задачи

Порядок реализации: тест → красный прогон → реализация → зелёный (coder-mode-fe). Шаги — отдельные
коммиты по указанию пользователя.

### Шаг 1. Транспорт, токен и API-слой

**Файлы:** `shared/lib/authToken.ts`, `shared/lib/safeNext.ts`, `shared/lib/validation.ts`,
`shared/lib/phone.ts`, `shared/api/domainError.ts`, `shared/api/authErrors.ts`,
`shared/api/account.ts`, `shared/api/http.ts`, `shared/api/auth.ts` (переписать),
`shared/api/data.ts`, `shared/api/queryKeys.ts`, `features/auth/types/index.ts` (переписать),
`features/checkout/lib/errors.ts` (рефакторинг на общий маппер).

**Контракт шага:**

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| Хранение токена | `shared/lib/authToken.ts::readAuthToken` | `{session, local}` → `string \| null` |
| Запись токена | `shared/lib/authToken.ts::saveAuthToken` | `(storages, token, remember)` → `void` (в выбранное хранилище, из другого удалить) |
| Очистка | `shared/lib/authToken.ts::clearAuthToken` | `storages` → `void` |
| Токен в запросах | `shared/api/http.ts::authHeaders` | `—` → `{}` / `{Authorization: Bearer …}` (на сервере `{}`) |
| Разбор отказа | `shared/api/domainError.ts::mapDomainError` | `(ApiErrorResponse, Record<code, state>)` → `{state, message, retryAfter?}` |
| Коды аккаунта | `shared/api/authErrors.ts::mapAuthError` | `ApiErrorResponse` → `AuthErrorResult`; 429 без `code` → `throttle` с русским текстом |
| Вход | `shared/api/auth.ts::login` | `{phone, password}` → `{token, client}`; шлёт `X-Device-Id` |
| Код регистрации | `shared/api/auth.ts::requestRegisterCode` | `phone` → `{retryAfter}` |
| Регистрация | `shared/api/auth.ts::register` | `RegisterInput` → `{token, client}`; шлёт `X-Device-Id` |
| Выход | `shared/api/auth.ts::logout` | `—` → `void` (Bearer) |
| Забыли пароль | `shared/api/auth.ts::forgotPasswordSms` / `forgotPasswordEmail` | `phone` / `email` → `{retryAfter}` / `void` |
| Сброс пароля | `shared/api/auth.ts::resetPasswordSms` / `resetPasswordEmail` | объект ввода → `void` |
| Сессия | `shared/api/account.ts::getSession` | `—` → `Client \| null`; нет токена → null; 401 → очистить токен → null |
| Профиль | `shared/api/account.ts::getProfile` / `updateProfile` | `—` / `ProfileInput` → `Client` |
| Телефон | `shared/api/account.ts::requestProfilePhoneCode` / `changeProfilePhone` | `phone` / `{phone, code}` → `{retryAfter}` / `Client` |
| Уведомления | `shared/api/account.ts::getNotificationSettings` / `saveNotificationSettings` | `—` / `NotificationSetting[]` → `NotificationSetting[]` |
| Адаптер клиента | `shared/api/auth.ts::toClient` | `ClientDto` → `Client` (`full_name` → `fullName`) |
| Проверка next | `shared/lib/safeNext.ts::safeNextPath` | `string \| null \| undefined` → внутренний путь или `/account/profile` |
| Пароль | `shared/lib/validation.ts::passwordError` | `(password, confirmation)` → `string \| null` |
| Email | `shared/lib/validation.ts::emailError` | `email` → `string \| null` (пустой — ок) |
| Форма регистрации | `shared/lib/validation.ts::validateRegister` | `RegisterFields` → `Partial<Record<Field, string>>` |
| Профиль | `shared/lib/validation.ts::validateProfile` | `ProfileFields` → `Partial<Record<Field, string>>` |
| Телефон для показа | `shared/lib/phone.ts::formatPhone` | `string` → `+7 951 123-45-67` или исходная строка |
| Цель восстановления | `features/auth/lib/restoreTarget.ts::restoreTarget` | `string` → `"email" \| "phone"` (есть `@` → email) |

**Типы** (`features/auth/types/index.ts`): `Client {id, name, surname, patronymic, fullName, phone, email}`,
`ClientDto`, `ClientLogin {token, client}`, `LoginInput`, `RegisterInput`, `ResetSmsInput`, `ResetEmailInput`.
`Session` удаляется; `Session`-импорты правит шаг 2.

**Запросы и заголовки:** `Content-Type: application/json`, `Accept: application/json`;
`Authorization: Bearer` — все `/account/*` и `/auth/logout`; `X-Device-Id` — только login/register
(слияние гостевой корзины). Тела/ответы — по `account-frontend.md` и Scramble.

**Рефакторинг checkout:** `mapCheckoutError` становится обёрткой над `mapDomainError`; поведение и
тест `checkoutErrorMapping.test.ts` не меняются.

**Проверки шага:** новые тесты (см. § 8, 1–5), существующие тесты — зелёные, `tsc --noEmit`.

### Шаг 2. Аутентификация: страницы, формы, мутации

**Файлы (новые):** `features/auth/api/useLogin.ts`, `useRegister.ts`, `useIssueRegisterCode.ts`,
`useLogout.ts`, `useForgotPasswordSms.ts`, `useForgotPasswordEmail.ts`, `useResetPasswordSms.ts`,
`useResetPasswordEmail.ts`, `features/auth/components/LoginForm.tsx`, `RegisterForm.tsx`,
`RestorePasswordForm.tsx`, `NewPasswordForm.tsx`, `shared/ui/CodeResend.tsx`;
`src/app/auth/restore-password/page.tsx`, `src/app/auth/new-password/page.tsx`,
`src/app/reset-password/page.tsx`.
**Переписать:** `src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`,
`features/auth/api/useSession.ts` (queryFn — `getSession`).
**Удалить:** `features/auth/components/AuthForm.tsx`, `useAuthMutations.ts`, `LogoutButton.tsx`.

**Контракт шага:**

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| Вход | `useLogin.ts::useLogin` | `{phone, password, remember}` → `Client`; сохранить токен, `setQueryData(session)`, инвалидировать `["cart"]` |
| Код регистрации | `useIssueRegisterCode.ts` | `phone` → `{retryAfter}` |
| Регистрация | `useRegister.ts` | `RegisterInput` → `Client`; сохранить токен в `localStorage`, `setQueryData(session)`, инвалидировать `["cart"]` |
| Выход | `useLogout.ts` | `—` → `void`; POST logout, затем всегда очистить токен, `setQueryData(session, null)`, `removeQueries(["cart"])` |
| Забыли пароль | `useForgotPasswordSms/Email.ts` | `phone`/`email` → `{retryAfter}`/`void` |
| Сброс | `useResetPasswordSms/Email.ts` | объект ввода → `void`; очистить токен и сессию (бэк удаляет все токены) |
| Вход-форма | `LoginForm({ next })` | телефон, пароль, «Запомнить меня»; ссылки «Забыли пароль?» → `/auth/restore-password`, «Зарегистрируйтесь» с `next` |
| Регистрация-форма | `RegisterForm({ next })` | имя*, телефон*, e-mail (необяз.), пароль* ≥ 8, повтор*, согласие*; после запроса кода — OTP 4 цифры + повтор с таймером |
| Восстановление | `RestorePasswordForm` | «Телефон или E-mail»: `@` → forgot/email (сообщение бэка), иначе forgot/sms → `/auth/new-password?phone=…` |
| Новый пароль | `NewPasswordForm({ mode, phone?, email?, token? })` | sms: OTP + пароль ×2 + повтор кода; email: пароль ×2; успех → «Пароль изменён» + «Войти» |
| Повтор кода | `shared/ui/CodeResend.tsx` | `{remaining, pending, onResend, label?}` → таймер + кнопка |

**Поведение:**

- **Вход:** ошибки `auth.credentials_invalid`, `auth.phone_invalid`, throttling 429 — `Alert` с текстом
  бэка; успех → `router.replace(next)`.
- **Регистрация:** первая отправка валидирует поля и шлёт `/auth/register/code`; при успехе — блок
  кода, подсказка «Код отправлен на номер …`, таймер; смена телефона сбрасывает блок кода; вторая
  отправка шлёт `/auth/register`; коды `auth.code_*` очищают OTP, `auth.phone_taken` — ссылка «Войти»,
  `auth.email_taken` — текст бэка. Согласие обязательное (клиентская проверка).
- **Восстановление:** пустое поле — клиентская ошибка; `auth.phone_invalid`, кулдаун — `Alert`.
- **Новый пароль:** `phone` отсутствует в URL → серверный редирект на `/auth/restore-password`.
  Ошибки `auth.code_*` очищают OTP, `auth.reset_token_invalid` — «Ссылка/код недействителен» + ссылка
  на восстановление. Пароль — ≥ 8, подтверждение.
- **Reset по email:** `token`/`email` отсутствуют → состояние «Ссылка недействительна» + ссылка на
  восстановление (не редирект — ссылка могла обрезаться).
- **Все формы:** `<form onSubmit>`, `autoComplete` (`tel`, `current-password`, `new-password`), кнопки
  блокируются на время запроса.

**Проверки шага:** `tsc --noEmit`, lint, существующие тесты (DOM-тестов формы нет — RTL не установлена).

### Шаг 3. Токен в корзине и оформлении

**Файлы:** `shared/api/cart.ts`, `shared/api/checkout.ts`.

- `cartHeaders()`/`jsonHeaders()` в корзине добавляют `authHeaders()`; `X-Device-Id` остаётся
  (бэк игнорирует его при токене).
- `issueCheckoutCode` и `confirmCheckout` шлют `authHeaders()` — с токеном заказ привязывается к
  аккаунту (`CheckoutController` резолвит корзину по пользователю).
- После входа/регистрации корзина инвалидируется (шаг 2), после выхода — удаляется из кеша.

**Проверки шага:** `tsc`, lint; сценарий «гостевая корзина → вход → позиция на месте» — визуальная
проверка § 11.

### Шаг 4. Профиль

**Файлы (новые):** `features/account/types/index.ts`, `features/account/lib/notifications.ts`,
`features/account/api/useUpdateProfile.ts`, `useRequestPhoneCode.ts`, `useChangePhone.ts`,
`useNotificationSettings.ts`, `useSaveNotificationSettings.ts`,
`features/account/components/AccountMenu.tsx`, `ProfileView.tsx`, `ProfileDataForm.tsx`,
`ProfilePhoneForm.tsx`, `NotificationsForm.tsx`, `src/app/account/bookings/page.tsx` (заглушка).
**Переписать:** `src/app/account/profile/page.tsx`, `src/app/account/page.tsx` (редирект).
**Удалить:** `features/account/components/AccountPage.tsx`.

**Контракт шага:**

| Шаг | Файл::функция | Вход → Выход |
|---|---|---|
| Меню ЛК | `AccountMenu({ active })` | `"profile" \| "orders" \| "bookings"` → имя (`fullName`), телефон, ссылки, «Выйти» |
| Профиль-страница | `ProfileView` | `—` → сессия; нет сессии → `/auth/login?next=/account/profile`; загрузка → пусто; сеть → текст + «Повторить» |
| Личные данные | `ProfileDataForm` | `Client` → PATCH; успех → `setQueryData(session, client)` + «Сохранено» |
| Телефон | `ProfilePhoneForm` | новый номер → «Получить код» (таймер) → код → PATCH; успех — сессия обновлена, поля очищены |
| Уведомления | `NotificationsForm` | 6 событий × SMS/E-mail; «Сохранить настройки» → PUT полной матрицы (12 строк) |
| Адаптер | `features/account/lib/notifications.ts::groupNotificationSettings` | `NotificationSetting[]` → группы событий; отсутствующая строка — включена |
| Тело PUT | `features/account/lib/notifications.ts::buildNotificationPayload` | группы → 12 строк `{event, channel, enabled}` |
| Подписи | `NOTIFICATION_EVENT_LABELS` | 6 кодов → русские подписи из макета (долг бэка) |

**Поведение:**

- Меню: 1023+ — вертикально, 640–1023 — вкладки, ≤ 639 — вертикально (CSS из макета); активный пункт —
  `account-menu-link--active`, `aria-current="page"`.
- Ошибки профиля: `auth.email_taken` — текст бэка; телефон — `auth.phone_taken`, `auth.code_*`
  (очистка OTP), кулдаун с остатком; 401 в любой мутации → очистить токен, сессия null → редирект.
- После успеха — короткая строка «Сохранено» (класс `account-saved`, стиль в конце `style.css`).
- «Уведомления»: порядок событий фиксированный (как в макете), сохранение — все 12 переключателей.

**Проверки шага:** тесты § 8 (8), `tsc`, lint.

### Шаг 5. Стили и макеты

**Файлы:** `src/app/style.css`, `.template/user/login.html`, `.template/user/register.html`,
`.template/user/new-password.html`, `.template/user/account/profile.html`.

- В конец `src/app/style.css` — с пометкой `/* ===== Личный кабинет и auth OTP (24.11.2026) ===== */`:
  фикс `.auth_field .otp-inputs` / `.auth_field input.otp-digit` (из макета, строки 4542–4550) и блок
  `.account-*` целиком (из `.template/assets/css/style.css`, блок «Личный кабинет (user/account/*) —
  24.11.2026»); новый класс `.account-saved`.
- Макеты приводятся к живому API: `login.html` — «Телефон» вместо «Телефон или E-mail»;
  `register.html` — телефон, поле e-mail (необяз.), «Минимум 8 символов», блок кода из SMS;
  `new-password.html` — кнопка повторной отправки с таймером, строка «Действует 15 минут» удаляется;
  `profile.html` — кнопка «Получить код» в карточке телефона.

### Шаг 6. Документация

**Файлы:** `CLAUDE.md`, `documentations/integrations/account.md`,
`documentations/tz/notification-labels-backend.md`.

- `CLAUDE.md`: схема роутов (`/auth/restore-password`, `/auth/new-password`, `/reset-password`,
  `/account/profile`, `/account` → редирект); раздел данных — auth/профиль живые, мок-сессия удалена;
  строка про токен и слияние корзины.
- `documentations/integrations/account.md`: контракты auth/profile/phone/notifications, заголовки
  (Bearer, X-Device-Id), 401-политика, коды ошибок, слияние корзины, зависимость от `FRONTEND_URL`
  бэка для ссылки сброса, долг подписей уведомлений.
- `documentations/tz/notification-labels-backend.md`: отдавать русские подписи событий уведомлений
  (`event_label` или пары `{value,label}`), чтобы снять словарь с фронта.
- При закрытии плана — **предложить ADR** «Сессия клиента: Bearer-токен в браузере, хранение и
  401-политика» (запись — по решению пользователя).
- Wiki — вопрос по правилу `wiki-sync.md` в конце задачи.

## 5. Новые сущности, переиспользование, «не делаем»

**Новые (путь → зачем):**

- `shared/lib/authToken.ts` — единственное место хранения и чтения Bearer-токена.
- `shared/lib/safeNext.ts` — защита от открытого редиректа после входа.
- `shared/lib/validation.ts` — правила пароля/email для регистрации, сброса и профиля (два потребителя).
- `shared/lib/phone.ts` — показ канона телефона `7XXXXXXXXXX` как «+7 951 123-45-67».
- `shared/api/domainError.ts` — общий разбор доменного отказа (checkout + auth, правило двух).
- `shared/api/authErrors.ts` — карта кодов `auth.*` → состояние экрана (auth + профиль).
- `shared/api/account.ts` — профиль, телефон, уведомления, сессия.
- `shared/ui/CodeResend.tsx` — таймер повторной отправки (регистрация, новый пароль, телефон).
- `features/auth/lib/restoreTarget.ts` — телефон или email в поле восстановления.
- `features/auth/{components,api}/…` — формы и мутации auth.
- `features/account/{components,api,lib,types}/…` — меню, профиль, телефон, уведомления.
- Роуты: `/auth/restore-password`, `/auth/new-password`, `/reset-password`, `/account/bookings` (заглушка).

**Переиспользуем:** `OtpCodeInput`, `resendRemaining`/`formatCountdown`, `Alert`, `Breadcrumbs`,
`Placeholder`, `queryKeys`, `fetchJson`/`unwrapData`/`ApiError`/`toErrorResponse`, `browserDeviceId`,
`useSession`, `ClientLayout`.

**Не делаем (явно):**

- страницы заказов, записей, адресов, гаража, избранного — остаются заглушками;
- смена пароля из профиля — метода в API нет (только сброс);
- подписи уведомлений с бэка — ТЗ, не бэк-правка;
- подтверждение email, refresh-токены, «выйти на всех устройствах»;
- RHF/Zod и библиотеки форм;
- серверный middleware/защита роутов — токен только в браузере;
- переделка шагов кода в checkout/booking;
- абстракция «layout ЛК» — её потребитель один (профиль), меню — компонент;
- изменение URL ссылки сброса на бэке.

## 6. Сначала минимальный вариант

**Простейший рабочий:** контролируемые формы на `useState` (как живые checkout/booking), без новых
зависимостей; сессия — обычный React Query-запрос `["auth","session"]`; токен — два хранилища через
чистый помощник; общий разбор отказов — одна функция; OTP — существующий `OtpCodeInput`.

**Отклонённый тяжёлый вариант и цена:**

- RHF + Zod: 3 зависимости, второй стиль форм рядом с checkout/booking, переписывание ради переписывания.
- Cookie-сессия и серверный middleware: бэк отдаёт только Bearer, cookie не ставит; понадобилась бы
  доработка бэка и CSRF-политика.
- Глобальный `AuthProvider`: дублирует кеш React Query, лишний слой.
- Отдельная страница шага кода при регистрации: пароль пришлось бы тащить через storage/URL — хуже
  и небезопаснее одной страницы.

## 7. STOP-условия и бюджет диффа

- **STOP:** новая зависимость; изменение бэка; роут вне списка § 5; правка UI checkout/booking сверх
  добавления `Authorization`; хранение пароля/refresh-токена; дифф шага больше бюджета ниже или ~400 строк.
- **Бюджет по шагам:** шаг 1 — ≤ 19 файлов (13 реализации + 6 тестов), шаг 2 — ≤ 22, шаг 3 — 2,
  шаг 4 — ≤ 15 (14 реализации + 1 тест), шаг 5 — 5, шаг 6 — 3. Превышение — дробим шаг, а не
  «дописываем по ходу».
- Коммиты — только по указанию пользователя (`git.md`); пуш — вручную.

## 8. Тест-лист

Тесты — Vitest, `tests/unit/*.test.ts`, окружение `node`. RTL не установлена: DOM-тесты не пишем
(потребовали бы новую зависимость — STOP).

### `tests/unit/authToken.test.ts`

**Тест 1**
1. **Поведение:** «Запомнить меня» кладёт токен в `localStorage` и убирает старый из `sessionStorage` — иначе после повторного входа читался бы чужой токен.
2. **Вход:** session=`"old"`, local=`null`; `saveAuthToken(storages, "new", true)`.
3. **Ожидание:** local=`"new"`, session=`null`.
4. **Имя:** `test_save_remember_to_local`.

**Тест 2**
1. **Поведение:** без «Запомнить меня» токен живёт только в `sessionStorage`, `localStorage` очищается.
2. **Вход:** local=`"old"`, session=`null`; `saveAuthToken(storages, "new", false)`.
3. **Ожидание:** session=`"new"`, local=`null`.
4. **Имя:** `test_save_without_remember_to_session`.

**Тест 3**
1. **Поведение:** чтение предпочитает токен вкладки (`sessionStorage`), затем `localStorage`; пусто — `null`.
2. **Вход:** session=`"s"`, local=`"l"`; затем session=`null`, local=`"l"`; затем оба пусты.
3. **Ожидание:** `"s"`; `"l"`; `null`.
4. **Имя:** `test_read_prefers_session_token`.

**Тест 4**
1. **Поведение:** очистка убирает токен из обоих хранилищ; пустой токен не записывается.
2. **Вход:** оба заполнены; `clearAuthToken`; затем `saveAuthToken(..., "", true)`.
3. **Ожидание:** оба `null`; пустая строка не попала в `localStorage`.
4. **Имя:** `test_clear_and_ignore_empty`.

### `tests/unit/safeNext.test.ts`

**Тест 1**
1. **Поведение:** внутренний путь после входа разрешён как есть.
2. **Вход:** `"/account/profile"`.
3. **Ожидание:** `"/account/profile"`.
4. **Имя:** `test_allow_internal_path`.

**Тест 2**
1. **Поведение:** протокол-относительный и абсолютный URL — открытый редирект, подменяются дефолтом.
2. **Вход:** `"//evil.com"`, `"https://evil.com"`, `"evil"`.
3. **Ожидание:** `"/account/profile"` во всех трёх случаях.
4. **Имя:** `test_reject_external_redirect`.

**Тест 3**
1. **Поведение:** отсутствие параметра даёт дефолт.
2. **Вход:** `undefined`, `null`, `""`.
3. **Ожидание:** `"/account/profile"`.
4. **Имя:** `test_default_when_missing`.

### `tests/unit/validation.test.ts`

**Тест 1**
1. **Поведение:** пароль короче 8 символов отклоняется, ровно 8 — принимается (граница `>=`).
2. **Вход:** `("1234567","1234567")`; `("12345678","12345678")`.
3. **Ожидание:** строка ошибки; `null`.
4. **Имя:** `test_password_min_length`.

**Тест 2**
1. **Поведение:** несовпадение подтверждения отклоняется.
2. **Вход:** `("12345678","12345679")`.
3. **Ожидание:** строка ошибки.
4. **Имя:** `test_password_confirmation_mismatch`.

**Тест 3**
1. **Поведение:** email необязателен; пустой — ок, заполненный проверяется форматом.
2. **Вход:** `""`; `"ivan@example.ru"`; `"abc"`.
3. **Ожидание:** `null`; `null`; строка ошибки.
4. **Имя:** `test_email_optional_and_format`.

**Тест 4**
1. **Поведение:** регистрация требует имя, телефон, пароль и согласие; заполненная форма ошибок не даёт.
2. **Вход:** пустые `name`/`phone`/`password`, `agreement=false`; затем все валидные значения.
3. **Ожидание:** ошибки по всем четырём полям; пустой объект ошибок.
4. **Имя:** `test_register_required_fields`.

### `tests/unit/phone.test.ts`

**Тест 1**
1. **Поведение:** канон `7XXXXXXXXXX` и `8XXXXXXXXXX` показывается как «+7 951 123-45-67».
2. **Вход:** `"79511234567"`; `"89511234567"`.
3. **Ожидание:** `"+7 951 123-45-67"` в обоих случаях.
4. **Имя:** `test_format_canonical_phone`.

**Тест 2**
1. **Поведение:** нераспознанная строка возвращается без изменений (не портим ввод).
2. **Вход:** `"123"`, `"abc"`, `""`.
3. **Ожидание:** те же строки.
4. **Имя:** `test_keep_unparsed_phone`.

### `tests/unit/clientAdapter.test.ts`

**Тест 1**
1. **Поведение:** DTO бэка (`snake_case`) превращается в `Client` (`fullName`), остальные поля — как есть.
2. **Вход:** `{id: 7, name: "Иван", surname: "Иванов", patronymic: "Иванович", full_name: "Иванов Иван Иванович", phone: "79511234567", email: "ivan@example.ru"}`.
3. **Ожидание:** `fullName === "Иванов Иван Иванович"`, `id === 7`, `email` сохранён.
4. **Имя:** `test_map_client_dto`.

**Тест 2**
1. **Поведение:** пустые (`null`) необязательные поля не превращаются в пустые строки.
2. **Вход:** `surname: null`, `patronymic: null`, `phone: null`, `email: null`.
3. **Ожидание:** соответствующие поля `null`.
4. **Имя:** `test_map_keeps_nulls`.

### `tests/unit/authErrors.test.ts`

**Тест 1**
1. **Поведение:** коды неверного, истёкшего и использованного кода различаются состоянием, хотя статус один.
2. **Вход:** `auth.code_invalid`, `auth.code_expired`, `auth.code_used` (422).
3. **Ожидание:** `code_invalid`, `code_expired`, `code_used`.
4. **Имя:** `test_map_code_errors`.

**Тест 2**
1. **Поведение:** кулдаун отдаёт остаток из тела 429 — таймер кнопки, не константа.
2. **Вход:** `{status: 429, body: {code: "auth.code_cooldown", retry_after: 37, message: "Код уже отправлен"}}`.
3. **Ожидание:** `state === "cooldown"`, `retryAfter === 37`.
4. **Имя:** `test_cooldown_returns_retry_after`.

**Тест 3**
1. **Поведение:** неверные учётные данные — русский текст бэка на экран.
2. **Вход:** `{status: 422, body: {code: "auth.credentials_invalid", message: "Неверный телефон или пароль"}}`.
3. **Ожидание:** `state === "credentials_invalid"`, `message === "Неверный телефон или пароль"`.
4. **Имя:** `test_credentials_invalid_message`.

**Тест 4**
1. **Поведение:** ошибка валидации приходит без кода, её `message` — технический ключ; на экран нельзя.
2. **Вход:** `{status: 422, body: {message: "validation.required", errors: {phone: ["…"]}}}`.
3. **Ожидание:** `state === "unknown"`, `message === DEFAULT_API_ERROR_MESSAGE`.
4. **Имя:** `test_validation_error_hides_backend_message`.

**Тест 5**
1. **Поведение:** 429 без машинного кода (throttle Laravel) не показывает английский «Too Many Attempts.», а даёт русский текст.
2. **Вход:** `{status: 429, body: {message: "Too Many Attempts."}}`.
3. **Ожидание:** `state === "throttle"`, `message` — русская строка (не содержит «Too Many»).
4. **Имя:** `test_throttle_without_code_ru_fallback`.

**Тест 6**
1. **Поведение:** неизвестный код сводится к `unknown` без падения.
2. **Вход:** `{status: 422, body: {code: "auth.new_code"}}`.
3. **Ожидание:** `state === "unknown"`.
4. **Имя:** `test_unknown_code`.

### `tests/unit/notificationAdapter.test.ts`

**Тест 1**
1. **Поведение:** отсутствующая строка настройки считается включённой (умолчание бэка), группировка — по событиям.
2. **Вход:** одна строка `{event:"order_created", channel:"sms", enabled:false}`.
3. **Ожидание:** 6 групп; у `order_created` `sms=false`, `email=true`; у остальных оба `true`.
4. **Имя:** `test_group_defaults_missing_true`.

**Тест 2**
1. **Поведение:** тело PUT — полная матрица 6 × 2, значения совпадают с переключателями.
2. **Вход:** группы, где у `payment_confirmed` e-mail выключен.
3. **Ожидание:** 12 строк, ровно одна пара `payment_confirmed/email` с `enabled=false`, набор пар — все события × каналы.
4. **Имя:** `test_build_payload_full_matrix`.

**Тест 3**
1. **Поведение:** у каждого события из API есть русская подпись, лишних ключей нет.
2. **Вход:** список шести кодов `order_created`, `payment_confirmed`, `status_changed`, `ready_for_pickup`, `booking_created`, `return_warranty`.
3. **Ожидание:** шесть непустых подписей, `Object.keys` совпадает с набором.
4. **Имя:** `test_event_labels_complete`.

### Существующие тесты

`tests/unit/checkoutErrorMapping.test.ts` — поведение не меняется после перевода на общий маппер;
все `npm test` — зелёные.

## 9. Схема вызовов

```
┌─ ТРИГГЕР: пользователь ──────────────────────────────────────────────┐
│  /auth/login · /auth/register · /auth/restore-password               │
│  /auth/new-password?phone · /reset-password?token&email              │
│  /account/profile                                                    │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼
┌─ СТРАНИЦА (server) ──────────────────────────────────────────────────┐
│  src/app/auth/*/page.tsx, src/app/reset-password/page.tsx            │
│  src/app/account/profile/page.tsx (Breadcrumbs + клиентский остров)  │
│  searchParams: next / phone / token+email                            │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼ клиентский остров
┌─ КОМПОНЕНТЫ ─────────────────────────────────────────────────────────┐
│  LoginForm · RegisterForm · RestorePasswordForm · NewPasswordForm    │
│  ProfileView → AccountMenu + ProfileDataForm                         │
│                + ProfilePhoneForm + NotificationsForm                │
│        │ useMutation / useQuery                                      │
│        ▼                                                             │
│  features/auth/api/*, features/account/api/* (React Query)           │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼
┌─ API-СЛОЙ ───────────────────────────────────────────────────────────┐
│  shared/api/auth.ts · shared/api/account.ts                          │
│  shared/api/http.ts: fetchJson + authHeaders (Bearer)                │
│  shared/lib/authToken.ts: localStorage / sessionStorage              │
│  shared/api/domainError.ts + authErrors.ts: code → состояние         │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼ HTTP /api/* (rewrites → бэк)
┌─ БЭК (Laravel) ──────────────────────────────────────────────────────┐
│  /auth/login · /auth/register(/code) · /auth/logout                  │
│  /auth/password/forgot|reset/{sms,email}                             │
│  /account/profile · /account/profile/phone(/code)                    │
│  /account/notification-settings                                      │
└───────────────────────────────┬──────────────────────────────────────┘
                                ▼
┌─ СОСТОЯНИЕ И РЕНДЕР ────────────────────────────────────────────────┐
│  React Query: ["auth","session"] = Client|null                       │
│               ["account","notification-settings"]                    │
│               ["cart","items",city] — инвалидация при входе/выходе   │
│  localStorage/sessionStorage: auth-token; device-id                  │
│  шапка и меню ЛК: имя/телефон; корзина: счётчик после входа          │
└──────────────────────────────────────────────────────────────────────┘
```

**Слияние корзины при входе:**

```
LoginForm → useLogin → POST /auth/login {phone,password} + X-Device-Id
   → бэк: MergeGuestCart (гостевая корзина → корзина аккаунта, гостевая удаляется)
   → {token, client} → saveAuthToken → setQueryData(["auth","session"])
   → invalidateQueries(["cart"]) → CartBadge/корзина читают уже корзину аккаунта
   (все запросы корзины и checkout дальше идут с Authorization: Bearer)
```

## 10. Прогоны

- **Красный** (тесты до файлов `src/`, 24.11.2026): `Test Files 7 failed | 40 passed (47)`,
  `Tests 2 failed | 198 passed (200)` — новые файлы не находили модули (`Cannot find package
  '@/shared/lib/validation'`, `toClient is not a function` и т.п.).
- **Зелёный** (после реализации, 24.11.2026): `Test Files 47 passed (47)`, `Tests 222 passed (222)`;
  `npx tsc --noEmit` — 0 ошибок; `npm run lint` — 0 ошибок (1 старое предупреждение
  в `src/features/catalog/components/ModelDescription.tsx`, не в изменениях).
- Квитанция: `verify: 6e79251c3e55c03ffa267388295a8ea30fb40685c411ac2a811f408ebdb2a3c9 — green`
  (sha256 `git diff HEAD`; дерево содержит и макеты прошлой сессии, и эту реализацию).

**Отклонения при реализации (на ревью):**

- `features/auth/api/sessionCache.ts` (+ `handleSessionError`) — не был в исходном списке сущностей;
  причина: выход, два сброса пароля и 401 в профиле чистят одно и то же (4 потребителя, правило двух).
- `forgotPasswordEmail` / `resetPasswordSms` / `resetPasswordEmail` возвращают `message` бэка —
  экран успеха показывает серверный текст (по `api-contract.md`), а не строку фронта.
- `LogoutButton` удалён вместе с `AccountPage` на шаге 4, а не на шаге 2: до появления меню ЛК
  у него оставался потребитель.

## 11. Визуальная проверка

Dev через Docker (`make up`, :30034). Коды SMS в dev-драйвере — в логе бэка
`../backend/storage/logs/laravel.log`; письмо сброса — там же (mailer в dev — log). Хост в ссылке
письма задаёт `FRONTEND_URL` бэка (дефолт `http://localhost`) — для проверки на :30034 заменить
хост в ссылке вручную или выставить `FRONTEND_URL`.

Сценарии:

1. Регистрация: новый телефон → код из лога → вход; проверить поле e-mail и согласие.
2. Вход: верный/неверный пароль; «Запомнить меня» — токен в `localStorage`, без галочки — в `sessionStorage`.
3. Сброс по SMS: restore → new-password → вход новым паролем.
4. Сброс по email: ссылка из лога → `/reset-password?token&email` → новый пароль.
5. Профиль: правка ФИО/e-mail; смена телефона по коду; уведомления — сохранить и перезагрузить.
6. Корзина: товар гостем → вход → позиция на месте; выход → корзина пуста.
7. Шапка: после входа — имя; после выхода — «Войти».
8. Разрешения 390 / 768 / 1024 / 1366 / 1920: переполнений нет, меню ЛК перестраивается.

Дата, что смотрел пользователь, вердикт — сюда после проверки.

## 12. Открытые вопросы

Нет.
