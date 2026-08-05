// Типы корзины (03.08.2026)

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  /** Код товара (мокап: «Код товара: АА-00075632») — есть не у всех позиций */
  code?: string;
  /** Наличие (мокап: «>12 шт.») */
  availability?: string;
}
