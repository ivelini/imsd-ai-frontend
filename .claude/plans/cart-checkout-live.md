# Корзина и оформление заказа на живом API

**Статус:** Accepted — согласован
**Согласовано:** 2026-11-24
**Дата:** 2026-11-24
**Основа:** `../backend/documentations/api-maps/checkout-frontend.md` (контракт сверен с кодом бэка
2026-11-24), роуты и поля проверены по `../backend/routes/api.php`, контроллерам, ресурсам и
`public-api.json`. Моки `src/data/` контрактом не считаются.
**Исполнитель:** `/coder-mode-fe`

## 1. Решения, согласованные в обсуждении

| Вопрос | Ответ | Источник | Следствие в плане |
|---|---|---|---|
| Что делать со страницей `/order-status` после перехода на бэк? | Оставить как подсказку: без мок-поиска, объясняет, что статус виден на странице заказа сразу после оформления, поиск по номеру — с ЛК | Ответ пользователя 2026-11-24 | Шаг 2: страница становится серверной подсказкой; `useOrderByNumber` и мок-поиск удаляются; пункт «Статус заказа» в шапке остаётся |
| Объём: только корзина или корзина + оформление | Корзина и оформление вместе | Мок-заказ `createOrder` читает `cartStore` в памяти; после перевода корзины на бэк оформление остаётся сломанным, поэтому одна работа | Шаг 2 атомарен: контракты корзины и оформления меняются одним коммитом |
| Авторизация | Гость: только `X-Device-Id`; `Authorization` не отправляем | Auth на фронте — мок (`shared/api/auth.ts`); бэк принимает гостя | `X-Device-Id` из localStorage на всех запросах корзины/оформления |
| Картинка и «Код товара» в корзине | Единая заглушка `/assets/img/wheel-product.png`, строки «Код товара» нет | В ответе корзины нет `image`/артикула (док, «Ограничения»); заглушка уже общая (`shared/lib/productImage`) | `CartItem.image` = заглушка; блок кода удалён; долг бэка записан в `documentations/integrations/cart-checkout.md` |
| Согласия | Статичная строка макета остаётся; на сервер уходят `offer_accepted=true`, `privacy_accepted=true` | Док: у бэка проверка только `true`; план бэка: текст согласия держит фронт | Чекбоксы не добавляем; строка `.order_form_method_btn_info` как в макете |
| Город курьера по умолчанию | Поле «Город*» в адресе курьера подставляет город сайта (выбранный в шапке); поле остаётся правимым | Запрос пользователя 2026-11-24 | `addressCity` до правки показывает `cityLabel`; правка пользователя перекрывает подстановку |
| Одна точка самовывоза | Если у города ровно одна точка, она выбирается автоматически; выбор показывается отметкой и уходит в `pickup_point_id` | Запрос пользователя 2026-11-24 | Выбранная точка = явный выбор из списка, иначе единственная точка города; исчезнувшая из списка точка сбрасывается |
| Подписи доставки/оплаты и статус на странице заказа | Подписи берём из справочника при оформлении и кладём в снимок; машинный `status` (`new`) ярлыком не переводим — пишем «Заказ оформлен» | `api-contract.md`: словарь на фронте — долг бэка; `OrderResource` отдаёт только код без label | Снимок заказа содержит `deliveryLabel`, `paymentLabel`, адрес точки; статус не показываем |
| Черновик заказа | `sessionStorage`, ключ идемпотентности в нём же | Док, «Идемпотентность и черновик» | ФИО/телефон не в URL и не в localStorage |
| Дефолт, не подтверждён: форма на `useState` вместо RHF/Zod | Оставляем `useState` + нативную валидацию; прецедент — форма записи на шиномонтаж | `frontend-architecture.md` п.16 против booking details step | Отступление названо; RHF/Zod — отдельное решение, если понадобится |

## 2. Цель и ожидаемый результат

Корзина показывает серверное состояние гостя: позиции, цены города, итог, доступность; добавление,
изменение количества и удаление идут через `POST/PATCH/DELETE /api/cart`. Оформление — двухшаговое,
как запись: «Оформить заказ» → SMS-код (`POST /api/checkout/code`) → ввод кода → `POST /api/checkout`
с черновиком из `sessionStorage` и одним `Idempotency-Key`; заказ создаёт бэк и сам очищает корзину.
Страница заказа строится из снимка ответа в `sessionStorage`; `/order-status` — статичная подсказка.

**Ожидаемый результат:** моки корзины и заказов (`cartStore`, localStorage-заказы) удалены; ни один
экран корзины/оформления не читает `src/data/*` как источник товаров; `npm test`, `npx tsc --noEmit`,
`npm run lint` зелёные.

## 3. Задачи с контрактом шага

### Шаг 1 — общие помощники (поведение не меняется)

Цель: убрать будущие вторые копии до начала работы (правило двух).

| # | Файл::функция/компонент | Вход → Выход |
|---|---|---|
| 1.1 | `src/shared/lib/storageStore.ts` → `createStorageStore<T>(key)` — фабрика вынесена из `features/booking/lib/draftStore.ts` | `key` → `StorageStore<T>` |
| 1.2 | `src/features/booking/lib/draftStore.ts` → черновик и снимок через общую фабрику | — → без локальной копии |
| 1.3 | `src/shared/lib/countdown.ts` → `resendRemaining(input)`, `formatCountdown(seconds)` (перенос из `features/booking/lib/draft.ts` и `BookingCodeStep.tsx`) | `{issuedAt, retryAfter, now}` / `number` → `number` / `string` |
| 1.4 | `src/shared/lib/otp.ts` → `replaceDigit(digits, index, value)` (перенос из `BookingCodeStep.tsx`) | 3 параметра → новый массив цифр |
| 1.5 | `src/shared/ui/OtpCodeInput.tsx` → поле 4 цифр (разметка `.otp-inputs`/`.otp-digit`) | `{digits, onChange, hasError?}` → JSX |
| 1.6 | `src/shared/ui/Alert.tsx` → алерт отказа (`.alert alert--error`, `warning.svg`) | `{title, text}` → JSX |
| 1.7 | `src/features/booking/components/BookingCodeStep.tsx`, `BookingAlert.tsx` → используют общие `OtpCodeInput`, `Alert`, импорт `countdown` | — → JSX без копий |
| 1.8 | `tests/unit/bookingDraft.test.ts`, новый `tests/unit/countdown.test.ts` | перенос теста `resendRemaining`, новый тест `formatCountdown` |

### Шаг 2 — корзина и оформление на живом API (атомарно)

#### 2.1 Транспорт и типы

| # | Файл::функция | Вход → Выход |
|---|---|---|
| 2.1.1 | `src/shared/lib/deviceId.ts` → `getOrCreateDeviceId(storage, generate)` | `Storage`-подобный объект, `() => string` → `string` (1–64) |
| 2.1.2 | `src/shared/api/cart.ts` → DTO `CartDto`, `CartItemDto`; адаптер `toCartView(dto)` | `CartDto` → `CartView` |
| 2.1.3 | `src/shared/api/cart.ts` → `getCart(city)` | `string` → `Promise<CartView>` (`GET /cart?city=`) |
| 2.1.4 | `src/shared/api/cart.ts` → `addCartItem(input, city)` | `{itemableType, itemableId, quantity}`, `string` → `Promise<CartView>` (`POST /cart/items`) |
| 2.1.5 | `src/shared/api/cart.ts` → `updateCartItemQuantity(lineId, quantity, city)` | 3 параметра → `Promise<CartView>` (`PATCH`) |
| 2.1.6 | `src/shared/api/cart.ts` → `removeCartItem(lineId, city)` | `string`, `string` → `Promise<CartView>` (`DELETE ...?city=`) |
| 2.1.7 | `src/shared/api/checkout.ts` → `getCheckoutReference()`, `getDeliveryPoints(city)` | — / `string` → `Promise<CheckoutReference>` / `Promise<DeliveryPoint[]>` |
| 2.1.8 | `src/shared/api/checkout.ts` → `issueCheckoutCode(phone, key)` | `string`, `string` → `Promise<{retryAfter}>` (`POST /checkout/code`) |
| 2.1.9 | `src/shared/api/checkout.ts` → `confirmCheckout(payload, key)` | `CheckoutPayload`, `string` → `Promise<OrderDto>` (`POST /checkout`) |

Заголовки всех запросов: `Accept: application/json`, `Content-Type` при теле, `X-Device-Id`;
`Idempotency-Key` на обоих шагах оформления. Ответы разворачиваются из `{data: …}` общим
`fetchJson` (`shared/api/http.ts`).

#### 2.2 Домен корзины

| # | Файл::функция/компонент | Вход → Выход |
|---|---|---|
| 2.2.1 | `src/features/cart/types/index.ts` → `CartItem` (id строки, `itemableId`, `itemableType`, `brandName`, `price: number \| null`, `total`, `available`, `countInStock`, `image`), `CartView` | — → типы |
| 2.2.2 | `src/features/cart/lib/itemable.ts` → `toItemableType(category)`, `findCartItemByProduct(items, ref)` | `"tires"\|"wheels"` → `"tire"\|"wheel"`; массив + `{itemableType, itemableId}` → `CartItem \| undefined` |
| 2.2.3 | `src/features/cart/api/*` → `useCart`, `useCartCount`, `useAddToCart`, `useUpdateCartItem`, `useRemoveFromCart` на живых функциях; `queryKey` включает город; мутации без оптимистики — ответ сервера кладётся в кеш | — → хуки |
| 2.2.4 | `src/features/cart/api/useCartItemActions.ts` → поиск позиции по товару, добавление по `itemableType/itemableId`, удаление по id строки | `{itemableType, itemableId}`, `quantity` → UI-состояние и обработчики |
| 2.2.5 | `src/features/cart/components/CartPage.tsx`, `CartItemRow.tsx`, `CartPopup.tsx`, `CartBadge.tsx` → живые поля; нет цены города — «Цена недоступна в этом городе»; «Код товара» скрыт; наличие из `count_in_stock` | props → JSX |
| 2.2.6 | `src/features/catalog/components/BuyButton.tsx`, `src/features/product/components/AddToCartBlock.tsx` → передают `{itemableType, itemableId}`; `isInCart` — по товару | product → JSX |
| 2.2.7 | `src/shared/api/queryKeys.ts` → `cart.items(city)`, `checkout.reference`, `checkout.deliveryPoints(city)`; `checkout.order` удалён | — → ключи |

#### 2.3 Оформление

| # | Файл::функция/компонент | Вход → Выход |
|---|---|---|
| 2.3.1 | `src/features/checkout/types/index.ts` → `CheckoutReference`, `DeliveryOption`, `PaymentOption`, `DeliveryPoint`, `CheckoutDraft`, `CheckoutPayload`, `OrderDto`, `OrderSnapshot` | — → типы |
| 2.3.2 | `src/features/checkout/lib/draft.ts` → `createCheckoutDraft(form, key, city)`, `isDraftReady(draft)`, `setCodeIssued(draft, retryAfter, now)` | 3 параметра / 1 / 3 → `CheckoutDraft` / `boolean` / `CheckoutDraft` |
| 2.3.3 | `src/features/checkout/lib/draftStore.ts` → `draftStore`, `snapshotStore` через `createStorageStore` (`checkout-draft`, `checkout-order-snapshot`) | — → сторы |
| 2.3.4 | `src/features/checkout/lib/payload.ts` → `buildCheckoutPayload(draft, code)`; пустые необязательные поля адреса не отправляются | `CheckoutDraft`, `string` → `CheckoutPayload` |
| 2.3.5 | `src/features/checkout/lib/errors.ts` → `mapCheckoutError(response)` | `ApiErrorResponse` → `{state, message, retryAfter?}` |
| 2.3.6 | `src/features/checkout/lib/snapshot.ts` → `buildOrderSnapshot(order, draft, reference)` | 3 параметра → `OrderSnapshot` |
| 2.3.7 | `src/features/checkout/api/useDeliveryPoints.ts`, `useIssueCheckoutCode.ts`, `useConfirmCheckout.ts` | city / `{draft}` / `{draft, code}` → хуки |
| 2.3.8 | `src/app/checkout/page.tsx` (RSC) + `CheckoutPage.tsx` → справочник с сервера; форма: ФИО (склейка в `customer_name`), телефон, email, способы из справочника, точки выдачи города, адрес курьера `{city, street, house, apartment}` (город по умолчанию — город сайта); пустой список оплаты — кнопка скрыта; пустые точки — самовывоз недоступен; перед отправкой — непустая корзина и все позиции `available` | `{reference, benefits}` → JSX |
| 2.3.9 | Новый роут `src/app/checkout/code/page.tsx` (RSC) + `CheckoutCodeStep.tsx` → OTP, таймер повторной отправки из черновика, подтверждение, разбор отказов по коду | `{codeTtlMin}` → JSX |
| 2.3.10 | `src/features/checkout/components/OrderPage.tsx` → снимок из `sessionStorage`; id из URL не совпал или снимка нет — «Заказ не найден» | `{id}` → JSX |
| 2.3.11 | `src/features/checkout/components/OrderStatusPage.tsx` → удалён; `src/app/order-status/page.tsx` → серверная подсказка | — → JSX |
| 2.3.12 | Удалить `src/features/checkout/api/useCreateOrder.ts`, `useOrder.ts`, `useOrderByNumber.ts`; моки `getCheckoutOptions`, `createOrder`, `getOrder`, `getOrderByNumber`, `cartStore`, сид-товар и localStorage-персист; `src/data/checkout.ts` — только текст согласия | — → без моков |

## 4. Новые сущности, переиспользование, бюджет

**Новые сущности (путь → зачем):**
- `src/shared/lib/deviceId.ts` — постоянный id гостя для `X-Device-Id`.
- `src/shared/lib/storageStore.ts` — фабрика sessionStorage-сторов (вторая копия: запись + заказ).
- `src/shared/lib/countdown.ts` — `resendRemaining`/`formatCountdown` (вторая копия: код записи + код заказа).
- `src/shared/lib/otp.ts`, `src/shared/ui/OtpCodeInput.tsx`, `src/shared/ui/Alert.tsx` — вторая копия OTP и алерта.
- `src/features/cart/lib/itemable.ts` — правило «товар → тип позиции корзины» и поиск строки по товару.
- `src/features/checkout/lib/{draft,draftStore,payload,errors,snapshot}.ts` — черновик, тело, отказы, снимок.
- `src/features/checkout/api/{useDeliveryPoints,useIssueCheckoutCode,useConfirmCheckout}.ts` — хуки шагов.
- `src/features/checkout/components/CheckoutCodeStep.tsx`, `src/app/checkout/code/page.tsx` — шаг кода.
- `documentations/integrations/cart-checkout.md` — контракт, заголовки, ошибки, ограничения.

**Переиспользуем:** `fetchJson`/`ApiError`/`toErrorResponse` (`shared/api/http.ts`), `apiBase()`,
`formatPrice`, `PRODUCT_PLACEHOLDER`, `useCity`, паттерн черновика записи (ADR 0005), разметку
`.code-*`/`.otp-*`/`.order_form_*` и стили из `src/app/style.css`.

**Не делаем:**
- Картинку и артикул в корзине (в ответе API их нет — долг бэка).
- Онлайн-оплату, расчёт стоимости доставки, уведомления о заказе, «транспортную компанию».
- Поле комментария к заказу (нет в макете; бэк его принимает — не показываем).
- Чекбоксы согласий (остаётся строка макета).
- ЛК, `/account/orders`, публичное чтение заказа гостя, поиск по номеру.
- Оптимистичные мутации корзины (ответ сервера — источник истины).
- RHF/Zod, новые зависимости, изменения на бэке.
- Кеширование корзины и справочника (свежесть важнее).

Паттерн не вводится: вторая копия закрывается общими функциями/компонентами (шаг 1), ось
изменения одна — контракт API.

## 5. Сначала минимальный вариант

Минимум: React Query как кеш серверных ответов; мутация → `setQueryData(cart)`; черновик — один
объект в `sessionStorage`; ошибки — по машинному `code`; снимок заказа собирается чистой функцией
из ответа и уже полученных label. Отклонено: оптимистичные обновления с последующей сверкой id
строк (вторая копия логики корзины), локальный кеш картинок по товару (устаревает, не нужен),
глобальный стор корзины (запрещён архитектурой — данные живут в React Query).

## 6. STOP-условие и бюджет диффа

Остановиться и спросить пользователя, если реализация требует:
- новой зависимости (`package.json`) или новой настройки/env;
- изменения контракта бэка (поля, коды, заголовки) или миграции;
- появления картинки/артикула в ответе корзины (бэк поменялся — пересмотреть заглушку);
- авторизации/токена на фронте;
- расширения `/order-status` сверх статичной подсказки;
- диффа больше 35 файлов на шаг 2 или больше 10 на шаг 1.

**Коммиты:** шаг 1 — отдельный; шаг 2 — один коммит (корзина и оформление делят `cartStore`,
разделить их и оставить зелёную сборку нельзя). Дифф шага 2 — около 30 файлов.

## 7. Тест-лист

Тесты — Vitest, `tests/unit/*.test.ts`, чистые функции; RTL/DOM-тестов нет.

### `tests/unit/cartAdapter.test.ts`

Тест 1
1. Поведение: позиция DTO превращается в строку корзины — id строки и id товара разведены, цена — `unit_price`, сумма — серверный `total`, картинка — общая заглушка (в ответе её нет)
2. Вход: `{id: 1, itemable_type: "tire", itemable_id: 10, name: "Шина …", brand: {id: 3, name: "Viatti", slug: "viatti"}, quantity: 4, unit_price: 10100, total: 40400, available: true, delivery: {delivery_min: 1, delivery_max: 2}, count_in_stock: 12}`, `subtotal: 40400`
3. Ожидание: `items[0]` = `{id: "1", itemableId: "10", itemableType: "tire", brandName: "Viatti", price: 10100, total: 40400, quantity: 4, available: true, countInStock: 12, image: "/assets/img/wheel-product.png"}`; `subtotal` == 40400
4. Имя: `test_maps_cart_item_dto_to_row`

Тест 2
1. Поведение: позиция без цены города не выдаёт цену и помечена недоступной; `null` не превращается в 0
2. Вход: та же позиция с `unit_price: null`, `total: null`, `available: false`
3. Ожидание: `price === null`, `total === null`, `available === false`
4. Имя: `test_keeps_null_price_for_unavailable_item`

Тест 3
1. Поведение: тип товара каталога переводится в тип позиции API; неизвестный тип — отказ, а не молчаливый дефолт
2. Вход: `"tires"`, `"wheels"`, затем `"services"`
3. Ожидание: `"tire"`, `"wheel"`, затем брошено исключение
4. Имя: `test_map_category_to_itemable_type`

Тест 4
1. Поведение: кнопка «Убрать» находит строку корзины по паре «тип + id товара», а не по id строки
2. Вход: строки `[{id:"5", itemableType:"tire", itemableId:"10"}]`; поиск `{itemableType:"tire", itemableId:"10"}` и `{itemableType:"wheel", itemableId:"10"}`
3. Ожидание: первый поиск вернул строку id `"5"`, второй — `undefined`
4. Имя: `test_find_cart_line_by_product`

### `tests/unit/checkoutPayload.test.ts`

Тест 1
1. Поведение: самовывоз отправляет точку и не отправляет адрес курьера; согласия всегда `true`; код и телефон попадают в тело
2. Вход: черновик `{city:"cheljabinsk", customerName:"Иван Петров", phone:"+7 (351) 123-45-67", deliveryType:"pickup", pickupPointId:3, paymentMethod:"cash_on_delivery"}`, код `"1234"`
3. Ожидание: `pickup_point_id == 3`, ключа `delivery_address` нет, `offer_accepted === true`, `privacy_accepted === true`, `customer_phone_code == "1234"`, `city == "cheljabinsk"`
4. Имя: `test_pickup_payload_has_point_and_consents`

Тест 2
1. Поведение: курьер отправляет структуру адреса; пустая квартира в тело не попадает (иначе бэк получит пустую строку вместо отсутствия)
2. Вход: черновик с `deliveryType:"courier"`, адрес `{city:"Челябинск", street:"Ленина", house:"1", apartment:"", comment:""}`
3. Ожидание: `delivery_address` = `{city:"Челябинск", street:"Ленина", house:"1"}`, ключей `apartment`/`comment` нет, `pickup_point_id` отсутствует
4. Имя: `test_courier_payload_omits_empty_address_fields`

### `tests/unit/checkoutErrorMapping.test.ts`

Тест 1
1. Поведение: отказы различаются по машинному коду, а не по тексту; неверный и истёкший код ведут в разные состояния экрана
2. Вход: `{status:422, body:{code:"checkout.phone_code_invalid"}}` и `{status:422, body:{code:"checkout.phone_code_expired"}}`
3. Ожидание: `state` — `"code_invalid"` и `"code_expired"` соответственно
4. Имя: `test_map_phone_code_errors`

Тест 2
1. Поведение: кулдаун отдаёт остаток из тела 429 — таймер кнопки считается от него, а не от константы
2. Вход: `{status:429, body:{code:"checkout.code_cooldown", retry_after:37, message:"Код уже отправлен"}}`
3. Ожидание: `state === "cooldown"`, `retryAfter === 37`
4. Имя: `test_cooldown_returns_retry_after`

Тест 3
1. Поведение: ошибка валидации без машинного кода не показывает технический `message` бэка
2. Вход: `{status:422, body:{message:"validation.required", errors:{phone:["…"]}}}`
3. Ожидание: `state === "unknown"`, `message` равен `DEFAULT_API_ERROR_MESSAGE`
4. Имя: `test_validation_error_hides_backend_message`

Тест 4
1. Поведение: неизвестный код и отсутствие тела сводятся к общему состоянию без падения
2. Вход: `{status:500, body:null}` и `{status:422, body:{code:"checkout.new_code"}}`
3. Ожидание: оба — `state === "unknown"`, `retryAfter === undefined`
4. Имя: `test_unknown_error_is_generic`

### `tests/unit/checkoutDraft.test.ts`

Тест 1
1. Поведение: ФИО склеивается в `customer_name` без лишних пробелов; ключ и город попадают в черновик
2. Вход: `{lastName:" Петров ", firstName:"Иван", middleName:""}`, ключ `"uuid-1"`, город `"cheljabinsk"`
3. Ожидание: `customerName === "Петров Иван"`, `idempotencyKey === "uuid-1"`, `city === "cheljabinsk"`
4. Имя: `test_draft_joins_name_and_keeps_key`

Тест 2
1. Поведение: черновик без телефона не готов к шагу кода — прямой заход на `/checkout/code` уводит на форму
2. Вход: черновик с пустым `phone`; затем с телефоном
3. Ожидание: `isDraftReady` — `false`, затем `true`
4. Имя: `test_draft_requires_phone`

### `tests/unit/deviceId.test.ts`

Тест 1
1. Поведение: id устройства создаётся один раз и живёт в хранилище — повторный вызов не генерирует новый
2. Вход: пустое хранилище, генератор `() => "dev-1"`; затем хранилище с `"dev-1"`, генератор, который бросает
3. Ожидание: первый вызов вернул `"dev-1"` и записал его; второй — `"dev-1"` без вызова генератора
4. Имя: `test_device_id_is_created_once`

### `tests/unit/orderSnapshot.test.ts`

Тест 1
1. Поведение: снимок берёт суммы и позиции из ответа заказа, подписи — из справочника, адрес точки — из черновика; машинный статус ярлыком не переводится
2. Вход: заказ `{id:12, subtotal:40400, delivery_cost:0, total:40400, items:[{name:"Шина", quantity:4, unit_price:10100, total:40400}]}`, черновик самовывоза с `pickupPointId:3`, `pickupPointAddress:"Свердловский тракт, 3-н"`, справочник `{delivery:[{value:"pickup", label:"Самовывоз"}], payment:[{value:"cash_on_delivery", label:"Наличные при получении"}]}`
3. Ожидание: `total === 40400`, `deliveryLabel === "Самовывоз"`, `pickupAddress === "Свердловский тракт, 3-н"`, `paymentLabel === "Наличные при получении"`, поля со статусом-ярлыком нет
4. Имя: `test_snapshot_uses_server_totals_and_reference_labels`

Тест 2
1. Поведение: адрес курьера собирается строкой, пустая квартира не оставляет лишней запятой
2. Вход: черновик курьера `{city:"Челябинск", street:"Ленина", house:"1", apartment:""}`
3. Ожидание: `deliveryAddress === "Челябинск, Ленина 1"`
4. Имя: `test_courier_snapshot_address_without_apartment`

### `tests/unit/countdown.test.ts`

Тест 1
1. Поведение: остаток кулдауна уменьшается от момента выдачи и не уходит ниже нуля (перенос из `bookingDraft.test.ts`)
2. Вход: `issuedAt = 1 700 000 000 000`, `retryAfter = 60`, `now = issuedAt + 45 000`; затем `now = issuedAt + 61 000`
3. Ожидание: `15`, затем `0`
4. Имя: `test_resend_remaining_counts_down`

Тест 2
1. Поведение: таймер форматируется как `M:SS` — 61 секунда не превращается в `1:1`
2. Вход: `0`, `61`
3. Ожидание: `"0:00"`, `"1:01"`
4. Имя: `test_format_countdown`

## 8. Схема вызовов

```
ОФОРМЛЕНИЕ
┌─ ТРИГГЕР ─────────────────────────────────────────────────────┐
│  /checkout → кнопка «Оформить заказ»                          │
└───────────────────────────┬───────────────────────────────────┘
                            ▼
┌─ КЛИЕНТ ──────────────────────────────────────────────────────┐
│ [CheckoutPage] проверка формы и корзины                       │
│   → [lib/draft] createCheckoutDraft (ключ + sessionStorage)   │
│   → [useIssueCheckoutCode] mutate                             │
│   → [shared/api/checkout] issueCheckoutCode(phone, key)       │
└───────────────────────────┬───────────────────────────────────┘
                            │ POST /api/checkout/code
                            ▼
┌─ БЭК ─────────────────────────────────────────────────────────┐
│  CheckoutCodeController → SMS в очередь → {retry_after}       │
└───────────────────────────┬───────────────────────────────────┘
                            │ 200 / 429
                            ▼
┌─ КЛИЕНТ ──────────────────────────────────────────────────────┐
│ draft += codeIssuedAt/codeRetryAfter → router.push(code)      │
│ [CheckoutCodeStep] OTP → [useConfirmCheckout]                 │
│   → [lib/payload] buildCheckoutPayload(draft, code)           │
│   → [shared/api/checkout] confirmCheckout(payload, key)       │
└───────────────────────────┬───────────────────────────────────┘
                            │ POST /api/checkout (Idempotency-Key,
                            │ X-Device-Id, city)
                            ▼
┌─ БЭК ─────────────────────────────────────────────────────────┐
│  CheckoutController: контекст → согласия → город → точки →    │
│  код телефона → корзина → CreateOrder → ClearCart             │
└───────────────────────────┬───────────────────────────────────┘
                            │ 201 OrderDto
                            ▼
┌─ КЛИЕНТ ──────────────────────────────────────────────────────┐
│ [lib/snapshot] buildOrderSnapshot(order, draft, reference)    │
│ snapshotStore.write → draftStore.clear → invalidate cart      │
│ router.replace('/order/{id}')                                 │
│ [OrderPage] snapshotStore → JSX (без сети)                    │
└───────────────────────────────────────────────────────────────┘

КОРЗИНА
[BuyButton|AddToCartBlock] → useCartItemActions → useAddToCart
  → addCartItem({itemableType,itemableId,quantity}, city)
  → POST /api/cart/items (X-Device-Id, city в теле)
  → CartDto → toCartView → qc.setQueryData(cart.items(city))
  → CartBadge / CartPage / CartPopup перерисовываются
```

## 9. Прогоны

- **Красный (24.11.2026, 16:03):** 7 новых файлов тестов упали `Cannot find package …` /
  отсутствующие экспорты; `bookingDraft.test.ts` — 2 теста прошли (перенос кулдауна в shared).
- **Зелёный (24.11.2026, 16:08):** `npm test` — 40 files / 198 tests passed;
  `npx tsc --noEmit` — чисто; `npm run lint` — 0 ошибок, 4 прежних предупреждения.
- **Смоук:** `GET/POST/PATCH/DELETE /api/cart` через `localhost:30034` с `X-Device-Id` — 200
  (добавление, изменение количества, удаление); `/reference/checkout` — 200 после сида
  настройки `checkout_payment_methods`.
- **Квитанция:** дерево перед коммитом непустое (новые файлы вне `git diff HEAD`), полный
  прогон зелёный; после коммита квитанция — `git rev-parse HEAD` (чистое дерево, см. отчёт ship).

## 10. Визуальная проверка

После реализации проверить на живом бэке (Docker, `make up`, порт 30034):
1. `/cart` — позиции с ценами и наличием, «+/-», «Удалить», пустая корзина, позиция без цены города.
2. Карточка товара и листинг — «Купить» → попап, «Убрать» → подтверждение; счётчик в шапке.
3. `/checkout` — способы из справочника, точки самовывоза города (одна точка — выбрана сама), адрес курьера (город подставлен из шапки), пустые списки.
4. `/checkout/code` — OTP, таймер повторной отправки, неверный код, возврат на `/checkout` без черновика.
5. `/order/[id]` — снимок после оформления; перезагрузка страницы; чужой id — «не найден».
6. `/order-status` — статичная подсказка, ссылка в шапке работает.

## 11. Открытые вопросы

Нет.

## 12. Документация (в том же коммите)

- Новый `documentations/integrations/cart-checkout.md`: эндпоинты, заголовки, поток, коды отказа,
  ограничения (нет картинки/артикула, `delivery_cost=0`, нет онлайн-оплаты и уведомлений).
- `CLAUDE.md`: раздел «Данные и состояние» — корзина и оформление живые; моки заказов удалены;
  маршрут `/checkout/code` в схеме роутов; долг бэка по картинке корзины.
- При закрытии плана — спросить пользователя про ADR (двухшаговое оформление и черновик заказа
  в `sessionStorage`; продолжение ADR 0005).
- Wiki: изменения затрагивают функционал — в конце спросить пользователя про обновление wiki
  (правило `wiki-sync.md`).

## 13. Согласовано

2026-11-24, пользователь: «одобрено».
