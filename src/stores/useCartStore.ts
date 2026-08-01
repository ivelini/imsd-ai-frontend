// Корзина: товары, количество, суммы (фаза 1)
// Фаза 1: работает с моками напрямую; при API — через features/cart/api
import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  remove: (id: string) => void;
  changeQuantity: (id: string, delta: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [
    {
      id: "cart-demo-1",
      name: "Шина Viatti V-130 Strada Asimmetrico 185/60 R15 84H летняя",
      price: 10100,
      quantity: 4,
      image: "/assets/img/wheel-product.png",
    },
  ],
  add: (item, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity }] };
    }),
  remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  changeQuantity: (id, delta) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0),
    })),
  clear: () => set({ items: [] }),
}));

// Селекторы: количество позиций и сумма (для счётчика в шапке)
export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
