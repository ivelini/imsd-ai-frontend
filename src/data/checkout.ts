// Моки оформления заказа (фаза 4, 05.08.2026)
// Готовые строки для отображения — имитация ответа бэка (см. api-contract.md).
import type { DeliveryMethod, PaymentMethod } from "@/features/checkout/types";

export type { DeliveryMethod, PaymentMethod };

export const CHECKOUT_DELIVERY: DeliveryMethod[] = [
  {
    id: "pickup",
    icon: "/assets/img/delivery_1.svg",
    title: "Самовывоз со склада с 14.02 по 17.02",
    points: [
      "Свердловский тракт, 3-н (пн-пт 9:00-19:00, вых 9:00-19:00)",
      "Ленина, 1-н (пн-пт 9:00-19:00, вых 9:00-19:00)",
    ],
  },
  {
    id: "courier",
    icon: "/assets/img/delivery_2.svg",
    title: "Доставка в Вашем городе",
    highlight: "бесплатно",
    titleAfter: ". В удаленные районы согласно установленным тарифам",
    inputPlaceholder: "Адрес в свободной форме* ",
    inputPrompt: "*Позвоним, что бы согласовать детали заказа (обязательно)",
  },
  {
    id: "tk",
    icon: "/assets/img/delivery_3.svg",
    title:
      'Отправим Ваш заказ транспортной компанией “Энергия”, “ПЭК”, “КИТ”, “Деловые линии”. Доставка до ТК бесплатно.',
    inputPlaceholder: "Город, пожелание по ТК (в свободной форме)* ",
  },
];

export const CHECKOUT_PAYMENT: PaymentMethod[] = [
  { id: "cash", label: "Наличными при получении" },
  { id: "card", label: "Картами Visa, MasterCard, Мир. Система быстрых платежей" },
];

/** Согласие под кнопкой оформления (мокап .order_form_method_btn_info) */
export const CHECKOUT_AGREEMENT =
  "Продолжая оформление заказа, я соглашаюсь с условиями Политики конфиденциальности и Публичной оферты, включающей условия обработки персональных данных";
