// Cart — мок-хранилище в памяти (имитация серверного состояния)
import type { CartItem } from "@/features/cart/types";
import { CART_TOTAL_BENEFITS } from "@/data/cart";
import { delay } from "./base";

export const cartStore: CartItem[] = [
  {
    id: "cart-demo-1",
    name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
    price: 10100,
    quantity: 4,
    image: "/assets/img/wheel-product.png",
    code: "АА-00075632",
    availability: ">12 шт.",
  },
];

export async function getCartTotalInfo(): Promise<{ benefits: string[] }> {
  return delay(30, { benefits: [...CART_TOTAL_BENEFITS] });
}

export async function getCartItems(): Promise<CartItem[]> {
  // Пробуем восстановить из localStorage (если доступен)
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          cartStore.length = 0;
          cartStore.push(...parsed);
        }
      } catch {
        /* пусто */
      }
    }
  }
  return delay(30, [...cartStore]);
}

export interface CartAddPayload {
  id: string;
  name: string;
  price: number;
  image: string;
  code?: string;
  availability?: string;
}

export async function addToCart(
  item: CartAddPayload,
  quantity = 1,
): Promise<CartItem> {
  const existing = cartStore.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cartStore.push({ ...item, quantity });
  }
  // Персист
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(30, cartStore.find((i) => i.id === item.id)!);
}

export async function updateCartItem(
  id: string,
  delta: number,
): Promise<void> {
  const item = cartStore.find((i) => i.id === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(30, undefined);
}

export async function removeFromCart(id: string): Promise<void> {
  const idx = cartStore.findIndex((i) => i.id === id);
  if (idx !== -1) cartStore.splice(idx, 1);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(cartStore));
  }
  return delay(30, undefined);
}
