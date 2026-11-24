// Cart: живая корзина гостя (GET/POST/PATCH/DELETE /api/cart), контракт —
// ../backend/documentations/api-maps/checkout-frontend.md, сверено с кодом 2026-11-24.
// Корзина одна на устройство, город влияет только на цены — он есть в каждом запросе.
import type { CartItem, CartItemType, CartView } from "@/features/cart/types";
import { CART_TOTAL_BENEFITS } from "@/data/cart";
import { PRODUCT_PLACEHOLDER } from "@/shared/lib/productImage";
import { browserDeviceId } from "@/shared/lib/deviceId";
import { cityQuery, delay } from "./base";
import { fetchJson, unwrapData } from "./http";

// ============================================================================
// DTO бэкенда
// ============================================================================

export interface CartItemBrandDto {
  id: number;
  name: string;
  slug: string | null;
}

/** Позиция корзины: цены — рубли числами; null — цены города нет, позиция недоступна. */
export interface CartItemDto {
  id: number;
  itemable_type: CartItemType;
  itemable_id: number;
  name: string;
  slug: string | null;
  brand: CartItemBrandDto | null;
  quantity: number;
  unit_price: number | null;
  total: number | null;
  available: boolean;
  delivery: { delivery_min: number; delivery_max: number } | null;
  count_in_stock: number | null;
}

export interface CartDto {
  id: number;
  city: { id: number; name: string };
  items: CartItemDto[];
  subtotal: number;
}

/** Что добавить: тип товара (tire/wheel) и его id на бэке. */
export interface CartAddItemInput {
  itemableType: CartItemType;
  itemableId: string;
  quantity: number;
}

// ============================================================================
// Адаптер DTO → строка корзины
// ============================================================================

function toCartItem(dto: CartItemDto): CartItem {
  return {
    id: String(dto.id),
    itemableId: String(dto.itemable_id),
    itemableType: dto.itemable_type,
    name: dto.name,
    brandName: dto.brand?.name ?? null,
    price: dto.unit_price,
    total: dto.total,
    quantity: dto.quantity,
    available: dto.available,
    countInStock: dto.count_in_stock,
    // В ответе корзины картинки нет — единая заглушка витрины
    image: PRODUCT_PLACEHOLDER,
  };
}

export function toCartView(dto: CartDto): CartView {
  return {
    id: String(dto.id),
    city: dto.city.name,
    items: dto.items.map(toCartItem),
    subtotal: dto.subtotal,
  };
}

// ============================================================================
// Запросы
// ============================================================================

function cartHeaders(): HeadersInit {
  return { Accept: "application/json", "X-Device-Id": browserDeviceId() };
}

function jsonHeaders(): HeadersInit {
  return { ...cartHeaders(), "Content-Type": "application/json" };
}

/** Город в теле, если он известен: без него бэк возьмёт город по умолчанию. */
function withCity(fields: Record<string, unknown>, city: string): string {
  return JSON.stringify(city === "" ? fields : { ...fields, city });
}

export async function getCart(city: string): Promise<CartView> {
  const body = await fetchJson(`/cart${cityQuery(city)}`, { headers: cartHeaders() });

  return toCartView(unwrapData<CartDto>(body));
}

export async function addCartItem(input: CartAddItemInput, city: string): Promise<CartView> {
  const body = await fetchJson("/cart/items", {
    method: "POST",
    headers: jsonHeaders(),
    body: withCity(
      {
        itemable_type: input.itemableType,
        itemable_id: Number(input.itemableId),
        quantity: input.quantity,
      },
      city,
    ),
  });

  return toCartView(unwrapData<CartDto>(body));
}

export async function updateCartItemQuantity(
  lineId: string,
  quantity: number,
  city: string,
): Promise<CartView> {
  const body = await fetchJson(`/cart/items/${lineId}`, {
    method: "PATCH",
    headers: jsonHeaders(),
    body: withCity({ quantity }, city),
  });

  return toCartView(unwrapData<CartDto>(body));
}

export async function removeCartItem(lineId: string, city: string): Promise<CartView> {
  const body = await fetchJson(`/cart/items/${lineId}${cityQuery(city)}`, {
    method: "DELETE",
    headers: cartHeaders(),
  });

  return toCartView(unwrapData<CartDto>(body));
}

// ============================================================================
// Мок: бенефиты под итогом (контракта в API нет — задача бэка)
// ============================================================================

export async function getCartTotalInfo(): Promise<{ benefits: string[] }> {
  return delay(30, { benefits: [...CART_TOTAL_BENEFITS] });
}
