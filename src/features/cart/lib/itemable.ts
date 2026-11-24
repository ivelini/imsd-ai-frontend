// Правило «товар каталога → позиция корзины»: тип для API и поиск строки по товару
import type { CartItem, CartItemType } from "@/features/cart/types";

/** Ссылка на товар каталога — то, что знает кнопка вне корзины. */
export interface CartProductRef {
  itemableType: CartItemType;
  itemableId: string;
}

/** Категория витрины → тип позиции API; неизвестная категория — отказ, не дефолт. */
export function toItemableType(category: string): CartItemType {
  if (category === "tires") return "tire";
  if (category === "wheels") return "wheel";

  throw new Error(`Неизвестная категория товара: ${category}`);
}

/** Строка корзины для товара: id строки и id товара — разные числа. */
export function findCartItemByProduct(
  items: CartItem[],
  ref: CartProductRef,
): CartItem | undefined {
  return items.find(
    (item) => item.itemableType === ref.itemableType && item.itemableId === ref.itemableId,
  );
}
