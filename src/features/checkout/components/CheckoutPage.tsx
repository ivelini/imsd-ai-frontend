"use client";
// Оформление заказа: .order_row → .order_form (шаги 1–3) + .order_total (фаза 4)
// Состояния мокапа (.active у способа получения/оплаты) — контролируемый state.
// Сабмит: мок createOrder → очистка корзины → редирект на /order/[id].
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/api/useCart";
import { useCity } from "@/shared/layout/api/useCity";
import { useCreateOrder } from "@/features/checkout/api/useCreateOrder";
import type { CheckoutOptions } from "@/features/checkout/types";
import { formatPrice } from "@/shared/lib/money";


interface CheckoutPageProps {
  options: CheckoutOptions;
  /** Пункты .order_total_list: бенефиты корзины (готовые строки от «бэка») */
  benefits: string[];
}

export function CheckoutPage({ options, benefits }: CheckoutPageProps) {
  const router = useRouter();
  const { data: items = [], isLoading } = useCart();
  const { cityLabel } = useCity();
  const { mutate: createOrder, isPending } = useCreateOrder();

  // Шаг 1 — получатель (без RHF/Zod до API, см. решение 05.08.2026)
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("+7(");
  const [email, setEmail] = useState("");

  // Шаг 2 — способ получения, шаг 3 — оплата
  const [deliveryId, setDeliveryId] = useState<string>(options.delivery[0]?.id ?? "pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentId, setPaymentId] = useState<string>(options.payment[0]?.id ?? "cash");

  if (isLoading) return null;

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSubmit = () => {
    if (isPending) return;
    createOrder(
      {
        recipient: { lastName, firstName, middleName, phone, email },
        deliveryMethodId: deliveryId,
        deliveryAddress,
        paymentMethodId: paymentId,
      },
      { onSuccess: (order) => router.push(`/order/${order.id}`) },
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
            {options.delivery.map((method) => (
              <div
                key={method.id}
                className={`order_form_delivery_item${deliveryId === method.id ? " active" : ""}`}
                onClick={() => setDeliveryId(method.id)}
              >
                <div className="order_form_delivery_item_img">
                  <img src={method.icon} alt="" />
                </div>
                <div className="order_form_delivery_item_cont">
                  <div className="order_form_delivery_item_title">
                    {method.title}
                    {method.highlight && <span>{method.highlight}</span>}
                    {method.titleAfter}
                  </div>
                  {method.points && (
                    <div className="order_form_delivery_item_list">
                      {method.points.map((point, i) => (
                        <div key={point}>
                          <img
                            src={
                              deliveryId === method.id && i === 0
                                ? "/assets/img/order_check_a.svg"
                                : "/assets/img/order_check.svg"
                            }
                            alt=""
                          />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {method.inputPlaceholder && (
                    <div className="order_form_delivery_item_input">
                      <input
                        type="text"
                        placeholder={method.inputPlaceholder}
                        value={deliveryId === method.id ? deliveryAddress : ""}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                      {method.inputPrompt && (
                        <div className="order_form_delivery_item_input_prompt">
                          {method.inputPrompt}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Шаг 3 — Способ оплаты */}
          <div className="order_form_in order_form_method">
            <div className="order_form_title"><span>3</span> Способ оплаты</div>
            {options.payment.map((method) => (
              <div
                key={method.id}
                className={`order_form_method_item${paymentId === method.id ? " active" : ""}`}
                onClick={() => setPaymentId(method.id)}
              >
                <img
                  src={
                    paymentId === method.id
                      ? "/assets/img/order_check_a.svg"
                      : "/assets/img/order_check.svg"
                  }
                  alt=""
                />
                <span>{method.label}</span>
              </div>
            ))}

            <div className="order_form_method_btn">
              <button
                type="submit"
                className="order_form_method_btn_submit"
                onClick={handleSubmit}
              >
                Оформить заказ
              </button>
              <div className="order_form_method_btn_info">
                <img src="/assets/img/order_check_a.svg" alt="" />
                <span>{options.agreement}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Сайдбар «К оплате» */}
        <div className="order_total">
          <div className="order_total_top">
            <div className="order_total_top_title">К оплате</div>
            <div className="order_total_top_price">{formatPrice(total)}</div>
          </div>
          <div className="order_total_list">
            {items.map((item, i) => (
              <div key={item.id}>
                <span>{benefits[i] ?? ""}</span>
                <span>
                  {item.quantity}шт. х {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
