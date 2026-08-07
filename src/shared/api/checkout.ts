// Checkout: опции оформления + мок-создание заказа
import {
  CHECKOUT_DELIVERY,
  CHECKOUT_PAYMENT,
  CHECKOUT_AGREEMENT,
} from "@/data/checkout";
import type {
  CheckoutOptions,
  Order,
  CreateOrderPayload,
} from "@/features/checkout/types";
import { cartStore } from "./cart";
import { delay } from "./base";

export type { CheckoutOptions, Order, CreateOrderPayload };

export async function getCheckoutOptions(): Promise<CheckoutOptions> {
  return delay(30, {
    delivery: CHECKOUT_DELIVERY,
    payment: CHECKOUT_PAYMENT,
    agreement: CHECKOUT_AGREEMENT,
  });
}

// Мок-хранилище заказов в localStorage (createOrder выполняется на клиенте —
// заказ должен пережить редирект на /order/[id], как корзина через «cart»)
const ORDERS_KEY = "orders";

function loadOrders(): Order[] {
  if (typeof localStorage !== "undefined") {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      if (stored) return JSON.parse(stored) as Order[];
    } catch {
      /* пусто */
    }
  }
  return [];
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<Order> {
  const items = [...cartStore];
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const orders = loadOrders();
  const delivery = CHECKOUT_DELIVERY.find(
    (d) => d.id === payload.deliveryMethodId,
  );
  const payment = CHECKOUT_PAYMENT.find(
    (p) => p.id === payload.paymentMethodId,
  );
  const order: Order = {
    id: `order-${orders.length + 1}`,
    number: `А-${String(orders.length + 1).padStart(5, "0")}`,
    status: "Принят в обработку",
    items,
    total,
    recipient: payload.recipient,
    deliveryLabel: delivery?.title ?? payload.deliveryMethodId,
    deliveryAddress: payload.deliveryAddress,
    paymentLabel: payment?.label ?? payload.paymentMethodId,
  };
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  // Оформление завершено — корзина пуста (персист как в addToCart)
  cartStore.length = 0;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(50, order);
}

export async function getOrder(id: string): Promise<Order | null> {
  return delay(30, loadOrders().find((o) => o.id === id) ?? null);
}

export async function getOrderByNumber(
  number: string,
): Promise<Order | null> {
  const q = number.trim().toLowerCase();
  return delay(30, loadOrders().find((o) => o.number.toLowerCase() === q) ?? null);
}
