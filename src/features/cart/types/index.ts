// Типы корзины: строка корзины — из ответа GET /api/cart (рубли числами)

/** Тип позиции в API: только товары каталога (услуги записи в корзину не попадают). */
export type CartItemType = "tire" | "wheel";

export interface CartItem {
  /** id строки корзины: по нему PATCH/DELETE */
  id: string;
  /** id товара на бэке: по нему кнопки «Купить» находят позицию */
  itemableId: string;
  itemableType: CartItemType;
  name: string;
  brandName: string | null;
  /** Цена города за штуку; null — цены нет, позиция недоступна */
  price: number | null;
  total: number | null;
  quantity: number;
  available: boolean;
  countInStock: number | null;
  /** В ответе корзины картинки нет — единая заглушка витрины */
  image: string;
}

export interface CartView {
  id: string;
  city: string;
  items: CartItem[];
  subtotal: number;
}
