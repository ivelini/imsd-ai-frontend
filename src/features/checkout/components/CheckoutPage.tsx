"use client";
// Оформление заказа: справочник с сервера, корзина и точки выдачи — живые (24.11.2026).
// «Оформить заказ»: проверка формы и корзины → черновик в sessionStorage → SMS-код →
// шаг /checkout/code. Позиции на сервер не уходят — он берёт их из корзины.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/api/useCart";
import { useCity } from "@/shared/layout/api/useCity";
import { useDeliveryPoints } from "@/features/checkout/api/useDeliveryPoints";
import { useIssueCheckoutCode } from "@/features/checkout/api/useIssueCheckoutCode";
import { createCheckoutDraft, joinCustomerName, setCodeIssued } from "@/features/checkout/lib/draft";
import { draftStore } from "@/features/checkout/lib/draftStore";
import { mapCheckoutError, toErrorResponse } from "@/features/checkout/lib/errors";
import { formatPrice } from "@/shared/lib/money";
import { CHECKOUT_AGREEMENT } from "@/data/checkout";
import type {
  CheckoutFormInput,
  CheckoutReference,
  DeliveryPoint,
} from "@/features/checkout/types";

// Иконки способов получения — ассеты витрины, не данные бэка
const DELIVERY_ICONS: Record<string, string> = {
  pickup: "/assets/img/delivery_1.svg",
  courier: "/assets/img/delivery_2.svg",
};


interface CheckoutPageProps {
  reference: CheckoutReference;
}

export function CheckoutPage({ reference }: CheckoutPageProps) {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const { citySlug, cityLabel } = useCity();
  const { data: points = [], isLoading: pointsLoading } = useDeliveryPoints(citySlug);
  const issueCode = useIssueCheckoutCode();

  // Шаг 1 — данные получателя; отдельные поля склеиваются в customer_name
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("+7(");
  const [email, setEmail] = useState("");

  // Шаг 2 — способ получения: точка самовывоза или структурированный адрес курьера
  const [deliveryType, setDeliveryType] = useState(reference.delivery[0]?.value ?? "");
  const [pickupPointId, setPickupPointId] = useState<number | null>(null);
  // Город курьера до правки — город сайта из шапки (null = пользователь ещё не правил)
  const [addressCity, setAddressCity] = useState<string | null>(null);
  const [addressStreet, setAddressStreet] = useState("");
  const [addressHouse, setAddressHouse] = useState("");
  const [addressApartment, setAddressApartment] = useState("");

  // Шаг 3 — способ оплаты из справочника
  const [paymentMethod, setPaymentMethod] = useState(reference.payment[0]?.value ?? "");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return null;

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <section className="order-section container">
        <h2>Оформление заказа</h2>
        <div className="cart-empty">
          <p className="cart-empty-text">В корзине пока пусто</p>
          <Link className="primary-button cart-empty-button" href="/catalog/tires">
            Перейти в каталог
          </Link>
        </div>
      </section>
    );
  }

  const selected = reference.delivery.find((method) => method.value === deliveryType);
  const requiresPickup = selected?.requiresPickupPoint ?? false;
  const requiresAddress = selected?.requiresAddress ?? false;
  const paymentUnavailable = reference.payment.length === 0;
  const addressCityValue = addressCity ?? cityLabel;
  // Выбранная точка: явный выбор из списка, иначе единственная точка города.
  // Точки, пропавшей из списка (смена города), не доверяем — выбор сбрасывается.
  const chosenPoint =
    points.find((point) => point.id === pickupPointId) ??
    (points.length === 1 ? points[0] : null);

  const selectDelivery = (value: string) => {
    setDeliveryType(value);
    // Точка принадлежит городу и способу получения — при смене её не переиспользуем
    setPickupPointId(null);
  };

  const selectPoint = (point: DeliveryPoint) => {
    setPickupPointId(point.id);
  };

  const validate = (customerName: string): string | null => {
    if (customerName === "") return "Укажите имя получателя";
    if (phone.trim() === "") return "Укажите телефон";
    if (items.some((item) => !item.available)) {
      return "Некоторые товары недоступны в выбранном городе — вернитесь в корзину";
    }
    if (requiresPickup && pointsLoading) return "Подождите, загружаем точки самовывоза";
    if (requiresPickup && chosenPoint === null) return "Выберите точку самовывоза";
    if (
      requiresAddress &&
      (addressCityValue.trim() === "" ||
        addressStreet.trim() === "" ||
        addressHouse.trim() === "")
    ) {
      return "Заполните город, улицу и дом";
    }
    if (paymentMethod === "") return "Нет доступного способа оплаты";

    return null;
  };

  const submit = () => {
    setError(null);
    if (issueCode.isPending) return;

    const customerName = joinCustomerName({ lastName, firstName, middleName });
    const problem = validate(customerName);

    if (problem !== null) {
      setError(problem);
      return;
    }

    const input: CheckoutFormInput = {
      lastName,
      firstName,
      middleName,
      phone,
      email,
      deliveryType,
      pickupPointId: requiresPickup ? (chosenPoint?.id ?? null) : null,
      pickupPointAddress: requiresPickup ? (chosenPoint?.address ?? null) : null,
      deliveryAddress: requiresAddress
        ? {
            city: addressCityValue,
            street: addressStreet,
            house: addressHouse,
            apartment: addressApartment,
            comment: "",
          }
        : null,
      paymentMethod,
    };
    const draft = createCheckoutDraft(input, crypto.randomUUID(), citySlug);
    draftStore.write(draft);

    issueCode.mutate(
      { phone: draft.phone, key: draft.idempotencyKey },
      {
        onSuccess: ({ retryAfter }) => {
          draftStore.write(setCodeIssued(draft, retryAfter, Date.now()));
          router.push("/checkout/code");
        },
        onError: (cause) => {
          const result = mapCheckoutError(toErrorResponse(cause));

          // Код уже высылали — не теряем попытку: переходим к вводу с таймером
          if (result.state === "cooldown" && result.retryAfter !== undefined) {
            draftStore.write(setCodeIssued(draft, result.retryAfter, Date.now()));
            router.push("/checkout/code");
            return;
          }

          setError(result.message);
        },
      },
    );
  };

  return (
    <section className="order-section container">
      <h2>Оформление заказа</h2>
      <div className="order_row">
        <div className="order_form">
          {/* Шаг 1 — Данные получателя */}
          <div className="order_form_in order_form_details">
            <div className="order_form_title"><span>1</span> Данные получателя</div>
            <div className="order_form_subtitle">*поля являются обязательными для заполнения</div>
            <div className="order_form_details_row">
              <div className="order_form_details_input">
                <input
                  type="text"
                  placeholder="Фамилия"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="order_form_details_input">
                <input
                  type="text"
                  placeholder="Имя*"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="order_form_details_input">
                <input
                  type="text"
                  placeholder="Отчество"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
            </div>
            <div className="order_form_details_input">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="order_form_details_input_prompt">
                *Позвоним, что бы согласовать детали заказа (обязательно)
              </div>
            </div>
            <div className="order_form_details_input">
              <input
                type="email"
                placeholder="E-Mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="order_form_details_input_prompt">
                Для отправки статуса заказа и документов (не обязательно)
              </div>
            </div>
          </div>

          {/* Шаг 2 — Способ получения */}
          <div className="order_form_in order_form_delivery">
            <div className="order_form_title"><span>2</span> Способ получения</div>
            <div className="order_form_subtitle">
              *стоимость заказа могут изменяться в зависимости от выбранного города
            </div>
            <div className="order_form_delivery_town">
              <img src="/assets/img/town.svg" alt="" />
              <span>Ваш город</span>
              <b>{cityLabel}</b>
            </div>
            {reference.delivery.map((method) => (
              <div
                key={method.value}
                className={`order_form_delivery_item${deliveryType === method.value ? " active" : ""}`}
                onClick={() => selectDelivery(method.value)}
              >
                <div className="order_form_delivery_item_img">
                  {DELIVERY_ICONS[method.value] && (
                    <img src={DELIVERY_ICONS[method.value]} alt="" />
                  )}
                </div>
                <div className="order_form_delivery_item_cont">
                  <div className="order_form_delivery_item_title">{method.label}</div>

                  {method.requiresPickupPoint && deliveryType === method.value && (
                    <>
                      {pointsLoading && (
                        <div className="order_form_delivery_item_list">
                          <div><span>Загружаем точки самовывоза…</span></div>
                        </div>
                      )}
                      {!pointsLoading && points.length === 0 && (
                        <div className="order_form_delivery_item_input_prompt">
                          Самовывоз в этом городе недоступен — выберите курьерскую доставку
                        </div>
                      )}
                      {points.length > 0 && (
                        <div className="order_form_delivery_item_list">
                          {points.map((point) => (
                            <div key={point.id} onClick={() => selectPoint(point)}>
                              <img
                                src={
                                  chosenPoint?.id === point.id
                                    ? "/assets/img/order_check_a.svg"
                                    : "/assets/img/order_check.svg"
                                }
                                alt=""
                              />
                              <span>
                                {point.address}
                                {point.workHours ? ` (${point.workHours})` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {method.requiresAddress && deliveryType === method.value && (
                    <>
                      <div className="order_form_details_row">
                        <div className="order_form_details_input">
                          <input
                            type="text"
                            placeholder="Город*"
                            value={addressCityValue}
                            onChange={(e) => setAddressCity(e.target.value)}
                          />
                        </div>
                        <div className="order_form_details_input">
                          <input
                            type="text"
                            placeholder="Улица*"
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                          />
                        </div>
                        <div className="order_form_details_input">
                          <input
                            type="text"
                            placeholder="Дом*"
                            value={addressHouse}
                            onChange={(e) => setAddressHouse(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="order_form_details_input">
                        <input
                          type="text"
                          placeholder="Квартира"
                          value={addressApartment}
                          onChange={(e) => setAddressApartment(e.target.value)}
                        />
                      </div>
                      <div className="order_form_delivery_item_input_prompt">
                        *Позвоним, что бы согласовать детали заказа (обязательно)
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Шаг 3 — Способ оплаты */}
          <div className="order_form_in order_form_method">
            <div className="order_form_title"><span>3</span> Способ оплаты</div>
            {reference.payment.map((method) => (
              <div
                key={method.value}
                className={`order_form_method_item${paymentMethod === method.value ? " active" : ""}`}
                onClick={() => setPaymentMethod(method.value)}
              >
                <img
                  src={
                    paymentMethod === method.value
                      ? "/assets/img/order_check_a.svg"
                      : "/assets/img/order_check.svg"
                  }
                  alt=""
                />
                <span>{method.label}</span>
              </div>
            ))}

            {paymentUnavailable ? (
              <div className="order_form_method_btn_info">
                Оформление временно недоступно: способы оплаты не настроены.
              </div>
            ) : (
              <div className="order_form_method_btn">
                {error !== null && <p className="order-form-error">{error}</p>}
                <button
                  type="submit"
                  className="order_form_method_btn_submit"
                  onClick={submit}
                  disabled={issueCode.isPending}
                >
                  Оформить заказ
                </button>
                <div className="order_form_method_btn_info">
                  <img src="/assets/img/order_check_a.svg" alt="" />
                  <span>{CHECKOUT_AGREEMENT}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Сайдбар «К оплате» */}
        <div className="order_total">
          <div className="order_total_top">
            <div className="order_total_top_title">К оплате</div>
            <div className="order_total_top_price">{formatPrice(cart?.subtotal ?? 0)}</div>
          </div>
          <div className="order_total_list">
            {items.map((item) => (
              <div key={item.id}>
                <span>{item.name}</span>
                <span>
                  {item.quantity}шт. х {item.price !== null ? formatPrice(item.price) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
