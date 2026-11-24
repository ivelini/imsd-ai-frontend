/**
 * Снимок созданного заказа для страницы успеха.
 * Суммы и позиции — из ответа сервера, подписи — из справочника, который видел
 * пользователь: машинные коды на экран не переводятся.
 */
import type {
  CheckoutDraft,
  CheckoutReference,
  DeliveryAddress,
  OrderDto,
  OrderSnapshot,
} from "@/features/checkout/types";

export function buildOrderSnapshot(
  order: OrderDto,
  draft: CheckoutDraft,
  reference: CheckoutReference,
): OrderSnapshot {
  return {
    id: String(order.id),
    createdAt: order.created_at ?? "",
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      total: item.total,
    })),
    subtotal: order.subtotal,
    deliveryCost: order.delivery_cost,
    total: order.total,
    customer: { name: draft.customerName, phone: draft.phone, email: draft.email },
    deliveryLabel: findLabel(reference.delivery, draft.deliveryType),
    paymentLabel: findLabel(reference.payment, draft.paymentMethod),
    pickupAddress: draft.deliveryType === "pickup" ? draft.pickupPointAddress : null,
    deliveryAddress: draft.deliveryType === "pickup" ? null : formatAddress(draft.deliveryAddress),
  };
}

function findLabel(options: { value: string; label: string }[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

/** Адрес курьера одной строкой; пустые части не оставляют лишних запятых. */
export function formatAddress(address: DeliveryAddress | null): string | null {
  if (address === null) return null;

  const street = [address.street.trim(), address.house.trim()].filter(Boolean).join(" ");
  const apartment = address.apartment.trim() === "" ? "" : `кв. ${address.apartment.trim()}`;

  return [address.city.trim(), street, apartment].filter(Boolean).join(", ");
}
