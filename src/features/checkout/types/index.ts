// DTO оформления заказа (фаза 4) — контракт ответа бэка
import type { CartItem } from "@/features/cart/types";

export interface DeliveryMethod {
  /** id совпадает с value, которое уйдёт на бэк при API */
  id: "pickup" | "courier" | "tk";
  icon: string;
  title: string;
  /** Часть title, подсвеченная красным (в мокапе — <span>бесплатно</span>) */
  highlight?: string;
  /** Текст title после подсветки */
  titleAfter?: string;
  /** Точки самовывоза (только pickup) — готовые строки */
  points?: string[];
  /** Плейсхолдер поля ввода (courier/tk) */
  inputPlaceholder?: string;
  /** Подсказка под полем */
  inputPrompt?: string;
}

export interface PaymentMethod {
  id: "cash" | "card";
  label: string;
}

export interface CheckoutOptions {
  delivery: DeliveryMethod[];
  payment: PaymentMethod[];
  agreement: string;
}

/** Заказ — снимок корзины и данных формы (мок-хранилище в localStorage) */
export interface Order {
  id: string;
  /** Человекочитаемый номер заказа, напр. «А-00001» */
  number: string;
  status: string;
  items: CartItem[];
  total: number;
  recipient: {
    lastName: string;
    firstName: string;
    middleName: string;
    phone: string;
    email: string;
  };
  /** Готовые строки от «бэка» (api-contract): label вместо id */
  deliveryLabel: string;
  deliveryAddress: string;
  paymentLabel: string;
}

export interface CreateOrderPayload {
  recipient: Order["recipient"];
  deliveryMethodId: string;
  deliveryAddress: string;
  paymentMethodId: string;
}
